import { performOdometerOCR, PreprocessDebugSteps } from './ocr';
import { setupCropperInstance, getCroppedNativeCanvas, destroyCropper } from './cropperManager';

let selectedFile: File | null = null;

export function getSelectedFile(): File | null {
  return selectedFile;
}

export function initFileHandlers(onOdometerDetected: (value: string) => void): void {
  const btnGallery = document.getElementById('btnGallery') as HTMLButtonElement | null;
  const btnCamera = document.getElementById('btnCamera') as HTMLButtonElement | null;
  const inputGallery = document.getElementById('inputGallery') as HTMLInputElement | null;
  const inputCamera = document.getElementById('inputCamera') as HTMLInputElement | null;
  const btnCropScan = document.getElementById('btnCropScan') as HTMLButtonElement | null;

  btnGallery?.addEventListener('click', () => inputGallery?.click());
  btnCamera?.addEventListener('click', () => inputCamera?.click());

  inputGallery?.addEventListener('change', () => {
    if (inputGallery.files && inputGallery.files.length > 0) {
      if (inputCamera) inputCamera.value = '';
      onFileChosen(inputGallery.files[0]);
    }
  });

  inputCamera?.addEventListener('change', () => {
    if (inputCamera.files && inputCamera.files.length > 0) {
      if (inputGallery) inputGallery.value = '';
      onFileChosen(inputCamera.files[0]);
    }
  });

  btnCropScan?.addEventListener('click', () => processCropAndScan(onOdometerDetected));
}

function onFileChosen(file: File): void {
  resetFileUI();
  selectedFile = file;
  
  const fileNameDisplay = document.getElementById('fileNameDisplay') as HTMLParagraphElement | null;
  const previewContainer = document.getElementById('previewContainer') as HTMLDivElement | null;
  const cropperWrapper = document.getElementById('cropperWrapper') as HTMLDivElement | null;
  const ocrStatus = document.getElementById('ocrStatus') as HTMLParagraphElement | null;

  if (fileNameDisplay) fileNameDisplay.innerText = `Selected: ${file.name}`;

  if (cropperWrapper && previewContainer) {
    previewContainer.style.display = 'block';
    setupCropperInstance(cropperWrapper, file, (msg) => {
      if (ocrStatus) ocrStatus.innerText = msg;
    });
  }
}

async function processCropAndScan(onOdometerDetected: (value: string) => void): Promise<void> {
  const ocrStatus = document.getElementById('ocrStatus') as HTMLParagraphElement | null;

  const nativeCanvas = await getCroppedNativeCanvas();
  if (!nativeCanvas) return;

  renderCroppedPreview(nativeCanvas);

  if (ocrStatus) ocrStatus.innerText = 'Scanning digits...';

  const { text, debugSteps } = await performOdometerOCR(nativeCanvas);

  renderIntermediateSteps(debugSteps);

  if (text) {
    if (ocrStatus) ocrStatus.innerText = `Extracted digits: ${text}`;
    onOdometerDetected(text);
  } else {
    if (ocrStatus) ocrStatus.innerText = '⚠️ Could not clearly read numbers. Try cropping tighter around the digits.';
  }
}

function renderCroppedPreview(croppedCanvas: HTMLCanvasElement): void {
  const previewContainer = document.getElementById('croppedPreviewContainer');
  const previewWrapper = document.getElementById('croppedPreviewWrapper');

  if (previewContainer && previewWrapper) {
    previewWrapper.innerHTML = '';
    const img = document.createElement('img');
    img.src = croppedCanvas.toDataURL('image/png');
    img.style.maxWidth = '100%';
    img.style.height = 'auto';
    img.style.display = 'block';
    
    previewWrapper.appendChild(img);
    previewContainer.style.display = 'block';
  }
}

function renderIntermediateSteps(debugSteps: PreprocessDebugSteps): void {
  const debugContainer = document.getElementById('debugOcrContainer');
  const debugWrapper = document.getElementById('debugOcrWrapper');
  const targetEl = debugWrapper || debugContainer;

  if (debugContainer && targetEl) {
    targetEl.innerHTML = '';

    // Set flex container to stack vertically
    targetEl.style.display = 'flex';
    targetEl.style.flexDirection = 'column';
    targetEl.style.gap = '12px';

    debugSteps.forEach((step) => {
      const stepBox = document.createElement('div');
      stepBox.style.width = '100%';
      stepBox.style.boxSizing = 'border-box';

      const label = document.createElement('p');
      label.innerText = step.title;
      label.style.fontSize = '0.8rem';
      label.style.margin = '0 0 4px 0';
      label.style.fontWeight = 'bold';
      label.style.color = '#444';
      label.style.textAlign = 'left';

      const img = document.createElement('img');
      img.src = step.canvas.toDataURL('image/png');
      img.style.width = '100%';
      img.style.display = 'block';
      img.style.border = '1px solid #999';
      img.style.borderRadius = '4px';
      img.style.background = '#fff';

      stepBox.appendChild(label);
      stepBox.appendChild(img);
      targetEl.appendChild(stepBox);
    });

    debugContainer.style.display = 'block';
  }
}

export function resetFileUI(): void {
  selectedFile = null;
  destroyCropper();

  const previewContainer = document.getElementById('previewContainer') as HTMLDivElement | null;
  const cropperWrapper = document.getElementById('cropperWrapper') as HTMLDivElement | null;
  const fileNameDisplay = document.getElementById('fileNameDisplay') as HTMLParagraphElement | null;
  const ocrStatus = document.getElementById('ocrStatus') as HTMLParagraphElement | null;
  const croppedPreviewContainer = document.getElementById('croppedPreviewContainer') as HTMLDivElement | null;
  const debugOcrContainer = document.getElementById('debugOcrContainer') as HTMLDivElement | null;
  const odometer = document.getElementById('odometer') as HTMLInputElement | null;

  if (cropperWrapper) cropperWrapper.innerHTML = '';
  if (previewContainer) previewContainer.style.display = 'none';
  if (croppedPreviewContainer) croppedPreviewContainer.style.display = 'none';
  if (debugOcrContainer) debugOcrContainer.style.display = 'none';
  if (fileNameDisplay) fileNameDisplay.innerText = 'No photo selected';
  if (ocrStatus) ocrStatus.innerText = '';
  if (odometer) odometer.value = '';
}