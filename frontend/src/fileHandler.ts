import { processImage, recognizeDigits, ProcessDebugSteps } from './imageProcessing';
import { setupCropperInstance, getCroppedNativeCanvas, destroyCropper } from './cropperManager';
import exifr from 'exifr';

let selectedFile: File | null = null;

export function getSelectedFile(): File | null {
  return selectedFile;
}

export function initFileHandlers(onOdometerDetected: (value: string) => void): void {
  const btnGallery = document.getElementById('btnGallery') as HTMLButtonElement | null;
  const btnCamera = document.getElementById('btnCamera') as HTMLButtonElement | null;
  const inputGallery = document.getElementById('inputGallery') as HTMLInputElement | null;
  const inputCamera = document.getElementById('inputCamera') as HTMLInputElement | null;
  const btnAnalyze = document.getElementById('btnAnalyze') as HTMLButtonElement | null;

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

  btnAnalyze?.addEventListener('click', () => analyzeImage(onOdometerDetected));
}

async function analyzeImage(onOdometerDetected: (value: string) => void): Promise<void> {
  const ocrStatus = document.getElementById('ocrStatus') as HTMLParagraphElement | null;
  const canvas = await getCroppedNativeCanvas();
  if (!canvas) {
    if (ocrStatus) ocrStatus.innerText = '⚠️ Drag a selection over the digits first.';
    return;
  }

  renderCroppedPreview(canvas);
  hideIntermediateSteps();
  hideProcessedPreview();
  hideProcessingDetails();

  const btnAnalyze = document.getElementById('btnAnalyze') as HTMLButtonElement | null;
  const originalLabel = btnAnalyze?.innerText;

  if (btnAnalyze) {
    btnAnalyze.disabled = true;
    btnAnalyze.setAttribute('aria-busy', 'true');
  }
  if (ocrStatus) ocrStatus.innerText = 'Processing image...';

  // Run the pipeline in the next task so the status update can render first.
  await new Promise<void>((resolve) => setTimeout(resolve, 0));

  try {
    const { finalCanvas, debugSteps } = processImage(canvas);
    renderIntermediateSteps(debugSteps);
    renderProcessedPreview(finalCanvas);

    if (ocrStatus) ocrStatus.innerText = 'Scanning digits...';
    const text = await recognizeDigits(finalCanvas);

    if (text) {
      if (ocrStatus) ocrStatus.innerText = `Extracted digits: ${text}`;
      onOdometerDetected(text);
    } else {
      if (ocrStatus) ocrStatus.innerText = '⚠️ Could not clearly read numbers. Try cropping tighter around the digits.';
    }
  } finally {
    if (btnAnalyze) {
      btnAnalyze.innerText = originalLabel ?? '✨ Crop, Process & Read Image';
      btnAnalyze.removeAttribute('aria-busy');
      btnAnalyze.disabled = false;
    }
  }
}

function onFileChosen(file: File): void {
  resetFileUI();
  selectedFile = file;

  void populateReadingDateTime(file);
  
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

async function populateReadingDateTime(file: File): Promise<void> {
  const fallbackDate = new Date(file.lastModified);
  setReadingDateTime(fallbackDate);

  try {
    const metadata = await exifr.parse(file, { pick: ['DateTimeOriginal', 'CreateDate'] });
    const metadataDate = metadata?.DateTimeOriginal ?? metadata?.CreateDate;

    if (selectedFile !== file || !metadataDate) return;

    const parsedDate = metadataDate instanceof Date ? metadataDate : new Date(metadataDate);
    setReadingDateTime(parsedDate);
  } catch {
    // The file may not contain readable EXIF metadata; keep the modified date fallback.
  }
}

function setReadingDateTime(date: Date): void {
  if (Number.isNaN(date.getTime())) return;

  const readingDateInput = document.getElementById('readingDate') as HTMLInputElement | null;
  const readingTimeInput = document.getElementById('readingTime') as HTMLInputElement | null;

  if (readingDateInput) {
    readingDateInput.value = [date.getFullYear(), date.getMonth() + 1, date.getDate()]
      .map((value, index) => index === 0 ? String(value).padStart(4, '0') : String(value).padStart(2, '0'))
      .join('-');
  }

  if (readingTimeInput) {
    readingTimeInput.value = [date.getHours(), date.getMinutes()]
      .map((value) => String(value).padStart(2, '0'))
      .join(':');
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
    const processingDetails = document.getElementById('imageProcessingDetails') as HTMLDetailsElement | null;
    if (processingDetails) processingDetails.style.display = 'block';
  }
}

function hideProcessingDetails(): void {
  const processingDetails = document.getElementById('imageProcessingDetails') as HTMLDetailsElement | null;

  if (processingDetails) {
    processingDetails.open = false;
    processingDetails.style.display = 'none';
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
  destroyCropper();

  hideIntermediateSteps();
  hideProcessedPreview();

  const previewContainer = document.getElementById('previewContainer') as HTMLDivElement | null;
  const cropperWrapper = document.getElementById('cropperWrapper') as HTMLDivElement | null;
  const fileNameDisplay = document.getElementById('fileNameDisplay') as HTMLParagraphElement | null;
  const ocrStatus = document.getElementById('ocrStatus') as HTMLParagraphElement | null;
  const croppedPreviewContainer = document.getElementById('croppedPreviewContainer') as HTMLDivElement | null;
  const debugOcrContainer = document.getElementById('debugOcrContainer') as HTMLDetailsElement | null;
  const odometer = document.getElementById('odometer') as HTMLInputElement | null;

  if (cropperWrapper) cropperWrapper.innerHTML = '';
  if (previewContainer) previewContainer.style.display = 'none';
  if (croppedPreviewContainer) croppedPreviewContainer.style.display = 'none';
  if (debugOcrContainer) debugOcrContainer.style.display = 'none';
  hideProcessingDetails();
  if (fileNameDisplay) fileNameDisplay.innerText = 'No photo selected';
  if (ocrStatus) ocrStatus.innerText = '';
  if (odometer) odometer.value = '';
}