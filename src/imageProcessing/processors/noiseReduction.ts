import { Processor } from "./processor";

export function reduceNoise(
  ctx: CanvasRenderingContext2D,
  sourceImageData: ImageData,
  width: number,
  height: number,
  minArea = 800
): ImageData {
  ctx.putImageData(sourceImageData, 0, 0);
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const visited = new Uint8Array(width * height);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixelIdx = y * width + x;
      if (data[pixelIdx * 4] < 128 && !visited[pixelIdx]) {
        const component: number[] = [];
        const queue: number[] = [pixelIdx];
        visited[pixelIdx] = 1;
        
        while (queue.length > 0) {
          const curr = queue.pop()!;
          component.push(curr);
          
          const cx = curr % width;
          const cy = Math.floor(curr / width);
          const neighbors = [
            cy > 0 ? (cy - 1) * width + cx : -1,
            cy < height - 1 ? (cy + 1) * width + cx : -1,
            cx > 0 ? cy * width + (cx - 1) : -1,
            cx < width - 1 ? cy * width + (cx + 1) : -1,
          ];
          
          for (const nIdx of neighbors) {
            if (nIdx !== -1 && !visited[nIdx] && data[nIdx * 4] < 128) {
              visited[nIdx] = 1;
              queue.push(nIdx);
            }
          }
        }
        
        if (component.length < minArea) {
          for (const idx of component) {
            const dIdx = idx * 4;
            data[dIdx] = 255;
            data[dIdx + 1] = 255;
            data[dIdx + 2] = 255;
          }
        }
      }
    }
  }
  
  return imgData;
}

export class NoiseReducer extends Processor {
  process() {
    const sourceImgData = this.source.imgData;
    const imgData = reduceNoise(this.ctx, sourceImgData, this.width, this.height);
    return this.createResult(imgData);
  }
}