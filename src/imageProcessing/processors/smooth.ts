import { Processor } from "./processor";

export function smooth(
  ctx: CanvasRenderingContext2D,
  sourceCanvas: HTMLCanvasElement,
  width: number,
  height: number,
  blurRadius = 2.5,
  threshold = 190
): ImageData {
  ctx.filter = `blur(${blurRadius}px)`;
  ctx.drawImage(sourceCanvas, 0, 0);
  
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const val = data[i] < threshold ? 0 : 255;
    data[i]     = val;
    data[i + 1] = val;
    data[i + 2] = val;
    data[i + 3] = 255;
  }
  
  return imgData;
}

export class Smoother extends Processor {
  process() {
    const imgData = smooth(this.ctx, this.source.canvas, this.width, this.height);
    return this.createResult(imgData);
  }
}