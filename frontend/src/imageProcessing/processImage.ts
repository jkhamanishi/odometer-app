import * as process from './processors';
import { Dimensions, ProcessResult, ProcessorConstructor } from './processors/processor';

export type ProcessDebugSteps = ProcessResult[];

export interface FinalProcessResult {
  finalCanvas: HTMLCanvasElement;
  debugSteps: ProcessDebugSteps;
}

const pipeline: ProcessorConstructor[] = [
  process.Rescaler,
  process.Contrast,
  process.BinarySegmenter,
  process.NoiseReducer,
  process.PixelExpander,
  process.BlackEdgeFloodFiller,
  process.Smoother,
];

function scaleDimensions(dimensions: Dimensions, scale: number): Dimensions {
  return {
    width: Math.round(dimensions.width * scale),
    height: Math.round(dimensions.height * scale),
  };
}

function createInitialSource(canvas: HTMLCanvasElement): ProcessResult {
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return { canvas, ctx, imgData, title: '' };
}

function runProcess(
  steps: ProcessResult[],
  index: number,
  Processor: ProcessorConstructor,
  dimensions: Dimensions,
): void {
  const source = steps[index];
  const processor = new Processor(dimensions, source);
  const result = processor.process();
  const debugStep = { ...result, title: `${index}. ${result.title}` };
  steps.push(debugStep);
}

export function processImage(sourceCanvas: HTMLCanvasElement): FinalProcessResult {
  const scale = 3.0;
  const dim = scaleDimensions(sourceCanvas, scale);
  const initialSource = createInitialSource(sourceCanvas);
  const steps = [initialSource];
  
  pipeline.forEach((Processor, i) => runProcess(steps, i, Processor, dim));
  
  return {
    finalCanvas: steps.at(-1)!.canvas,
    debugSteps: steps.slice(1),
  };
}
