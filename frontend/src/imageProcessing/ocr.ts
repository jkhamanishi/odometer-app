import { createWorker } from 'tesseract.js';
import enPath from '@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz?url';
import { processImage, ProcessDebugSteps, FinalProcessResult } from './processImage';

export type { ProcessDebugSteps as PreprocessDebugSteps, FinalProcessResult as PreprocessResult };

export interface OCRResult {
  text: string;
  processedCanvas: HTMLCanvasElement;
  debugSteps: ProcessDebugSteps;
}

export async function performOdometerOCR(
  croppedCanvas: HTMLCanvasElement
): Promise<OCRResult> {
  const { finalCanvas, debugSteps } = processImage(croppedCanvas);
  const text = await recognizeDigits(finalCanvas);

  return {
    text,
    processedCanvas: finalCanvas,
    debugSteps,
  };
}

export async function recognizeDigits(processedCanvas: HTMLCanvasElement): Promise<string> {
  const langPath = import.meta.env.DEV 
    ? new URL(enPath+"/..", import.meta.url).href 
    : undefined;

  const worker = await createWorker('eng', 1, { langPath });

  // cspell:words tessedit pageseg traineddata
  await worker.setParameters({
    tessedit_char_whitelist: '0123456789',
    tessedit_pageseg_mode: '7' as any,
  });

  const { data } = await worker.recognize(processedCanvas);
  await worker.terminate();

  return data.text.replace(/\D/g, '');
}