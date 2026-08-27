import { Processor } from "./processor";

export function binarySegmentation(sourceImageData: ImageData, width: number, height: number): ImageData {
  const data = sourceImageData.data;
  const numPixels = width * height;
  const grays = new Uint8Array(numPixels);
  
  let sum = 0;
  for (let i = 0; i < numPixels; i++) {
    const idx = i * 4;
    const g = Math.round(0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]);
    grays[i] = g;
    sum += g;
  }
  
  const threshold = (sum / numPixels) * 1.08;
  const output = new ImageData(width, height);
  const outData = output.data;
  
  for (let i = 0; i < numPixels; i++) {
    const idx = i * 4;
    const val = grays[i] < threshold ? 0 : 255;
    outData[idx] = val;
    outData[idx + 1] = val;
    outData[idx + 2] = val;
    outData[idx + 3] = 255;
  }
  
  return output;
}

export class BinarySegmenter extends Processor {
  process() {
    const sourceImgData = this.source.imgData;
    const imgData = binarySegmentation(sourceImgData, this.width, this.height);
    
    this.ctx.putImageData(imgData, 0, 0);
    return this.createResult(imgData);
  }
}