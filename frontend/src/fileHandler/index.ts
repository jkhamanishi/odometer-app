import { analyzeImage } from './fileAnalysis';
import { onFileChosen } from './fileSelection';
import { getSelectedFile } from './fileState';
import { resetFileUI } from './fileReset';

export { getSelectedFile, resetFileUI };

export function initFileHandlers(): void {
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

  btnAnalyze?.addEventListener('click', analyzeImage);
}