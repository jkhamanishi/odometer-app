export function floodFillEdgeBlack(
  ctx: CanvasRenderingContext2D,
  sourceImageData: ImageData,
  width: number,
  height: number
): ImageData {
  ctx.putImageData(sourceImageData, 0, 0);
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const visited = new Uint8Array(width * height);
  const queue: number[] = [];

  const addSeed = (x: number, y: number) => {
    const pIdx = y * width + x;
    if (data[pIdx * 4] < 128 && !visited[pIdx]) {
      visited[pIdx] = 1;
      queue.push(pIdx);
    }
  };

  for (let x = 0; x < width; x++) {
    addSeed(x, 0);
    addSeed(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    addSeed(0, y);
    addSeed(width - 1, y);
  }

  while (queue.length > 0) {
    const curr = queue.pop()!;
    const dIdx = curr * 4;
    data[dIdx] = 255;
    data[dIdx + 1] = 255;
    data[dIdx + 2] = 255;

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

  return imgData;
}