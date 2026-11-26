'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import {
  UploadCloud,
  Download,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Maximize2,
  Square,
  RefreshCw,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  Ruler,
  Shapes,
  Code,
  Copy,
  Check,
  ShieldCheck,
  Scale,
  Scissors,
} from 'lucide-react';

type AspectMode = 'free' | '1:1' | '4:3' | '16:9' | '9:16' | 'passport' | 'visa' | 'signature';
type ShapeMask = 'rect' | 'circle' | 'rounded' | 'oval' | 'hexagon' | 'star' | 'heart';
type OutputFormat = 'image/png' | 'image/jpeg' | 'image/webp';
type DimensionUnit = 'px' | 'cm' | 'in';
type DevFramework = 'flutter' | 'angular';

function pxToUnit(px: number, unit: DimensionUnit, dpi: number): string {
  if (unit === 'px') return Math.round(px).toString();
  if (unit === 'cm') return ((px / dpi) * 2.54).toFixed(2);
  return (px / dpi).toFixed(2);
}

function unitToPx(val: number, unit: DimensionUnit, dpi: number): number {
  if (unit === 'px') return Math.round(val);
  if (unit === 'cm') return Math.round((val / 2.54) * dpi);
  return Math.round(val * dpi);
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect?: number): Crop {
  if (aspect) {
    return centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 85,
        },
        aspect,
        mediaWidth,
        mediaHeight
      ),
      mediaWidth,
      mediaHeight
    );
  }
  return {
    unit: '%',
    x: 5,
    y: 5,
    width: 90,
    height: 90,
  };
}

// Bake rotation and flip into an upright offscreen canvas so ReactCrop coordinates are 100% pixel-accurate
async function bakeTransformedImage(
  rawUrl: string,
  rotation: number,
  flip: { horizontal: boolean; vertical: boolean }
): Promise<string> {
  if (rotation === 0 && !flip.horizontal && !flip.vertical) {
    return rawUrl;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const swapDims = rotation === 90 || rotation === 270;
      const canvas = document.createElement('canvas');
      canvas.width = swapDims ? img.naturalHeight : img.naturalWidth;
      canvas.height = swapDims ? img.naturalWidth : img.naturalHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context failed'));
        return;
      }

      ctx.translate(canvas.width / 2, canvas.height / 2);
      if (rotation !== 0) {
        ctx.rotate((rotation * Math.PI) / 180);
      }
      ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error('Failed to transform image'));
    img.src = rawUrl;
  });
}

// Apply geometric or irregular shape clipping path on canvas
function clipShapeMask(ctx: CanvasRenderingContext2D, shape: ShapeMask, w: number, h: number) {
  ctx.beginPath();
  if (shape === 'circle') {
    const r = Math.min(w, h) / 2;
    ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
  } else if (shape === 'oval') {
    ctx.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
  } else if (shape === 'rounded') {
    const r = Math.min(w, h) * 0.16;
    ctx.moveTo(r, 0);
    ctx.lineTo(w - r, 0);
    ctx.quadraticCurveTo(w, 0, w, r);
    ctx.lineTo(w, h - r);
    ctx.quadraticCurveTo(w, h, w - r, h);
    ctx.lineTo(r, h);
    ctx.quadraticCurveTo(0, h, 0, h - r);
    ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
  } else if (shape === 'hexagon') {
    const cx = w / 2;
    const cy = h / 2;
    const rx = w / 2;
    const ry = h / 2;
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      const px = cx + rx * Math.cos(angle);
      const py = cy + ry * Math.sin(angle);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
  } else if (shape === 'star') {
    const cx = w / 2;
    const cy = h / 2;
    const outerR = Math.min(w, h) / 2;
    const innerR = outerR * 0.42;
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (Math.PI / 5) * i - Math.PI / 2;
      const px = cx + r * Math.cos(angle);
      const py = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
  } else if (shape === 'heart') {
    const topCurveHeight = h * 0.3;
    ctx.moveTo(w / 2, h * 0.25);
    ctx.bezierCurveTo(w / 2, 0, 0, 0, 0, topCurveHeight);
    ctx.bezierCurveTo(0, h * 0.55, w / 2, h * 0.78, w / 2, h);
    ctx.bezierCurveTo(w / 2, h * 0.78, w, h * 0.55, w, topCurveHeight);
    ctx.bezierCurveTo(w, 0, w / 2, 0, w / 2, h * 0.25);
  } else {
    ctx.rect(0, 0, w, h);
  }
  ctx.closePath();
  ctx.clip();
}

