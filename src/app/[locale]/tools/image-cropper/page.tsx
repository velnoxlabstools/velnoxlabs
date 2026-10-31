'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import ReactCrop, {
  type Crop,
  type PixelCrop,
  centerCrop,
  makeAspectCrop,
} from 'react-image-crop';
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
  Circle,
  Tv,
  Monitor,
  RefreshCw,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';

type AspectMode = 'free' | '1:1' | '4:3' | '16:9' | 'circle';
type OutputFormat = 'image/png' | 'image/jpeg' | 'image/webp';

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect?: number
): Crop {
  if (aspect) {
    return centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
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

async function generateCroppedBlob(
  image: HTMLImageElement,
  crop: PixelCrop,
  rotation = 0,
  flip = { horizontal: false, vertical: false },
  isCircle = false,
  format: OutputFormat = 'image/png'
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get 2D canvas context');
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  const targetWidth = Math.max(1, Math.floor(crop.width * scaleX));
  const targetHeight = Math.max(1, Math.floor(crop.height * scaleY));

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // If format is JPEG, fill white background for transparent pixels
  if (format === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  ctx.save();

  // Handle circular clip if requested
  if (isCircle) {
    ctx.beginPath();
    const radius = Math.min(targetWidth, targetHeight) / 2;
    ctx.arc(targetWidth / 2, targetHeight / 2, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
  }

  const cropX = crop.x * scaleX;
  const cropY = crop.y * scaleY;

  // Move origin to center of target canvas
  ctx.translate(targetWidth / 2, targetHeight / 2);

  // Apply rotation
  if (rotation !== 0) {
    ctx.rotate((rotation * Math.PI) / 180);
  }

  // Apply flip
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);

  // Translate back taking into account crop center
  const cropCenterX = cropX + targetWidth / 2;
  const cropCenterY = cropY + targetHeight / 2;
  ctx.translate(-cropCenterX, -cropCenterY);

  ctx.drawImage(
    image,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight
  );

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

  const [imgSrc, setImgSrc] = useState<string>('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspectMode, setAspectMode] = useState<AspectMode>('free');
  const [rotation, setRotation] = useState<number>(0);
  const [flip, setFlip] = useState({ horizontal: false, vertical: false });
  const [exportFormat, setExportFormat] = useState<OutputFormat>('image/png');

  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);

  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup object URLs on unmount or when image changes
  useEffect(() => {
    return () => {
      if (imgSrc && imgSrc.startsWith('blob:')) URL.revokeObjectURL(imgSrc);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [imgSrc, previewUrl]);

  const onSelectFile = useCallback((file: File) => {
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type.toLowerCase())) {
      return;
    }
    setCrop(undefined);
    setCompletedCrop(undefined);
    setRotation(0);
    setFlip({ horizontal: false, vertical: false });
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setPreviewBlob(null);
    }
    const objectUrl = URL.createObjectURL(file);
    setImgSrc(objectUrl);
  }, [previewUrl]);

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height, naturalWidth, naturalHeight } = e.currentTarget;
    setOriginalDimensions({ width: naturalWidth, height: naturalHeight });
    applyAspect(aspectMode, width, height);
  };

  const applyAspect = (mode: AspectMode, width?: number, height?: number) => {
    const w = width || imgRef.current?.width || 100;
    const h = height || imgRef.current?.height || 100;

    setAspectMode(mode);
    if (mode === 'free') {
      setCrop(centerAspectCrop(w, h, undefined));
    } else if (mode === '1:1' || mode === 'circle') {
      setCrop(centerAspectCrop(w, h, 1));
    } else if (mode === '4:3') {
      setCrop(centerAspectCrop(w, h, 4 / 3));
    } else if (mode === '16:9') {
      setCrop(centerAspectCrop(w, h, 16 / 9));
    }
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
      const isCircle = aspectMode === 'circle';
      const blob = await generateCroppedBlob(
        imgRef.current,
        completedCrop,
        rotation,
        flip,
        isCircle,
        exportFormat
      );

      const url = URL.createObjectURL(blob);
      setPreviewBlob(blob);
      setPreviewUrl(url);

      // Trigger download
      const ext = exportFormat === 'image/jpeg' ? 'jpg' : exportFormat === 'image/webp' ? 'webp' : 'png';
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
      applyAspect(aspectMode, imgRef.current.width, imgRef.current.height);
    }
  };

  const aspectValue =
    aspectMode === '1:1' || aspectMode === 'circle'
      ? 1
      : aspectMode === '4:3'
      ? 4 / 3
      : aspectMode === '16:9'
      ? 16 / 9
      : undefined;

  return (
    <GlobalContainer>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 16px' }}>
        <SectionHeading title={tUI('title')} subtitle={tUI('subtitle')} />

        {/* Upload State */}
        {!imgSrc ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              marginTop: '28px',
              padding: '48px 20px',
              border: `2px dashed ${isDragging ? 'var(--accent)' : 'var(--border-color)'}`,
              borderRadius: '12px',
              backgroundColor: isDragging ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg-card)',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  onSelectFile(e.target.files[0]);
                }
              }}
              style={{ display: 'none' }}
            />
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: 'var(--accent)',
              }}
            >
              <UploadCloud size={32} />
            </div>
            <h3
              style={{
                fontSize: '1.2rem',
                fontWeight: 600,
                color: 'var(--text-main)',
                marginBottom: '6px',
              }}
            >
              {tUI('dropTitle')}
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '20px' }}>
              {tUI('dropSubtitle')}
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 24px',
                borderRadius: '8px',
                backgroundColor: 'var(--accent)',
                color: '#ffffff',
                fontSize: '0.9rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <ImageIcon size={18} />
              {tUI('browseFiles')}
            </button>
          </div>
        ) : (
          /* Cropper Workspace */
          <div style={{ marginTop: '24px' }}>
            {/* Toolbar Controls */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                padding: '16px 20px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                marginBottom: '20px',
              }}
            >
              {/* Aspect Ratio Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginRight: '4px' }}>
                  {tUI('aspectRatio')}:
                </span>
                <button
                  type="button"
                  onClick={() => applyAspect('free')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: aspectMode === 'free' ? 'var(--accent)' : 'var(--bg-page)',
                    color: aspectMode === 'free' ? '#ffffff' : 'var(--text-main)',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                >
                  <Maximize2 size={14} />
                  {tUI('aspectFree')}
                </button>
                <button
                  type="button"
                  onClick={() => applyAspect('1:1')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: aspectMode === '1:1' ? 'var(--accent)' : 'var(--bg-page)',
                    color: aspectMode === '1:1' ? '#ffffff' : 'var(--text-main)',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                >
                  <Square size={14} />
                  {tUI('aspect1_1')}
                </button>
                <button
                  type="button"
                  onClick={() => applyAspect('4:3')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: aspectMode === '4:3' ? 'var(--accent)' : 'var(--bg-page)',
                    color: aspectMode === '4:3' ? '#ffffff' : 'var(--text-main)',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                >
                  <Tv size={14} />
                  {tUI('aspect4_3')}
                </button>
                <button
                  type="button"
                  onClick={() => applyAspect('16:9')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: aspectMode === '16:9' ? 'var(--accent)' : 'var(--bg-page)',
                    color: aspectMode === '16:9' ? '#ffffff' : 'var(--text-main)',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                >
                  <Monitor size={14} />
                  {tUI('aspect16_9')}
                </button>
                <button
                  type="button"
                  onClick={() => applyAspect('circle')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: aspectMode === 'circle' ? 'var(--accent)' : 'var(--bg-page)',
                    color: aspectMode === 'circle' ? '#ffffff' : 'var(--text-main)',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                >
                  <Circle size={14} />
                  {tUI('aspectCircle')}
                </button>
              </div>

              {/* Transformation Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleRotateCcw}
                  title={tUI('rotateLeft')}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-page)',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <RotateCcw size={15} />
                </button>
                <button
                  type="button"
                  onClick={handleRotateCw}
                  title={tUI('rotateRight')}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-page)',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <RotateCw size={15} />
                </button>
                <button
                  type="button"
                  onClick={handleFlipHorizontal}
                  title={tUI('flipHorizontal')}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: flip.horizontal ? 'var(--accent)' : 'var(--bg-page)',
                    color: flip.horizontal ? '#ffffff' : 'var(--text-main)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <FlipHorizontal size={15} />
                </button>
                <button
                  type="button"
                  onClick={handleFlipVertical}
                  title={tUI('flipVertical')}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: flip.vertical ? 'var(--accent)' : 'var(--bg-page)',
                    color: flip.vertical ? '#ffffff' : 'var(--text-main)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <FlipVertical size={15} />
                </button>
                <button
                  type="button"
                  onClick={resetCrop}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-page)',
                    color: '#94a3b8',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                  }}
                >
                  {tUI('resetCrop')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setImgSrc('');
                    if (previewUrl) URL.revokeObjectURL(previewUrl);
                    setPreviewUrl(null);
                    setPreviewBlob(null);
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-page)',
                    color: '#ef4444',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                  }}
                >
                  {tUI('changeImage')}
                </button>
              </div>
            </div>

            {/* Main Crop Viewport */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                overflow: 'hidden',
                minHeight: '400px',
              }}
            >
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspectValue}
                circularCrop={aspectMode === 'circle'}
                style={{ maxHeight: '70vh' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imgRef}
                  src={imgSrc}
                  alt="Crop Preview"
                  onLoad={onImageLoad}
                  style={{
                    maxHeight: '70vh',
                    maxWidth: '100%',
                    transform: `rotate(${rotation}deg) scale(${flip.horizontal ? -1 : 1}, ${flip.vertical ? -1 : 1})`,
                    transition: 'transform 0.15s ease',
                    display: 'block',
                  }}
                />
              </ReactCrop>
            </div>

            {/* Bottom Controls & Download Bar */}
            <div
              style={{
                marginTop: '20px',
                padding: '16px 20px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
              }}
            >
              {/* Metadata Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '0.85rem', color: '#94a3b8' }}>
                {originalDimensions && (
                  <div>
                    {tUI('originalDimensions')}:{' '}
                    <strong style={{ color: 'var(--text-main)' }}>
                      {originalDimensions.width} × {originalDimensions.height} px
                    </strong>
                  </div>
                )}
                {completedCrop && imgRef.current && (
                  <div>
                    {tUI('cropDimensions')}:{' '}
                    <strong style={{ color: 'var(--accent)' }}>
                      {Math.round(completedCrop.width * (imgRef.current.naturalWidth / imgRef.current.width))} ×{' '}
                      {Math.round(completedCrop.height * (imgRef.current.naturalHeight / imgRef.current.height))} px
                    </strong>
                  </div>
                )}
              </div>

              {/* Format Select & Download Action */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as OutputFormat)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-page)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem',
                  }}
                >
                  <option value="image/png">{tUI('formatPng')}</option>
                  <option value="image/jpeg">{tUI('formatJpeg')}</option>
                  <option value="image/webp">{tUI('formatWebp')}</option>
                </select>

                <button
                  type="button"
                  onClick={handleCropAndDownload}
                  disabled={isProcessing || !completedCrop}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 24px',
                    borderRadius: '8px',
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    border: 'none',
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    opacity: isProcessing ? 0.7 : 1,
                  }}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      {tUI('processing')}
                    </>
                  ) : (
                    <>
                      <Download size={18} />
                      {tUI('cropAndDownload')}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Cropped Preview Card if available */}
            {previewUrl && previewBlob && (
              <div
                style={{
                  marginTop: '20px',
                  padding: '20px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  flexWrap: 'wrap',
                }}
              >
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: aspectMode === 'circle' ? '50%' : '8px',
                    overflow: 'hidden',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Result Thumbnail"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </div>
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#10b981',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      marginBottom: '4px',
                    }}
                  >
                    <CheckCircle2 size={18} />
                    <span>{tUI('previewTitle')}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                    {formatBytes(previewBlob.size)} • {exportFormat.replace('image/', '').toUpperCase()}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

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
