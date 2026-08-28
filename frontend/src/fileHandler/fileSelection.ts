import { setupCropperInstance } from '../imageProcessing';
import { populateReadingDateTime } from './fileDateTime';
import { resetFileUI } from './fileReset';
import { setSelectedFile } from './fileState';

export function onFileChosen(file: File): void {
  resetFileUI();
  setSelectedFile(file);

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