async function generateCroppedBlob(
  image: HTMLImageElement,
  crop: PixelCrop,
  shapeMask: ShapeMask = 'rect',
  format: OutputFormat = 'image/png',
  targetOutputPx?: { width: number; height: number }
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get 2D canvas context');
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  const srcX = Math.max(0, Math.round(crop.x * scaleX));
  const srcY = Math.max(0, Math.round(crop.y * scaleY));
  const srcW = Math.max(1, Math.round(crop.width * scaleX));
  const srcH = Math.max(1, Math.round(crop.height * scaleY));

  const outW = targetOutputPx ? Math.max(1, targetOutputPx.width) : srcW;
  const outH = targetOutputPx ? Math.max(1, targetOutputPx.height) : srcH;

  canvas.width = outW;
  canvas.height = outH;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // If JPEG, fill white background for transparent pixels / outside shape mask
  if (format === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, outW, outH);
  }

  ctx.save();
  if (shapeMask !== 'rect') {
    clipShapeMask(ctx, shapeMask, outW, outH);
  }

  ctx.drawImage(image, srcX, srcY, srcW, srcH, 0, 0, outW, outH);
  ctx.restore();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas toBlob returned null'));
          return;
        }
        resolve(blob);
      },
      format,
      0.95
    );
  });
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function ImageCropperPage() {
  const tUI = useTranslations('ToolUI.imageCropper');

  const [rawImgSrc, setRawImgSrc] = useState<string>('');
  const [imgSrc, setImgSrc] = useState<string>('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

  const [aspectMode, setAspectMode] = useState<AspectMode>('free');
  const [shapeMask, setShapeMask] = useState<ShapeMask>('rect');
  const [rotation, setRotation] = useState<number>(0);
  const [flip, setFlip] = useState({ horizontal: false, vertical: false });
  const [exportFormat, setExportFormat] = useState<OutputFormat>('image/png');

  // Exact Pixel & CM / DPI controls
  const [unit, setUnit] = useState<DimensionUnit>('px');
  const [dpi, setDpi] = useState<number>(300);
  const [inputW, setInputW] = useState<string>('');
  const [inputH, setInputH] = useState<string>('');

  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiStatusMsg, setAiStatusMsg] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  // Developer Code Export state
  const [devTab, setDevTab] = useState<DevFramework>('flutter');
  const [copiedCode, setCopiedCode] = useState(false);

  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (rawImgSrc && rawImgSrc.startsWith('blob:')) URL.revokeObjectURL(rawImgSrc);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [rawImgSrc, previewUrl]);

  // Re-bake image whenever rotation or flip changes
  useEffect(() => {
    if (!rawImgSrc) return;
    let active = true;
    bakeTransformedImage(rawImgSrc, rotation, flip)
      .then((bakedUrl) => {
        if (active) {
          setImgSrc(bakedUrl);
        }
      })
      .catch(() => {
        if (active) setImgSrc(rawImgSrc);
      });
    return () => {
      active = false;
    };
  }, [rawImgSrc, rotation, flip]);

  // Sync live crop dimensions to Pixel / CM input boxes
  useEffect(() => {
    if (completedCrop && imgRef.current && imgRef.current.width > 0) {
      const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
      const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
      const natW = Math.round(completedCrop.width * scaleX);
      const natH = Math.round(completedCrop.height * scaleY);
      setInputW(pxToUnit(natW, unit, dpi));
      setInputH(pxToUnit(natH, unit, dpi));
    }
  }, [completedCrop, unit, dpi]);

  const onSelectFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/') && !/\.(jpe?g|png|webp|avif|bmp|gif)$/i.test(file.name)) {
        return;
      }
      if (rawImgSrc && rawImgSrc.startsWith('blob:')) {
        URL.revokeObjectURL(rawImgSrc);
      }
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setPreviewBlob(null);
      }
      setCrop(undefined);
      setCompletedCrop(undefined);
      setRotation(0);
      setFlip({ horizontal: false, vertical: false });
      setAiStatusMsg(null);
      const objectUrl = URL.createObjectURL(file);
      setRawImgSrc(objectUrl);
      setImgSrc(objectUrl);
    },
    [rawImgSrc, previewUrl]
  );

  const getAspectRatioValue = (mode: AspectMode): number | undefined => {
    switch (mode) {
      case '1:1':
      case 'visa':
        return 1;
      case '4:3':
        return 4 / 3;
      case '16:9':
        return 16 / 9;
      case '9:16':
        return 9 / 16;
      case 'passport':
        return 3.5 / 4.5;
      case 'signature':
        return 3.5 / 1.5;
      default:
        return undefined;
    }
  };

  const applyAspect = useCallback((mode: AspectMode, width?: number, height?: number) => {
    const w = width || imgRef.current?.width || 100;
    const h = height || imgRef.current?.height || 100;

    setAspectMode(mode);
    if (mode === 'passport') {
      setUnit('cm');
      setDpi(300);
    } else if (mode === 'visa') {
      setUnit('in');
      setDpi(300);
    } else if (mode === 'signature') {
      setUnit('cm');
      setDpi(300);
    }

    const aspect = getAspectRatioValue(mode);
    const newCrop = centerAspectCrop(w, h, aspect);
    setCrop(newCrop);

    if (imgRef.current) {
      const pxCrop: PixelCrop = {
        unit: 'px',
        x: (newCrop.x / 100) * w,
        y: (newCrop.y / 100) * h,
        width: (newCrop.width / 100) * w,
        height: (newCrop.height / 100) * h,
      };
      setCompletedCrop(pxCrop);
    }
  }, []);

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height, naturalWidth, naturalHeight } = e.currentTarget;
    setOriginalDimensions({ width: naturalWidth, height: naturalHeight });
    applyAspect(aspectMode, width, height);
  };

  // Apply manual typed width/height in px, cm, or in
  const applyManualDimensions = (newWStr: string, newHStr: string) => {
    setInputW(newWStr);
    setInputH(newHStr);
    if (!imgRef.current) return;

    const parsedW = parseFloat(newWStr);
    const parsedH = parseFloat(newHStr);
    if (isNaN(parsedW) || isNaN(parsedH) || parsedW <= 0 || parsedH <= 0) return;

    const natTargetW = Math.min(imgRef.current.naturalWidth, unitToPx(parsedW, unit, dpi));
    const natTargetH = Math.min(imgRef.current.naturalHeight, unitToPx(parsedH, unit, dpi));

    const pctW = Math.min(100, Math.max(2, (natTargetW / imgRef.current.naturalWidth) * 100));
    const pctH = Math.min(100, Math.max(2, (natTargetH / imgRef.current.naturalHeight) * 100));

    const newX = Math.max(0, (100 - pctW) / 2);
    const newY = Math.max(0, (100 - pctH) / 2);

    const updatedCrop: Crop = {
      unit: '%',
      x: newX,
      y: newY,
      width: pctW,
      height: pctH,
    };
    setCrop(updatedCrop);
    setCompletedCrop({
      unit: 'px',
      x: (newX / 100) * imgRef.current.width,
      y: (newY / 100) * imgRef.current.height,
      width: (pctW / 100) * imgRef.current.width,
      height: (pctH / 100) * imgRef.current.height,
    });
  };

  // AI Smart Auto-Crop 1: Auto-Trim solid/transparent margins
  const handleAiAutoTrim = () => {
    if (!imgRef.current) return;
    const img = imgRef.current;
    const sampleMax = 350;
    const scale = Math.min(1, sampleMax / Math.max(img.naturalWidth, img.naturalHeight));
    const sw = Math.max(10, Math.round(img.naturalWidth * scale));
    const sh = Math.max(10, Math.round(img.naturalHeight * scale));

    const c = document.createElement('canvas');
    c.width = sw;
    c.height = sh;
    const ctx = c.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(img, 0, 0, sw, sh);
    const { data } = ctx.getImageData(0, 0, sw, sh);

    // Sample corner pixel as background reference
    const bgR = data[0];
    const bgG = data[1];
    const bgB = data[2];
    const bgA = data[3];
    const tolerance = 24;

    const isBackground = (idx: number) => {
      const a = data[idx + 3];
      if (bgA < 20 && a < 20) return true;
      return (
        Math.abs(data[idx] - bgR) < tolerance &&
        Math.abs(data[idx + 1] - bgG) < tolerance &&
        Math.abs(data[idx + 2] - bgB) < tolerance &&
        Math.abs(a - bgA) < tolerance
      );
    };

    let top = 0;
    let bottom = sh - 1;
    let left = 0;
    let right = sw - 1;

    // Scan top
    while (top < bottom) {
      let rowEmpty = true;
      for (let x = 0; x < sw; x++) {
        if (!isBackground((top * sw + x) * 4)) {
          rowEmpty = false;
          break;
        }
      }
      if (!rowEmpty) break;
      top++;
    }
    // Scan bottom
    while (bottom > top) {
      let rowEmpty = true;
      for (let x = 0; x < sw; x++) {
        if (!isBackground((bottom * sw + x) * 4)) {
          rowEmpty = false;
          break;
        }
      }
      if (!rowEmpty) break;
      bottom--;
    }
    // Scan left
    while (left < right) {
      let colEmpty = true;
      for (let y = top; y <= bottom; y++) {
        if (!isBackground((y * sw + left) * 4)) {
          colEmpty = false;
          break;
        }
      }
      if (!colEmpty) break;
      left++;
    }
    // Scan right
    while (right > left) {
      let colEmpty = true;
      for (let y = top; y <= bottom; y++) {
        if (!isBackground((y * sw + right) * 4)) {
          colEmpty = false;
          break;
        }
      }
      if (!colEmpty) break;
      right--;
    }

    const pctX = (left / sw) * 100;
    const pctY = (top / sh) * 100;
    const pctW = Math.max(5, ((right - left + 1) / sw) * 100);
    const pctH = Math.max(5, ((bottom - top + 1) / sh) * 100);

    setAspectMode('free');
    setCrop({ unit: '%', x: pctX, y: pctY, width: pctW, height: pctH });
    setCompletedCrop({
      unit: 'px',
      x: (pctX / 100) * img.width,
      y: (pctY / 100) * img.height,
      width: (pctW / 100) * img.width,
      height: (pctH / 100) * img.height,
    });
    setAiStatusMsg(tUI('aiTrimDone'));
  };

  // AI Smart Auto-Crop 2: Edge-Energy Saliency Focus Crop
  const handleAiSubjectFocus = () => {
    if (!imgRef.current) return;
    const img = imgRef.current;
    const sw = 120;
    const sh = 120;

    const c = document.createElement('canvas');
    c.width = sw;
    c.height = sh;
    const ctx = c.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(img, 0, 0, sw, sh);
    const { data } = ctx.getImageData(0, 0, sw, sh);

    let sumX = 0;
    let sumY = 0;
    let totalWeight = 0;

    for (let y = 1; y < sh - 1; y++) {
      for (let x = 1; x < sw - 1; x++) {
        const idx = (y * sw + x) * 4;
        const idxRight = (y * sw + (x + 1)) * 4;
        const idxDown = ((y + 1) * sw + x) * 4;

        const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
        const lumR =
          0.299 * data[idxRight] + 0.587 * data[idxRight + 1] + 0.114 * data[idxRight + 2];
        const lumD = 0.299 * data[idxDown] + 0.587 * data[idxDown + 1] + 0.114 * data[idxDown + 2];

        const edge = Math.abs(lum - lumR) + Math.abs(lum - lumD);
        if (edge > 18) {
          const weight = edge * edge;
          sumX += x * weight;
          sumY += y * weight;
          totalWeight += weight;
        }
      }
    }

    let centerX = 50;
    let centerY = 50;
    if (totalWeight > 0) {
      centerX = (sumX / totalWeight / sw) * 100;
      centerY = (sumY / totalWeight / sh) * 100;
    }

    const boxW = 64;
    const boxH = 64;
    const pctX = Math.max(0, Math.min(100 - boxW, centerX - boxW / 2));
    const pctY = Math.max(0, Math.min(100 - boxH, centerY - boxH / 2));

    setCrop({ unit: '%', x: pctX, y: pctY, width: boxW, height: boxH });
    setCompletedCrop({
      unit: 'px',
      x: (pctX / 100) * img.width,
      y: (pctY / 100) * img.height,
      width: (boxW / 100) * img.width,
      height: (boxH / 100) * img.height,
    });
    setAiStatusMsg(tUI('aiFocusDone'));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onSelectFile(e.dataTransfer.files[0]);
    }
  };

  const handleRotateCw = () => setRotation((prev) => (prev + 90) % 360);
  const handleRotateCcw = () => setRotation((prev) => (prev - 90 + 360) % 360);
  const handleFlipHorizontal = () => setFlip((prev) => ({ ...prev, horizontal: !prev.horizontal }));
  const handleFlipVertical = () => setFlip((prev) => ({ ...prev, vertical: !prev.vertical }));

  const handleCropAndDownload = async () => {
    if (!imgRef.current || !completedCrop) return;
    setIsProcessing(true);

    try {
      // Automatically switch JPEG to PNG if irregular shape mask is selected so transparency works, unless user explicitly wants JPEG
      const effectiveFormat =
        shapeMask !== 'rect' && exportFormat === 'image/jpeg' ? 'image/png' : exportFormat;

      const blob = await generateCroppedBlob(
        imgRef.current,
        completedCrop,
        shapeMask,
        effectiveFormat
      );

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(blob);
      setPreviewBlob(blob);
      setPreviewUrl(url);

      const ext =
        effectiveFormat === 'image/jpeg'
          ? 'jpg'
          : effectiveFormat === 'image/webp'
            ? 'webp'
            : 'png';
      const link = document.createElement('a');
      link.href = url;
      link.download = `${tUI('downloadFilename') || 'cropped-image'}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Crop Error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetCrop = () => {
    if (imgRef.current) {
      setRotation(0);
      setFlip({ horizontal: false, vertical: false });
      setShapeMask('rect');
      setAiStatusMsg(null);
      applyAspect('free', imgRef.current.width, imgRef.current.height);
    }
  };

  const aspectValue = getAspectRatioValue(aspectMode);

  // Dynamic Flutter & Angular Code Generator
  const flutterCode = `// Flutter (image_cropper package)
final croppedFile = await ImageCropper().cropImage(
  sourcePath: imageFile.path,
  aspectRatio: ${
    aspectMode === '1:1' || aspectMode === 'visa'
      ? 'const CropAspectRatio(ratioX: 1, ratioY: 1)'
      : aspectMode === '16:9'
        ? 'const CropAspectRatio(ratioX: 16, ratioY: 9)'
        : aspectMode === '4:3'
          ? 'const CropAspectRatio(ratioX: 4, ratioY: 3)'
          : aspectMode === 'passport'
            ? 'const CropAspectRatio(ratioX: 3.5, ratioY: 4.5)'
            : 'null // Freeform'
  },
  uiSettings: [
    AndroidUiSettings(
      toolbarTitle: 'Crop Image',
      cropStyle: ${shapeMask === 'circle' ? 'CropStyle.circle' : 'CropStyle.rectangle'},
      lockAspectRatio: ${aspectMode !== 'free'},
    ),
    IOSUiSettings(
      title: 'Crop Image',
      cropStyle: ${shapeMask === 'circle' ? 'CropStyle.circle' : 'CropStyle.rectangle'},
    ),
  ],
);`;

  const angularCode = `<!-- Angular (ngx-image-cropper) -->
<image-cropper
  [imageChangedEvent]="imageChangedEvent"
  [maintainAspectRatio]="${aspectMode !== 'free'}"
  [aspectRatio]="${aspectValue ? aspectValue.toFixed(2) : '4 / 3'}"
  [roundCropper]="${shapeMask === 'circle'}"
  format="${exportFormat === 'image/jpeg' ? 'jpeg' : exportFormat === 'image/webp' ? 'webp' : 'png'}"
  (imageCropped)="imageCropped($event)">
</image-cropper>`;

  const handleCopyDevCode = () => {
    const code = devTab === 'flutter' ? flutterCode : angularCode;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1800);
  };

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'AI Image Cropper Online (By Pixel, CM & Shape) - VelnoxLabs',
    url: 'https://velnoxlabs.com/tools/image-cropper',
    description:
      'Free AI online image cropper by pixel, cm, and DPI. Features smart AI auto-crop, circular and irregular shape masks, passport photo presets, and Flutter/Angular code export.',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  return (
    <GlobalContainer>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <SectionHeading title={tUI('title')} subtitle={tUI('subtitle')} />

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Upload State */}
        {!imgSrc ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-10 sm:p-14 text-center cursor-pointer transition-all duration-200 select-none ${
              isDragging
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 scale-[1.01]'
                : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:border-blue-400 dark:hover:border-blue-500 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.jpg,.jpeg,.png,.webp,.avif,.bmp"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  onSelectFile(e.target.files[0]);
                }
              }}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <UploadCloud className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--text-main)]">{tUI('dropTitle')}</h3>
                <p className="text-sm text-[var(--text-muted)] mt-1">{tUI('dropSubtitle')}</p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-colors"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>{tUI('browseFiles')}</span>
                </button>
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-500/20">
                  <ShieldCheck className="w-4 h-4" />
                  100% Client-Side Private
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Cropper Workspace */
          <div className="space-y-5">
            {/* Top Controls Grid */}
            <div className="rounded-2xl p-5 border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm space-y-5">
              {/* Row 1: AI Auto-Crop & Transform Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--border-color)]">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 mr-1">
                    <Sparkles className="w-4 h-4" />
                    AI Tools:
                  </span>
                  <button
                    type="button"
                    onClick={handleAiAutoTrim}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors cursor-pointer"
                  >
                    <Scissors className="w-3.5 h-3.5" />
                    {tUI('aiAutoTrimBtn')}
                  </button>
                  <button
                    type="button"
                    onClick={handleAiSubjectFocus}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {tUI('aiSubjectFocusBtn')}
                  </button>
                  {aiStatusMsg && (
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 ml-1">
                      {aiStatusMsg}
                    </span>
                  )}
                </div>

                {/* Transform & Reset Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRotateCcw}
                    title={tUI('rotateLeft')}
                    className="p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-page)] hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[var(--text-main)]"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleRotateCw}
                    title={tUI('rotateRight')}
                    className="p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-page)] hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[var(--text-main)]"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleFlipHorizontal}
                    title={tUI('flipHorizontal')}
                    className={`p-2 rounded-lg border border-[var(--border-color)] ${
                      flip.horizontal
                        ? 'bg-blue-600 text-white'
                        : 'bg-[var(--bg-page)] text-[var(--text-main)]'
                    }`}
                  >
                    <FlipHorizontal className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleFlipVertical}
                    title={tUI('flipVertical')}
                    className={`p-2 rounded-lg border border-[var(--border-color)] ${
                      flip.vertical
                        ? 'bg-blue-600 text-white'
                        : 'bg-[var(--bg-page)] text-[var(--text-main)]'
                    }`}
                  >
                    <FlipVertical className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={resetCrop}
                    className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-page)] text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  >
                    {tUI('resetCrop')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRawImgSrc('');
                      setImgSrc('');
                      if (previewUrl) URL.revokeObjectURL(previewUrl);
                      setPreviewUrl(null);
                      setPreviewBlob(null);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/30 text-xs font-semibold text-rose-600 dark:text-rose-400"
                  >
                    {tUI('changeImage')}
                  </button>
                </div>
              </div>

              {/* Row 2: Aspect Ratio & Passport Presets */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-[var(--text-main)] block">
                  {tUI('aspectRatio')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'free' as AspectMode, label: tUI('aspectFree'), icon: Maximize2 },
                    { id: '1:1' as AspectMode, label: tUI('aspect1_1'), icon: Square },
                    { id: '4:3' as AspectMode, label: tUI('aspect4_3'), icon: Square },
                    { id: '16:9' as AspectMode, label: tUI('aspect16_9'), icon: Square },
                    { id: '9:16' as AspectMode, label: '9:16 Reels', icon: Square },
                    { id: 'passport' as AspectMode, label: 'Passport (3.5×4.5 cm)', icon: Ruler },
                    { id: 'visa' as AspectMode, label: 'US Visa (2×2 in)', icon: Ruler },
                    { id: 'signature' as AspectMode, label: 'Signature (3.5×1.5 cm)', icon: Ruler },
                  ].map((item) => {
                    const Icon = item.icon;
                    const active = aspectMode === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => applyAspect(item.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                          active
                            ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                            : 'border-[var(--border-color)] bg-[var(--bg-page)] text-[var(--text-main)] hover:border-blue-400'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 3: Exact Pixel (px), Centimeter (cm), Inch (in) & Shape Masks */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2">
                {/* Exact Dimension Input (PX / CM / IN + DPI) */}
                <div className="p-3.5 rounded-xl bg-[var(--bg-page)] border border-[var(--border-color)] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--text-main)] flex items-center gap-1.5">
                      <Ruler className="w-3.5 h-3.5 text-blue-600" />
                      {tUI('exactDimensionsLabel')}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {(['px', 'cm', 'in'] as DimensionUnit[]).map((u) => (
                        <button
                          key={u}
                          type="button"
                          onClick={() => setUnit(u)}
                          className={`px-2 py-0.5 text-[11px] font-bold rounded ${
                            unit === u
                              ? 'bg-blue-600 text-white'
                              : 'bg-zinc-200 dark:bg-zinc-800 text-[var(--text-muted)]'
                          }`}
                        >
                          {u.toUpperCase()}
                        </button>
                      ))}
                      {unit !== 'px' && (
                        <select
                          value={dpi}
                          onChange={(e) => setDpi(Number(e.target.value))}
                          className="ml-1 px-1.5 py-0.5 text-[11px] rounded border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)]"
                        >
                          <option value={300}>300 DPI (Print)</option>
                          <option value={150}>150 DPI</option>
                          <option value={96}>96 DPI (Web)</option>
                        </select>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-[var(--text-muted)] block mb-1">
                        {tUI('widthLabel')} ({unit})
                      </label>
                      <input
                        type="number"
                        step={unit === 'px' ? '1' : '0.1'}
                        value={inputW}
                        onChange={(e) => applyManualDimensions(e.target.value, inputH)}
                        className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[var(--text-muted)] block mb-1">
                        {tUI('heightLabel')} ({unit})
                      </label>
                      <input
                        type="number"
                        step={unit === 'px' ? '1' : '0.1'}
                        value={inputH}
                        onChange={(e) => applyManualDimensions(inputW, e.target.value)}
                        className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)]"
                      />
                    </div>
                  </div>
                </div>

                {/* Shape Masks (Circle & Irregular Shapes) */}
                <div className="p-3.5 rounded-xl bg-[var(--bg-page)] border border-[var(--border-color)] space-y-3">
                  <span className="text-xs font-bold text-[var(--text-main)] flex items-center gap-1.5">
                    <Shapes className="w-3.5 h-3.5 text-indigo-600" />
                    {tUI('shapeMaskLabel')}
                  </span>

                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: 'rect' as ShapeMask, label: tUI('shapeRect') },
                      { id: 'circle' as ShapeMask, label: tUI('shapeCircle') },
                      { id: 'rounded' as ShapeMask, label: tUI('shapeRounded') },
                      { id: 'oval' as ShapeMask, label: tUI('shapeOval') },
                      { id: 'hexagon' as ShapeMask, label: tUI('shapeHexagon') },
                      { id: 'star' as ShapeMask, label: tUI('shapeStar') },
                      { id: 'heart' as ShapeMask, label: tUI('shapeHeart') },
                    ].map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setShapeMask(s.id);
                          if (s.id === 'circle') {
                            applyAspect('1:1');
                          }
                        }}
                        className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                          shapeMask === s.id
                            ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                            : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)] hover:border-indigo-400'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Crop Viewport */}
            <div className="rounded-2xl p-6 border border-[var(--border-color)] bg-[var(--bg-card)] flex items-center justify-center min-h-[380px] overflow-hidden">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspectValue}
                circularCrop={shapeMask === 'circle'}
                style={{ maxHeight: '68vh' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imgRef}
                  src={imgSrc}
                  alt="Crop Preview"
                  onLoad={onImageLoad}
                  style={{
                    maxHeight: '68vh',
                    maxWidth: '100%',
                    display: 'block',
                  }}
                />
              </ReactCrop>
            </div>

            {/* Bottom Action Bar */}
            <div className="rounded-2xl p-5 border border-[var(--border-color)] bg-[var(--bg-card)] flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-5 text-xs text-[var(--text-muted)]">
                {originalDimensions && (
                  <div>
                    {tUI('originalDimensions')}:{' '}
                    <strong className="text-[var(--text-main)] font-mono">
                      {originalDimensions.width} × {originalDimensions.height} px
                    </strong>
                  </div>
                )}
                {completedCrop && imgRef.current && (
                  <div>
                    {tUI('cropDimensions')}:{' '}
                    <strong className="text-blue-600 dark:text-blue-400 font-mono">
                      {Math.round(
                        completedCrop.width * (imgRef.current.naturalWidth / imgRef.current.width)
                      )}{' '}
                      ×{' '}
                      {Math.round(
                        completedCrop.height *
                          (imgRef.current.naturalHeight / imgRef.current.height)
                      )}{' '}
                      px
                    </strong>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as OutputFormat)}
                  className="px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] text-xs font-medium text-[var(--text-main)]"
                >
                  <option value="image/png">{tUI('formatPng')}</option>
                  <option value="image/jpeg">{tUI('formatJpeg')}</option>
                  <option value="image/webp">{tUI('formatWebp')}</option>
                </select>

                <button
                  type="button"
                  onClick={handleCropAndDownload}
                  disabled={isProcessing || !completedCrop}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm disabled:opacity-60 transition-colors cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{tUI('processing')}</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>{tUI('cropAndDownload')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Cropped Preview Card */}
            {previewUrl && previewBlob && (
              <div className="rounded-2xl p-5 border border-emerald-500/30 bg-[var(--bg-card)] flex items-center gap-5 flex-wrap">
                <div
                  className={`w-20 h-20 overflow-hidden bg-[var(--bg-page)] border border-[var(--border-color)] flex-shrink-0 flex items-center justify-center ${
                    shapeMask === 'circle' ? 'rounded-full' : 'rounded-xl'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Cropped Output"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{tUI('previewTitle')}</span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] font-mono">
                    {formatBytes(previewBlob.size)} •{' '}
                    {shapeMask !== 'rect' && exportFormat === 'image/jpeg'
                      ? 'PNG (Transparent Mask)'
                      : exportFormat.replace('image/', '').toUpperCase()}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Developer Code Export Section (Flutter & Angular) */}
        <div className="rounded-2xl p-6 border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Code className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-base font-bold text-[var(--text-main)]">
                {tUI('devExportTitle')}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDevTab('flutter')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  devTab === 'flutter'
                    ? 'bg-blue-600 text-white'
                    : 'bg-[var(--bg-page)] text-[var(--text-muted)] border border-[var(--border-color)]'
                }`}
              >
                Flutter (image_cropper)
              </button>
              <button
                type="button"
                onClick={() => setDevTab('angular')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  devTab === 'angular'
                    ? 'bg-rose-600 text-white'
                    : 'bg-[var(--bg-page)] text-[var(--text-muted)] border border-[var(--border-color)]'
                }`}
              >
                Angular (ngx-image-cropper)
              </button>
            </div>
          </div>

          <div className="relative rounded-xl bg-zinc-950 p-4 border border-zinc-800">
            <button
              type="button"
              onClick={handleCopyDevCode}
              className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{tUI('copied')}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{tUI('copyCode')}</span>
                </>
              )}
            </button>
            <pre className="text-xs font-mono text-zinc-300 overflow-x-auto pr-20">
              <code>{devTab === 'flutter' ? flutterCode : angularCode}</code>
            </pre>
          </div>
        </div>

        {/* Competitor Comparison Table */}
        <div className="rounded-2xl p-6 border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base font-bold text-[var(--text-main)]">
              {tUI('comparisonTitle')}
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-color)] bg-zinc-50 dark:bg-zinc-900/50 text-[var(--text-muted)]">
                  <th className="py-2.5 px-3 font-semibold">{tUI('compColFeature')}</th>
                  <th className="py-2.5 px-3 font-semibold text-blue-600 dark:text-blue-400">
                    {tUI('compColVelnox')}
                  </th>
                  <th className="py-2.5 px-3 font-semibold">{tUI('compColILove')}</th>
                  <th className="py-2.5 px-3 font-semibold">{tUI('compColCanva')}</th>
                  <th className="py-2.5 px-3 font-semibold">{tUI('compColAdobe')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-main)]">
                <tr>
                  <td className="py-2.5 px-3 font-medium">Exact Pixel, CM & Inch (300 DPI)</td>
                  <td className="py-2.5 px-3 text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Live Input + Presets
                  </td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">Pixel Only</td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">Pro Plan Only</td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">Preset Ratios Only</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium">AI Auto-Trim & Subject Focus</td>
                  <td className="py-2.5 px-3 text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> 1-Click Free AI
                  </td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">No</td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">Paid AI</td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">Account Required</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium">
                    Circle & Irregular Shapes (Star, Heart)
                  </td>
                  <td className="py-2.5 px-3 text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> 7 Transparent Shapes
                  </td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">Rectangle Only</td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">Frames Tool</td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">Circle Only</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium">Flutter & Angular Code Export</td>
                  <td className="py-2.5 px-3 text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Dynamic Snippets
                  </td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">No</td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">No</td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">No</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium">100% Client-Side Privacy</td>
                  <td className="py-2.5 px-3 text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Zero Server Upload
                  </td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">Cloud Server</td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">Cloud Storage</td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">Cloud Upload</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <ToolSeoContent
          toolSlug="image-cropper"
          toolName={tUI('title')}
          description={tUI('subtitle')}
          customAbout={tUI('aboutText')}
          customFeatures={[tUI('feature1'), tUI('feature2'), tUI('feature3'), tUI('feature4')]}
          customSteps={[
            { title: tUI('step1Title'), body: tUI('step1Body') },
            { title: tUI('step2Title'), body: tUI('step2Body') },
            { title: tUI('step3Title'), body: tUI('step3Body') },
          ]}
          customFaqs={[
            { q: tUI('faq1Q'), a: tUI('faq1A') },
            { q: tUI('faq2Q'), a: tUI('faq2A') },
            { q: tUI('faq3Q'), a: tUI('faq3A') },
            { q: tUI('faq4Q'), a: tUI('faq4A') },
          ]}
        />
      </div>
    </GlobalContainer>
  );
}
