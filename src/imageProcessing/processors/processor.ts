export interface ProcessResult {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  imgData: ImageData;
}

export type ProcessorConstructor = new (width: number, height: number, source: ProcessResult) => Processor;

export abstract class Processor {
  protected width: number;
  protected height: number;
  protected canvas: HTMLCanvasElement;
  protected ctx: CanvasRenderingContext2D;
  protected source: ProcessResult;
  
  constructor(width: number, height: number, source: ProcessResult) {
    this.width = width;
    this.height = height;
    this.canvas = this.createCanvas();
    this.ctx = this.getContext();
    this.source = source;
  }
  
  private createCanvas(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;
    return canvas;
  }
  
  private getContext(): CanvasRenderingContext2D {
    return this.canvas.getContext('2d', { willReadFrequently: true })!;
  }
  
  public abstract process(): ProcessResult;
  
  protected createResult(imgData: ImageData): ProcessResult {
    this.ctx.putImageData(imgData, 0, 0);
    return {
      canvas: this.canvas,
      ctx: this.ctx,
      imgData,
    };
  }
}
