import { processImage, recognizeDigits, ProcessDebugSteps } from './imageProcessing';
import { setupCropperInstance, getCroppedNativeCanvas, destroyCropper } from './cropperManager';

let selectedFile: File | null = null;
let croppedCanvas: HTMLCanvasElement | null = null;
let processedCanvas: HTMLCanvasElement | null = null;

export function getSelectedFile(): File | null {
  return selectedFile;
}

export function initFileHandlers(onOdometerDetected: (value: string) => void): void {
  const btnGallery = document.getElementById('btnGallery') as HTMLButtonElement | null;
  const btnCamera = document.getElementById('btnCamera') as HTMLButtonElement | null;
  const inputGallery = document.getElementById('inputGallery') as HTMLInputElement | null;
  const inputCamera = document.getElementById('inputCamera') as HTMLInputElement | null;
  const btnCrop = document.getElementById('btnCrop') as HTMLButtonElement | null;
  const btnProcess = document.getElementById('btnProcess') as HTMLButtonElement | null;
  const btnRead = document.getElementById('btnRead') as HTMLButtonElement | null;

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

  btnCrop?.addEventListener('click', cropSelection);
  btnProcess?.addEventListener('click', runProcessing);
  btnRead?.addEventListener('click', () => readProcessedImage(onOdometerDetected));
}

function setStageEnabled(id: string, enabled: boolean): void {
  const btn = document.getElementById(id) as HTMLButtonElement | null;
  if (btn) btn.disabled = !enabled;
}

async function cropSelection(): Promise<void> {
  const ocrStatus = document.getElementById('ocrStatus') as HTMLParagraphElement | null;

  const canvas = await getCroppedNativeCanvas();
  if (!canvas) {
    if (ocrStatus) ocrStatus.innerText = '⚠️ Drag a selection over the digits first.';
    return;
  }

  croppedCanvas = canvas;
  processedCanvas = null;

  renderCroppedPreview(canvas);
  hideIntermediateSteps();
  hideProcessedPreview();

  setStageEnabled('btnProcess', true);
  setStageEnabled('btnRead', false);

  if (ocrStatus) ocrStatus.innerText = '✂️ Cropped. Now process the image.';
}

async function runProcessing(): Promise<void> {
  const ocrStatus = document.getElementById('ocrStatus') as HTMLParagraphElement | null;
  if (!croppedCanvas) return;

  const btnProcess = document.getElementById('btnProcess') as HTMLButtonElement | null;
  const originalLabel = btnProcess?.innerText;

  if (btnProcess) {
    btnProcess.disabled = true;
    btnProcess.setAttribute('aria-busy', 'true');
  }
  if (ocrStatus) ocrStatus.innerText = 'Processing image...';

  // Run the pipeline in the next task so the status update can render first.
  await new Promise<void>((resolve) => setTimeout(resolve, 0));

  try {
    const { finalCanvas, debugSteps } = processImage(croppedCanvas);
    processedCanvas = finalCanvas;

    renderIntermediateSteps(debugSteps);
    renderProcessedPreview(finalCanvas);
    setStageEnabled('btnRead', true);

    if (ocrStatus) ocrStatus.innerText = '🎛️ Processed. Now read the image.';
  } finally {
    if (btnProcess) {
      btnProcess.innerText = originalLabel ?? '🎛️ 2. Process Image';
      btnProcess.removeAttribute('aria-busy');
      btnProcess.disabled = false;
    }
  }
}

async function readProcessedImage(onOdometerDetected: (value: string) => void): Promise<void> {
  const ocrStatus = document.getElementById('ocrStatus') as HTMLParagraphElement | null;
  if (!processedCanvas) return;

  if (ocrStatus) ocrStatus.innerText = 'Scanning digits...';

  const text = await recognizeDigits(processedCanvas);

  if (text) {
    if (ocrStatus) ocrStatus.innerText = `Extracted digits: ${text}`;
    onOdometerDetected(text);
  } else {
    if (ocrStatus) ocrStatus.innerText = '⚠️ Could not clearly read numbers. Try cropping tighter around the digits.';
  }
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

function renderProcessedPreview(finalCanvas: HTMLCanvasElement): void {
  const container = document.getElementById('processedPreviewContainer');
  const wrapper = document.getElementById('processedPreviewWrapper');

  if (container && wrapper) {
    wrapper.innerHTML = '';
    const img = document.createElement('img');
    img.src = finalCanvas.toDataURL('image/png');
    img.style.maxWidth = '100%';
    img.style.height = 'auto';
    img.style.display = 'block';

    wrapper.appendChild(img);
    container.style.display = 'block';
  }
}

function hideProcessedPreview(): void {
  const container = document.getElementById('processedPreviewContainer');
  const wrapper = document.getElementById('processedPreviewWrapper');

  if (wrapper) wrapper.innerHTML = '';
  if (container) container.style.display = 'none';
}

function hideIntermediateSteps(): void {
  const debugContainer = document.getElementById('debugOcrContainer') as HTMLDetailsElement | null;
  const debugWrapper = document.getElementById('debugOcrWrapper');

  if (debugWrapper) debugWrapper.innerHTML = '';
  if (debugContainer) {
    debugContainer.open = false;
    debugContainer.style.display = 'none';
  }
}

function renderIntermediateSteps(debugSteps: ProcessDebugSteps): void {
  const debugContainer = document.getElementById('debugOcrContainer') as HTMLDetailsElement | null;
  const debugWrapper = document.getElementById('debugOcrWrapper');

  if (!debugContainer || !debugWrapper) return;

  debugWrapper.innerHTML = '';

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
    debugWrapper.appendChild(stepBox);
  });

  debugContainer.open = false;
  debugContainer.style.display = 'block';
}

export function resetFileUI(): void {
  selectedFile = null;
  croppedCanvas = null;
  processedCanvas = null;
  destroyCropper();

  setStageEnabled('btnProcess', false);
  setStageEnabled('btnRead', false);
  hideIntermediateSteps();
  hideProcessedPreview();

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