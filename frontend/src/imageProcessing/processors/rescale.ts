import { Processor } from "./processor";

export function rescale(
  ctx: CanvasRenderingContext2D,
  sourceCanvas: HTMLCanvasElement,
  width: number,
  height: number
): ImageData {
  ctx.drawImage(sourceCanvas, 0, 0, sourceCanvas.width, sourceCanvas.height, 0, 0, width, height);
  return ctx.getImageData(0, 0, width, height);
}

export class Rescaler extends Processor {
  resultLabel = "Rescaled";
  
  process() {
    const source = this.source.canvas;
    const rawCtx = this.ctx;
    
    rawCtx.fillStyle = '#FFFFFF';
    rawCtx.fillRect(0, 0, this.width, this.height);
    
    const imgData = rescale(rawCtx, source, this.width, this.height);
    
    return this.createResult(imgData);
  }
}
