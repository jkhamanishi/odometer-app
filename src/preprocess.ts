import { rescale } from './imageProcessing/rescale';
import { applyContrast } from './imageProcessing/applyContrast';
import { binarize } from './imageProcessing/binarize';
import { removeSmallIslands } from './imageProcessing/removeSmallIslands';
import { dilateDarkPixels } from './imageProcessing/dilateDarkPixels';
import { floodFillEdgeBlack } from './imageProcessing/floodFillEdgeBlack';
import { smooth } from './imageProcessing/smooth';

export interface DebugStep {
  title: string;
  canvas: HTMLCanvasElement;
}

export type PreprocessDebugSteps = DebugStep[];

export interface PreprocessResult {
  finalCanvas: HTMLCanvasElement;
  debugSteps: PreprocessDebugSteps;
}

/**
 * Creates canvas/context, passes them to a transform function, and commits ImageData.
 */
function runCanvasStep(
  width: number,
  height: number,
  transformFn: (ctx: CanvasRenderingContext2D, imgData: ImageData) => void | ImageData,
  fillWhite = false
): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; imgData: ImageData } {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

  if (fillWhite) {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
  }

  let imgData = ctx.getImageData(0, 0, width, height);
  const result = transformFn(ctx, imgData);

  if (result instanceof ImageData) {
    imgData = result;
    ctx.putImageData(imgData, 0, 0);
  } else {
    imgData = ctx.getImageData(0, 0, width, height);
  }

  return { canvas, ctx, imgData };
}

export function preprocessOdometerImage(sourceCanvas: HTMLCanvasElement): PreprocessResult {
  const scale = 3.0;
  const width = Math.round(sourceCanvas.width * scale);
  const height = Math.round(sourceCanvas.height * scale);

  const step1 = runCanvasStep(width, height, (ctx) =>
    rescale(ctx, sourceCanvas, width, height),
    true
  );

  const step2 = runCanvasStep(width, height, (_, imgData) =>
    applyContrast(imgData, 1.5)
  );

  const step3 = runCanvasStep(width, height, (_, imgData) =>
    binarize(imgData, width, height)
  );

  const step4 = runCanvasStep(width, height, (ctx, imgData) =>
    removeSmallIslands(ctx, imgData, width, height, 500)
  );

  const step5 = runCanvasStep(width, height, (ctx, imgData) =>
    dilateDarkPixels(ctx, imgData, width, height, 4)
  );

  const step6 = runCanvasStep(width, height, (ctx, imgData) =>
    floodFillEdgeBlack(ctx, imgData, width, height)
  );

  const step7 = runCanvasStep(width, height, (ctx) =>
    smooth(ctx, step6.canvas, width, height, 1.5, 190)
  );

  return {
    finalCanvas: step7.canvas,
    debugSteps: [
      { title: '1. Rescaled', canvas: step1.canvas },
      { title: '2. High Contrast', canvas: step2.canvas },
      { title: '3. Binarized', canvas: step3.canvas },
      { title: '4. Noise Removed', canvas: step4.canvas },
      { title: '5. Expanded Black', canvas: step5.canvas },
      { title: '6. Edge Artifacts Cleared', canvas: step6.canvas },
      { title: '7. Edge Smoothed', canvas: step7.canvas },
    ],
  };
}