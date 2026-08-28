import { Processor } from "./processor";

export function dilateDarkPixels(
  ctx: CanvasRenderingContext2D,
  sourceImageData: ImageData,
  width: number,
  height: number,
  radius = 5
): ImageData {
  ctx.putImageData(sourceImageData, 0, 0);
  if (radius <= 0) return sourceImageData;
  
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const copy = new Uint8Array(data);
  
  for (let y = radius; y < height - radius; y++) {
    for (let x = radius; x < width - radius; x++) {
      const idx = (y * width + x) * 4;
      if (copy[idx] > 128) {
        let hasBlackNearby = false;
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            if (copy[((y + dy) * width + (x + dx)) * 4] < 128) {
              hasBlackNearby = true;
              break;
            }
          }
          if (hasBlackNearby) break;
        }
        if (hasBlackNearby) {
          data[idx] = 0;
          data[idx + 1] = 0;
          data[idx + 2] = 0;
        }
      }
    }
  }
  
  return imgData;
}

export class PixelExpander extends Processor {
  resultLabel = "Expanded Black";
  
  process() {
    const sourceImgData = this.source.imgData;
    const imgData = dilateDarkPixels(this.ctx, sourceImgData, this.width, this.height);
    return this.createResult(imgData);
  }
}