import { createWorker } from 'tesseract.js';
import { preprocessOdometerImage, PreprocessDebugSteps, PreprocessResult } from './imageProcessor';

export type { PreprocessDebugSteps, PreprocessResult };

export interface OCRResult {
  text: string;
  processedCanvas: HTMLCanvasElement;
  debugSteps: PreprocessDebugSteps;
}

export async function performOdometerOCR(
  croppedCanvas: HTMLCanvasElement
): Promise<OCRResult> {
  const { finalCanvas, debugSteps }: PreprocessResult = preprocessOdometerImage(croppedCanvas);

  const worker = await createWorker('eng');
  await worker.setParameters({
    tessedit_char_whitelist: '0123456789',
    tessedit_pageseg_mode: '7' as any,
  });

  const { data } = await worker.recognize(finalCanvas);
  await worker.terminate();

  const extractedDigits = data.text.replace(/\D/g, '');

  return {
    text: extractedDigits,
    processedCanvas: finalCanvas,
    debugSteps,
  };
}