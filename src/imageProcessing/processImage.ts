import * as process from './processors';
import { ProcessResult, ProcessorConstructor } from './processors/processor';

export interface DebugStep extends ProcessResult {
  title: string;
}

export type ProcessDebugSteps = DebugStep[];

export interface FinalProcessResult {
  finalCanvas: HTMLCanvasElement;
  debugSteps: ProcessDebugSteps;
}

interface Dimensions {
  width: number;
  height: number;
}

function scaleDimensions(dimensions: Dimensions, scale: number): Dimensions {
  return {
    width: Math.round(dimensions.width * scale),
    height: Math.round(dimensions.height * scale),
  };
}

/**
 * Creates canvas/context, passes them to a transform function, and commits ImageData.
 */
function runCanvasStep(
  title: string,
  Processor: ProcessorConstructor,
  source: ProcessResult,
  dimensions: Dimensions,
): DebugStep {
  const { width, height } = dimensions;
  const processor = new Processor(width, height, source);
  const result = processor.process();
  return { title, ...result };
}

export function processImage(sourceCanvas: HTMLCanvasElement): FinalProcessResult {
  const scale = 3.0;
  const dim = scaleDimensions(sourceCanvas, scale);
  const sourceCtx = sourceCanvas.getContext('2d', { willReadFrequently: true })!;
  const sourceImg = sourceCtx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
  
  const initialSource: ProcessResult = {
    canvas: sourceCanvas,
    ctx: sourceCtx,
    imgData: sourceImg,
  };
  
  const step1 = runCanvasStep('1. Rescaled', process.Rescaler, initialSource, dim);
  const step2 = runCanvasStep('2. High Contrast', process.Contrast, step1, dim);
  const step3 = runCanvasStep('3. Binary Segmented', process.BinarySegmenter, step2, dim);
  const step4 = runCanvasStep('4. Noise Removed', process.NoiseReducer, step3, dim);
  const step5 = runCanvasStep('5. Expanded Black', process.PixelExpander, step4, dim);
  const step6 = runCanvasStep('6. Edge Artifacts Cleared', process.BlackEdgeFloodFiller, step5, dim);
  const step7 = runCanvasStep('7. Edge Smoothed', process.Smoother, step6, dim);
  
  return {
    finalCanvas: step7.canvas,
    debugSteps: [
      step1,
      step2,
      step3,
      step4,
      step5,
      step6,
      step7,
    ],
  };
}