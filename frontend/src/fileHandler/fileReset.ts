import { destroyCropper } from '../imageProcessing';
import { setSelectedFile } from './fileState';
import { hideAllProcessingPreviews } from './filePreviewHiding';

export function resetFileUI(): void {
  setSelectedFile(null);
  destroyCropper();

  hideAllProcessingPreviews();

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
  if (fileNameDisplay) fileNameDisplay.innerText = 'No photo selected';
  if (ocrStatus) ocrStatus.innerText = '';
  if (odometer) odometer.value = '';
}