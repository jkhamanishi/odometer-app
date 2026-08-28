type Segment = 'top' | 'topLeft' | 'topRight' | 'middle' | 'bottomLeft' | 'bottomRight' | 'bottom';

const segments: Segment[] = [
  'top',
  'topLeft',
  'topRight',
  'middle',
  'bottomLeft',
  'bottomRight',
  'bottom',
];

const digitMasks: Record<string, Set<Segment>> = {
  '0': new Set(['top', 'topLeft', 'topRight', 'bottomLeft', 'bottomRight', 'bottom']),
  '1': new Set(['topRight', 'bottomRight']),
  '2': new Set(['top', 'topRight', 'middle', 'bottomLeft', 'bottom']),
  '3': new Set(['top', 'topRight', 'middle', 'bottomRight', 'bottom']),
  '4': new Set(['topLeft', 'topRight', 'middle', 'bottomRight']),
  '5': new Set(['top', 'topLeft', 'middle', 'bottomRight', 'bottom']),
  '6': new Set(['top', 'topLeft', 'middle', 'bottomLeft', 'bottomRight', 'bottom']),
  '7': new Set(['top', 'topRight', 'bottomRight']),
  '8': new Set(segments),
  '9': new Set(['top', 'topLeft', 'topRight', 'middle', 'bottomRight', 'bottom']),
};

interface Bounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

interface SegmentSample {
  x: number;
  y: number;
  width: number;
  height: number;
}

const sampleAreas: Record<Segment, SegmentSample> = {
  top: { x: 0.2, y: 0.05, width: 0.6, height: 0.14 },
  topLeft: { x: 0.12, y: 0.2, width: 0.24, height: 0.2 },
  topRight: { x: 0.64, y: 0.2, width: 0.24, height: 0.2 },
  middle: { x: 0.2, y: 0.43, width: 0.6, height: 0.14 },
  bottomLeft: { x: 0.12, y: 0.6, width: 0.24, height: 0.2 },
  bottomRight: { x: 0.64, y: 0.6, width: 0.24, height: 0.2 },
  bottom: { x: 0.2, y: 0.81, width: 0.6, height: 0.14 },
};

const segmentThresholds: Record<Segment, number> = {
  top: 0.2,
  topLeft: 0.1,
  topRight: 0.1,
  middle: 0.2,
  bottomLeft: 0.1,
  bottomRight: 0.1,
  bottom: 0.2,
};

function findBounds(data: Uint8ClampedArray, width: number, height: number): Bounds | null {
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4] < 128) {
        left = Math.min(left, x);
        top = Math.min(top, y);
        right = Math.max(right, x);
        bottom = Math.max(bottom, y);
      }
    }
  }

  return right === -1 ? null : { left, top, right, bottom };
}

function findDigitBounds(data: Uint8ClampedArray, width: number, bounds: Bounds): Bounds[] {
  const columnDarkness: number[] = [];
  for (let x = bounds.left; x <= bounds.right; x++) {
    let darkPixels = 0;
    for (let y = bounds.top; y <= bounds.bottom; y++) {
      if (data[(y * width + x) * 4] < 128) {
        darkPixels++;
      }
    }
    columnDarkness.push(darkPixels / (bounds.bottom - bounds.top + 1));
  }

  const totalWidth = bounds.right - bounds.left + 1;
  const totalHeight = bounds.bottom - bounds.top + 1;
  const likelyDigitWidth = totalHeight * 0.68;
  const maximumDigitCount = Math.min(12, Math.max(1, Math.floor(totalWidth / (totalHeight * 0.35))));

  function splitAtValleys(digitCount: number): { boundaries: number[]; score: number } {
    const boundaries: number[] = [bounds.left];
    const averageDigitWidth = totalWidth / digitCount;
    let valleyScore = 0;

    for (let digitIndex = 1; digitIndex < digitCount; digitIndex++) {
      const expectedBoundary = Math.round(digitIndex * averageDigitWidth);
      const searchRadius = Math.max(2, Math.round(averageDigitWidth * 0.35));
      const searchStart = Math.max(1, expectedBoundary - searchRadius);
      const searchEnd = Math.min(totalWidth - 1, expectedBoundary + searchRadius);
      let valley = searchStart;

      for (let index = searchStart + 1; index <= searchEnd; index++) {
        if (columnDarkness[index] < columnDarkness[valley]) valley = index;
      }

      boundaries.push(bounds.left + valley);
      valleyScore += columnDarkness[valley];
    }
    boundaries.push(bounds.right + 1);

    const widthPenalty = Math.abs(averageDigitWidth - likelyDigitWidth) / totalHeight;
    const averageValleyScore = digitCount > 1 ? valleyScore / (digitCount - 1) : 0;
    return { boundaries, score: averageValleyScore + widthPenalty * 0.35 };
  }

  let bestSplit = splitAtValleys(1);
  for (let digitCount = 2; digitCount <= maximumDigitCount; digitCount++) {
    const split = splitAtValleys(digitCount);
    if (split.score < bestSplit.score) bestSplit = split;
  }

  return bestSplit.boundaries.slice(0, -1).map((left, index) => ({
    left,
    top: bounds.top,
    right: bestSplit.boundaries[index + 1] - 1,
    bottom: bounds.bottom,
  }));
}

function sampleSegment(
  data: Uint8ClampedArray,
  canvasWidth: number,
  digit: Bounds,
  area: SegmentSample,
  threshold: number,
): boolean {
  const digitWidth = digit.right - digit.left + 1;
  const digitHeight = digit.bottom - digit.top + 1;
  const left = digit.left + Math.floor(area.x * digitWidth);
  const top = digit.top + Math.floor(area.y * digitHeight);
  const right = Math.min(digit.right, left + Math.max(1, Math.floor(area.width * digitWidth)) - 1);
  const bottom = Math.min(digit.bottom, top + Math.max(1, Math.floor(area.height * digitHeight)) - 1);
  let darkPixels = 0;
  let totalPixels = 0;

  for (let y = top; y <= bottom; y++) {
    for (let x = left; x <= right; x++) {
      totalPixels++;
      if (data[(y * canvasWidth + x) * 4] < 128) darkPixels++;
    }
  }

  return totalPixels > 0 && darkPixels / totalPixels >= threshold;
}

function classify(mask: Set<Segment>): string {
  let bestDigit = '';
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const [digit, expected] of Object.entries(digitMasks)) {
    const distance = segments.reduce(
      (total, segment) => total + Number(mask.has(segment) !== expected.has(segment)),
      0,
    );
    if (distance < bestDistance) {
      bestDigit = digit;
      bestDistance = distance;
    }
  }

  return bestDigit;
}

export function recognizeSevenSegmentDigits(processedCanvas: HTMLCanvasElement): string {
  const context = processedCanvas.getContext('2d', { willReadFrequently: true });
  if (!context || processedCanvas.width === 0 || processedCanvas.height === 0) return '';

  const imageData = context.getImageData(0, 0, processedCanvas.width, processedCanvas.height);
  const bounds = findBounds(imageData.data, processedCanvas.width, processedCanvas.height);
  if (!bounds) return '';

  return findDigitBounds(imageData.data, processedCanvas.width, bounds)
    .map((digit) => {
      const mask = new Set<Segment>();
      for (const segment of segments) {
        if (sampleSegment(
          imageData.data,
          processedCanvas.width,
          digit,
          sampleAreas[segment],
          segmentThresholds[segment],
        )) mask.add(segment);
      }
      return classify(mask);
    })
    .join('');
}