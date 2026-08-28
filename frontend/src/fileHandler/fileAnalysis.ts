import { processImage, recognizeDigits, getCroppedNativeCanvas } from '../imageProcessing';
import { hideAllProcessingPreviews } from './filePreviewHiding';
import { renderCroppedPreview, renderIntermediateSteps, renderProcessedPreview } from './filePreviewRendering';

export async function analyzeImage(): Promise<void> {
  const ocrStatus = document.getElementById('ocrStatus') as HTMLParagraphElement | null;
  const odometerInput = document.getElementById('odometer') as HTMLInputElement | null;
  const canvas = await getCroppedNativeCanvas();
  if (!canvas) {
    if (ocrStatus) ocrStatus.innerText = '⚠️ Drag a selection over the digits first.';
    return;
  }

  renderCroppedPreview(canvas);
  hideAllProcessingPreviews();

  const btnAnalyze = document.getElementById('btnAnalyze') as HTMLButtonElement | null;
  const originalLabel = btnAnalyze?.innerText;

  if (btnAnalyze) {
    btnAnalyze.disabled = true;
    btnAnalyze.setAttribute('aria-busy', 'true');
  }
  if (ocrStatus) ocrStatus.innerText = 'Processing image...';

  await new Promise<void>((resolve) => setTimeout(resolve, 0));

  try {
    const { finalCanvas, debugSteps } = processImage(canvas);
    renderIntermediateSteps(debugSteps);
    renderProcessedPreview(finalCanvas);

    if (ocrStatus) ocrStatus.innerText = 'Scanning digits...';
    const text = await recognizeDigits(finalCanvas);

    if (text) {
      if (ocrStatus) ocrStatus.innerText = `Extracted digits: ${text}`;
      if (odometerInput) odometerInput.value = text;
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