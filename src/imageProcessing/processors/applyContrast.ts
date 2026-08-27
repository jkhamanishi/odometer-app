import { Processor } from "./processor";

export function applyContrast(sourceImageData: ImageData, contrast = 1.15): ImageData {
  const data = sourceImageData.data;
  const output = new ImageData(sourceImageData.width, sourceImageData.height);
  const outData = output.data;
  
  for (let i = 0; i < data.length; i += 4) {
    outData[i]     = Math.min(255, Math.max(0, (data[i] - 128) * contrast + 128));
    outData[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * contrast + 128));
    outData[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * contrast + 128));
    outData[i + 3] = data[i + 3];
  }
  
  return output;
}

export class Contrast extends Processor {
  process() {
    const imgData = applyContrast(this.source.imgData);
    
    this.ctx.putImageData(imgData, 0, 0);
    return this.createResult(imgData);
  }
}
