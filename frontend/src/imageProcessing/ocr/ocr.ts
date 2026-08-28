import { recognizeSevenSegmentDigits } from './sevenSegmentOcr';

export async function recognizeDigits(processedCanvas: HTMLCanvasElement): Promise<string> {
  return recognizeSevenSegmentDigits(processedCanvas);
}