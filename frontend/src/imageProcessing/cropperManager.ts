let activeCanvas: HTMLCanvasElement | null = null;
let imageObj: HTMLImageElement | null = null;

// Selection box state in normalized coordinates (0.0 to 1.0)
let cropBox = { x: 0.35, y: 0.53, width: 0.45, height: 0.08 };
let isDragging = false;
let startX = 0;
let startY = 0;

export function setupCropperInstance(
  container: HTMLDivElement, 
  file: File, 
  onReadyMessage?: (msg: string) => void
): void {
  destroyCropper();
  container.innerHTML = '';

  const imageUrl = URL.createObjectURL(file);
  imageObj = new Image();
  imageObj.src = imageUrl;

  imageObj.onload = () => {
    const ratio = imageObj!.naturalWidth / imageObj!.naturalHeight;
    container.style.aspectRatio = `${ratio}`;
    container.style.maxWidth = `${ratio * 60}vh`;
    container.style.position = 'relative';

    activeCanvas = document.createElement('canvas');
    activeCanvas.width = imageObj!.naturalWidth;
    activeCanvas.height = imageObj!.naturalHeight;
    activeCanvas.style.width = '100%';
    activeCanvas.style.height = '100%';
    activeCanvas.style.display = 'block';

    container.appendChild(activeCanvas);

    // Initial box centered over bottom odometer display
    cropBox = { x: 0.35, y: 0.53, width: 0.45, height: 0.08 };
    drawCanvasOverlay();

    // Attach Unified Pointer Events for Touch + Mouse
    setupPointerHandlers(container);

    if (onReadyMessage) {
      onReadyMessage("📐 Touch and drag over the odometer digits, then tap 'Crop Selection'.");
    }
  };
}

function drawCanvasOverlay(): void {
  if (!activeCanvas || !imageObj) return;
  const ctx = activeCanvas.getContext('2d');
  if (!ctx) return;

  const w = activeCanvas.width;
  const h = activeCanvas.height;

  ctx.drawImage(imageObj, 0, 0, w, h);

  // Darken overlay outside selection
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, 0, w, h);

  const sx = cropBox.x * w;
  const sy = cropBox.y * h;
  const sw = cropBox.width * w;
  const sh = cropBox.height * h;

  // Render highlighted selection
  ctx.drawImage(imageObj, sx, sy, sw, sh, sx, sy, sw, sh);

  // Draw border
  ctx.strokeStyle = '#00ff66';
  ctx.lineWidth = Math.max(4, Math.round(w / 150));
  ctx.strokeRect(sx, sy, sw, sh);
}

function setupPointerHandlers(container: HTMLDivElement): void {
  const getPos = (e: PointerEvent) => {
    const rect = container.getBoundingClientRect();
    return {
      px: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
      py: Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))
    };
  };

  container.onpointerdown = (e: PointerEvent) => {
    isDragging = true;
    container.setPointerCapture(e.pointerId);

    const pos = getPos(e);
    startX = pos.px;
    startY = pos.py;
    cropBox.x = startX;
    cropBox.y = startY;
    cropBox.width = 0.01;
    cropBox.height = 0.01;

    drawCanvasOverlay();
  };

  container.onpointermove = (e: PointerEvent) => {
    if (!isDragging) return;

    const pos = getPos(e);
    cropBox.x = Math.min(startX, pos.px);
    cropBox.y = Math.min(startY, pos.py);
    cropBox.width = Math.abs(pos.px - startX);
    cropBox.height = Math.abs(pos.py - startY);

    drawCanvasOverlay();
  };

  const endDrag = (e: PointerEvent) => {
    if (isDragging) {
      isDragging = false;
      try {
        container.releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  container.onpointerup = endDrag;
  container.onpointercancel = endDrag;
}

export async function getCroppedNativeCanvas(): Promise<HTMLCanvasElement | null> {
  if (!imageObj || !activeCanvas) return null;

  const w = imageObj.naturalWidth;
  const h = imageObj.naturalHeight;

  const cropX = Math.round(cropBox.x * w);
  const cropY = Math.round(cropBox.y * h);
  const cropW = Math.round(cropBox.width * w);
  const cropH = Math.round(cropBox.height * h);

  if (cropW <= 0 || cropH <= 0) return null;

  const targetCanvas = document.createElement('canvas');
  targetCanvas.width = cropW;
  targetCanvas.height = cropH;

  const ctx = targetCanvas.getContext('2d');
  if (!ctx) return null;

  ctx.drawImage(imageObj, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

  return targetCanvas;
}

export function destroyCropper(): void {
  activeCanvas = null;
  imageObj = null;
}