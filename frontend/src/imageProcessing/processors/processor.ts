export interface ProcessResult {
  title: string;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  imgData: ImageData;
}

export interface Dimensions {
  width: number;
  height: number;
}

export type ProcessorConstructor = new (dimensions: Dimensions, source: ProcessResult) => Processor;

export abstract class Processor {
  abstract resultLabel: string;
  
  protected width: number;
  protected height: number;
  protected canvas: HTMLCanvasElement;
  protected ctx: CanvasRenderingContext2D;
  protected source: ProcessResult;
  
  constructor(dimensions: Dimensions, source: ProcessResult) {
    this.width = dimensions.width;
    this.height = dimensions.height;
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
      title: this.resultLabel,
      canvas: this.canvas,
      ctx: this.ctx,
      imgData,
    };
  }
}
