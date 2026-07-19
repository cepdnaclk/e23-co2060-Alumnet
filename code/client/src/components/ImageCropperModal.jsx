import { useState, useRef, useEffect, useCallback } from "react";
import { ZoomIn, ZoomOut, RotateCw, RefreshCw, X, Check } from "lucide-react";

export default function ImageCropperModal({ imageSrc, onCropComplete, onCancel }) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [previewUrl, setPreviewUrl] = useState("");
  const [imageLoaded, setImageLoaded] = useState(false);

  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  // Load image
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
      setZoom(1);
      setRotation(0);
      setOffset({ x: 0, y: 0 });
    };
  }, [imageSrc]);

  // Render main canvas and live preview
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img || !imageLoaded) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    // Clear
    ctx.clearRect(0, 0, width, height);

    ctx.save();

    // Center of canvas
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.translate(centerX + offset.x, centerY + offset.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // Calculate base draw size maintaining aspect ratio
    const imgAspect = img.width / img.height;
    let drawW = width;
    let drawH = height;

    if (imgAspect > 1) {
      drawW = height * imgAspect;
      drawH = height;
    } else {
      drawW = width;
      drawH = width / imgAspect;
    }

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    // Draw dark overlay outside circular crop region
    ctx.save();
    ctx.fillStyle = "rgba(15, 23, 42, 0.65)";
    ctx.fillRect(0, 0, width, height);

    // Cut out circle
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    const radius = Math.min(width, height) * 0.42;
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    // Circular stroke guide
    ctx.globalCompositeOperation = "source-over";
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
    ctx.stroke();
    ctx.restore();

    // Generate live preview for mini avatar
    generatePreview(img, offset, zoom, rotation, width, height, radius);
  }, [imageLoaded, zoom, rotation, offset]);

  const generatePreview = (img, offset, zoom, rotation, width, height, radius) => {
    const offscreen = document.createElement("canvas");
    const outputSize = 200;
    offscreen.width = outputSize;
    offscreen.height = outputSize;
    const pCtx = offscreen.getContext("2d");

    const scale = outputSize / (radius * 2);
    pCtx.save();
    pCtx.translate(outputSize / 2, outputSize / 2);
    pCtx.scale(scale, scale);

    const centerX = width / 2;
    const centerY = height / 2;
    pCtx.translate(offset.x, offset.y);
    pCtx.rotate((rotation * Math.PI) / 180);
    pCtx.scale(zoom, zoom);

    const imgAspect = img.width / img.height;
    let drawW = width;
    let drawH = height;
    if (imgAspect > 1) {
      drawW = height * imgAspect;
      drawH = height;
    } else {
      drawW = width;
      drawH = width / imgAspect;
    }

    pCtx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    pCtx.restore();

    setPreviewUrl(offscreen.toDataURL("image/png"));
  };

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Drag logic
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    setZoom((prev) => Math.min(Math.max(prev + delta, 0.8), 3.5));
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  };

  const handleCropSave = () => {
    const img = imageRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;

    const width = canvas.width;
    const height = canvas.height;
    const radius = Math.min(width, height) * 0.42;

    const exportCanvas = document.createElement("canvas");
    const finalSize = 500;
    exportCanvas.width = finalSize;
    exportCanvas.height = finalSize;
    const ctx = exportCanvas.getContext("2d");

    const scale = finalSize / (radius * 2);
    ctx.save();
    ctx.translate(finalSize / 2, finalSize / 2);
    ctx.scale(scale, scale);

    ctx.translate(offset.x, offset.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    const imgAspect = img.width / img.height;
    let drawW = width;
    let drawH = height;
    if (imgAspect > 1) {
      drawW = height * imgAspect;
      drawH = height;
    } else {
      drawW = width;
      drawH = width / imgAspect;
    }

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    exportCanvas.toBlob(
      (blob) => {
        if (blob) {
          const croppedDataUrl = exportCanvas.toDataURL("image/jpeg", 0.92);
          const file = new File([blob], `avatar_${Date.now()}.jpg`, {
            type: "image/jpeg",
          });
          onCropComplete(file, croppedDataUrl);
        }
      },
      "image/jpeg",
      0.92
    );
  };

  return (
    <div className="cropperModalOverlay" onClick={onCancel}>
      <style>{css}</style>
      <div
        className="cropperModalDialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="cropperHeader">
          <h3>Crop Profile Picture</h3>
          <button type="button" className="closeBtn" onClick={onCancel}>
            <X size={18} />
          </button>
        </div>

        <div className="cropperBody">
          <div className="canvasContainer">
            <canvas
              ref={canvasRef}
              width={340}
              height={340}
              className={`cropperCanvas ${isDragging ? "dragging" : ""}`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
            />
            <span className="canvasHint">Drag to position • Scroll to zoom</span>
          </div>

          <div className="cropperSidebar">
            <div className="previewSection">
              <label>Preview</label>
              <div className="previewCircle">
                {previewUrl ? (
                  <img src={previewUrl} alt="Crop preview" />
                ) : (
                  <div className="previewPlaceholder" />
                )}
              </div>
            </div>

            <div className="controlGroup">
              <label>Zoom ({Math.round(zoom * 100)}%)</label>
              <div className="zoomRow">
                <ZoomOut size={16} />
                <input
                  type="range"
                  min="0.8"
                  max="3.5"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                />
                <ZoomIn size={16} />
              </div>
            </div>

            <div className="toolButtons">
              <button
                type="button"
                className="toolBtn"
                onClick={() => setRotation((r) => (r + 90) % 360)}
                title="Rotate 90°"
              >
                <RotateCw size={15} /> Rotate
              </button>

              <button
                type="button"
                className="toolBtn"
                onClick={handleReset}
                title="Reset adjustments"
              >
                <RefreshCw size={15} /> Reset
              </button>
            </div>
          </div>
        </div>

        <div className="cropperFooter">
          <button type="button" className="cancelBtn" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="saveCropBtn" onClick={handleCropSave}>
            <Check size={16} /> Save & Apply
          </button>
        </div>
      </div>
    </div>
  );
}

const css = `
.cropperModalOverlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  animation: fadeIn 0.2s ease-out;
}

.cropperModalDialog {
  background: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 580px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.cropperHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.cropperHeader h3 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #0f172a;
}

.cropperHeader .closeBtn {
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.cropperHeader .closeBtn:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.cropperBody {
  display: flex;
  gap: 20px;
  padding: 24px;
  align-items: flex-start;
}

@media (max-width: 600px) {
  .cropperBody {
    flex-direction: column;
    align-items: center;
  }
}

.canvasContainer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.cropperCanvas {
  border-radius: 12px;
  cursor: grab;
  touch-action: none;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  background: #0f172a;
}

.cropperCanvas.dragging {
  cursor: grabbing;
}

.canvasHint {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}

.cropperSidebar {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

.previewSection {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.previewSection label,
.controlGroup label {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #64748b;
}

.previewCircle {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #2563eb;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
  background: #f8fafc;
}

.previewCircle img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.previewPlaceholder {
  width: 100%;
  height: 100%;
  background: #e2e8f0;
}

.controlGroup {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.zoomRow {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #64748b;
}

.zoomRow input[type="range"] {
  flex: 1;
  accent-color: #2563eb;
  cursor: pointer;
}

.toolButtons {
  display: flex;
  gap: 8px;
}

.toolBtn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #ffffff;
  color: #334155;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.toolBtn:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
  color: #0f172a;
}

.cropperFooter {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.cancelBtn {
  padding: 9px 18px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #475569;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.cancelBtn:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.saveCropBtn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 20px;
  border-radius: 8px;
  border: none;
  background: #2563eb;
  color: #ffffff;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  transition: all 0.15s ease;
}

.saveCropBtn:hover {
  background: #1d4ed8;
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}
`;
