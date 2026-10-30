'use client';

import React, { useState, useRef, useEffect } from 'react';
import NextImage from 'next/image';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';

interface ImageItem {
  id: string;
  file: File;
  src: string;
  originalWidth: number;
  originalHeight: number;
  processedImage: string | null;
}

export default function ImageResizerPage() {
  const tUI = useTranslations('ToolUI.imageResizer');
  const [images, setImages] = useState<ImageItem[]>([]);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [outputFormat, setOutputFormat] = useState('image/jpeg');
  const [quality, setQuality] = useState(0.9);
  const [loading, setLoading] = useState(false);
  const [zipping, setZipping] = useState(false);
  const [formatOpen, setFormatOpen] = useState(false);
  const [qualityOpen, setQualityOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formatRef = useRef<HTMLDivElement>(null);
  const qualityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (formatRef.current && !formatRef.current.contains(e.target as Node)) {
        setFormatOpen(false);
      }
      if (qualityRef.current && !qualityRef.current.contains(e.target as Node)) {
        setQualityOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getFormatShortName = (fmt: string) => {
    if (fmt === 'image/webp') return 'WEBP';
    if (fmt === 'image/png') return 'PNG';
    return 'JPEG';
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const newImages: ImageItem[] = [];
    let loadedCount = 0;

    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          newImages.push({
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            file,
            src: event.target?.result as string,
            originalWidth: img.width,
            originalHeight: img.height,
            processedImage: null,
          });
          loadedCount++;
          if (loadedCount === fileArray.length) {
            setImages((prev) => {
              const combined = [...prev, ...newImages];
              if (prev.length === 0 && newImages.length > 0) {
                setWidth(newImages[0].originalWidth);
                setHeight(newImages[0].originalHeight);
              }
              return combined;
            });
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (maintainAspect && images.length > 0) {
      const first = images[0];
      const ratio = first.originalHeight / first.originalWidth;
      setHeight(Math.round(val * ratio));
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (maintainAspect && images.length > 0) {
      const first = images[0];
      const ratio = first.originalWidth / first.originalHeight;
      setWidth(Math.round(val * ratio));
    }
  };

  const processImage = (imgSrc: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL(outputFormat, quality);
          resolve(dataUrl);
        } else {
          reject(new Error('Canvas not supported'));
        }
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imgSrc;
    });
  };

  const handleResizeAll = async () => {
    if (images.length === 0) return;
    setLoading(true);

    const updatedImages = await Promise.all(
      images.map(async (item) => {
        try {
          const dataUrl = await processImage(item.src);
          return { ...item, processedImage: dataUrl };
        } catch {
          return item;
        }
      })
    );

    setImages(updatedImages);
    setLoading(false);
  };

  const getOutputFileName = (item: ImageItem) => {
    const ext = outputFormat.split('/')[1];
    const nameWithoutExt = item.file.name.replace(/\.[^/.]+$/, '');
    return `resized-${nameWithoutExt}.${ext}`;
  };

  const handleDownloadSingle = (item: ImageItem) => {
    if (!item.processedImage) return;
    const link = document.createElement('a');
    link.href = item.processedImage;
    link.download = getOutputFileName(item);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAllZip = async () => {
    const readyImages = images.filter((img) => img.processedImage);
    if (readyImages.length === 0) return;

    setZipping(true);
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      for (const item of readyImages) {
        const base64Data = item.processedImage!.split(',')[1];
        zip.file(getOutputFileName(item), base64Data, { base64: true });
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `velnoxlabs-images-${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      alert(tUI('zipError'));
    }
    setZipping(false);
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleClearAll = () => {
    setImages([]);
  };

  const processedCount = images.filter((img) => img.processedImage).length;

  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'VelnoxLabs Image Resizer & Compressor',
        operatingSystem: 'All',
        applicationCategory: 'MultimediaApplication',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        description:
          'Resize, compress, and convert multiple images at once in your browser. Batch JPG to WEBP, PNG to JPG and more with ZIP download.',
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How to resize and compress images online?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Upload one or more images, specify your target dimensions, maintain aspect ratio if required, and download your optimized images.',
            },
          },
          {
            '@type': 'Question',
            name: 'Can I convert multiple JPG to WEBP at once?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes! Select multiple JPG, PNG, or WEBP images together, choose WEBP as output format, and click Resize All to convert them in batch.',
            },
          },
          {
            '@type': 'Question',
            name: 'Can I download all processed images as a ZIP?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes, click the Download All as ZIP button after processing to get all your resized images packed into one ZIP file.',
            },
          },
          {
            '@type': 'Question',
            name: 'Are my images uploaded to a server?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'No! All processing occurs entirely inside your local browser memory using HTML5 Canvas, ensuring absolute privacy.',
            },
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <GlobalContainer maxWidth="2xl">
        <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          <SectionHeading title={tUI('title')} subtitle={tUI('subtitle')} />

          {/* ===== UPLOAD AREA (when no images) ===== */}
          {images.length === 0 ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                marginTop: 'var(--space-6)',
                border: '2px dashed var(--border-color)',
                borderRadius: '12px',
                padding: '60px 40px',
                textAlign: 'center',
                backgroundColor: 'var(--bg-card)',
                cursor: 'pointer',
              }}
            >
              <p
                style={{
                  color: 'var(--text-main)',
                  fontSize: '1.1rem',
                  marginBottom: '12px',
                  fontWeight: 500,
                }}
              >
                {tUI('uploadPrompt')}
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                {tUI('uploadFormats')}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </div>
          ) : (
            <>
              {/* ===== STICKY HORIZONTAL TOOLBAR (TOP OF PAGE) ===== */}
              <div
                style={{
                  position: 'sticky',
                  top: '16px',
                  zIndex: 40,
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '12px 18px',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
                  backdropFilter: 'blur(16px)',
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  marginTop: 'var(--space-6)',
                  marginBottom: '24px',
                }}
              >
                {/* 1. [Format: WEBP ▼] dropdown */}
                <div ref={formatRef} style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => setFormatOpen(!formatOpen)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '0.85rem',
                      color: 'var(--text-main)',
                      cursor: 'pointer',
                      fontWeight: 500,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span style={{ color: 'var(--text-muted)' }}>{tUI('formatLabel')}:</span>
                    <span style={{ color: '#60a5fa', fontWeight: 700 }}>
                      {getFormatShortName(outputFormat)}
                    </span>
                    <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>▼</span>
                  </button>
                  {formatOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 6px)',
                        left: 0,
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        boxShadow: '0 12px 28px rgba(0,0,0,0.6)',
                        padding: '6px',
                        zIndex: 100,
                        minWidth: '150px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                      }}
                    >
                      {[
                        { label: 'WEBP', val: 'image/webp' },
                        { label: 'JPEG (JPG)', val: 'image/jpeg' },
                        { label: 'PNG', val: 'image/png' },
                      ].map((fmt) => (
                        <button
                          key={fmt.val}
                          type="button"
                          onClick={() => {
                            setOutputFormat(fmt.val);
                            setFormatOpen(false);
                          }}
                          style={{
                            textAlign: 'left',
                            padding: '8px 12px',
                            fontSize: '0.825rem',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor:
                              outputFormat === fmt.val ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                            color: outputFormat === fmt.val ? '#60a5fa' : 'var(--text-main)',
                            fontWeight: outputFormat === fmt.val ? 600 : 400,
                            cursor: 'pointer',
                          }}
                        >
                          {fmt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. [Width: 1920] input field */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <label
                    style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: 600 }}
                  >
                    {tUI('widthLabel')}:
                  </label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => handleWidthChange(Number(e.target.value))}
                    style={{
                      width: '84px',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      padding: '7px 8px',
                      fontSize: '0.85rem',
                      outline: 'none',
                      textAlign: 'center',
                      fontWeight: 600,
                    }}
                  />
                </div>

                {/* 3. Maintain Aspect Ratio Toggle */}
                <button
                  type="button"
                  onClick={() => setMaintainAspect(!maintainAspect)}
                  title={tUI('maintainAspectRatio')}
                  style={{
                    backgroundColor: maintainAspect ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-page)',
                    border: maintainAspect ? '1px solid #3b82f6' : '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: maintainAspect ? '#60a5fa' : 'var(--text-muted)',
                    padding: '7px 10px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span>{maintainAspect ? '🔗' : '🔓'}</span>
                  <span style={{ fontSize: '0.75rem' }}>{tUI('lockRatio')}</span>
                </button>

                {/* 4. [Height: 1080] input field */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <label
                    style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: 600 }}
                  >
                    {tUI('heightLabel')}:
                  </label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => handleHeightChange(Number(e.target.value))}
                    style={{
                      width: '84px',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      padding: '7px 8px',
                      fontSize: '0.85rem',
                      outline: 'none',
                      textAlign: 'center',
                      fontWeight: 600,
                    }}
                  />
                </div>

                {/* 5. [Quality: 90% ▼] dropdown */}
                <div ref={qualityRef} style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => setQualityOpen(!qualityOpen)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '0.85rem',
                      color: 'var(--text-main)',
                      cursor: 'pointer',
                      fontWeight: 500,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span style={{ color: 'var(--text-muted)' }}>{tUI('qualityLabel')}:</span>
                    <span style={{ color: '#34d399', fontWeight: 700 }}>
                      {Math.round(quality * 100)}%
                    </span>
                    <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>▼</span>
                  </button>
                  {qualityOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 6px)',
                        left: 0,
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        boxShadow: '0 12px 28px rgba(0,0,0,0.6)',
                        padding: '16px',
                        zIndex: 100,
                        minWidth: '220px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '0.825rem',
                            color: 'var(--text-main)',
                            fontWeight: 600,
                          }}
                        >
                          {tUI('quality', { percent: Math.round(quality * 100) })}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.05"
                        value={quality}
                        onChange={(e) => setQuality(Number(e.target.value))}
                        style={{ width: '100%', accentColor: '#3b82f6', cursor: 'pointer' }}
                      />
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'space-between' }}>
                        {[0.5, 0.7, 0.8, 0.9, 1.0].map((q) => (
                          <button
                            key={q}
                            type="button"
                            onClick={() => {
                              setQuality(q);
                              setQualityOpen(false);
                            }}
                            style={{
                              flex: 1,
                              padding: '4px 6px',
                              fontSize: '0.7rem',
                              borderRadius: '4px',
                              border: '1px solid var(--border-color)',
                              backgroundColor:
                                Math.abs(quality - q) < 0.01
                                  ? 'rgba(59, 130, 246, 0.25)'
                                  : 'var(--bg-page)',
                              color: Math.abs(quality - q) < 0.01 ? '#60a5fa' : 'var(--text-muted)',
                              cursor: 'pointer',
                              fontWeight: 600,
                            }}
                          >
                            {Math.round(q * 100)}%
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 6. [Resize All] button */}
                <button
                  type="button"
                  onClick={handleResizeAll}
                  disabled={loading}
                  style={{
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 20px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 10px rgba(37, 99, 235, 0.4)',
                    marginLeft: 'auto',
                  }}
                >
                  {loading ? tUI('processing') : tUI('resizeAll', { count: images.length })}
                </button>
              </div>

              {/* ===== SIDE-BY-SIDE RESPONSIVE GRID (BEFORE / AFTER) ===== */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
                  gap: '24px',
                  alignItems: 'start',
                }}
              >
                {/* ================= LEFT COLUMN: INPUT (ORIGINAL IMAGES) ================= */}
                <div
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {/* Title & Action Buttons on the right in the same line */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '16px',
                      flexWrap: 'wrap',
                      gap: '8px',
                      minHeight: '34px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.1rem' }}>📁</span>
                      <h3
                        style={{
                          color: 'var(--text-main)',
                          fontSize: '1rem',
                          fontWeight: 700,
                          margin: 0,
                        }}
                      >
                        {tUI('originalImages', { count: images.length })}
                      </h3>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          backgroundColor: 'rgba(59, 130, 246, 0.15)',
                          color: '#60a5fa',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {tUI('addMoreImages')}
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                      />
                      <button
                        type="button"
                        onClick={handleClearAll}
                        style={{
                          backgroundColor: 'rgba(239, 68, 68, 0.15)',
                          color: '#f87171',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {tUI('clearAll')}
                      </button>
                    </div>
                  </div>

                  {/* Vertical list of original images */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      maxHeight: '680px',
                      overflowY: 'auto',
                      paddingRight: '4px',
                    }}
                  >
                    {images.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          backgroundColor: 'var(--bg-page)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          padding: '10px 12px',
                          display: 'flex',
                          gap: '12px',
                          alignItems: 'center',
                        }}
                      >
                        <NextImage
                          src={item.src}
                          alt={item.file.name}
                          width={60}
                          height={60}
                          unoptimized
                          style={{
                            width: '60px',
                            height: '60px',
                            objectFit: 'contain',
                            borderRadius: '6px',
                            backgroundColor: 'var(--bg-page)',
                            flexShrink: 0,
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p
                            style={{
                              color: '#e2e8f0',
                              fontSize: '0.85rem',
                              margin: '0 0 4px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              fontWeight: 500,
                            }}
                            title={item.file.name}
                          >
                            {item.file.name}
                          </p>
                          <p style={{ color: '#64748b', fontSize: '0.75rem', margin: 0 }}>
                            {item.originalWidth} × {item.originalHeight} px
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(item.id)}
                          style={{
                            backgroundColor: 'rgba(239, 68, 68, 0.15)',
                            color: '#f87171',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '6px',
                            width: '26px',
                            height: '26px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                          title={tUI('remove')}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ================= RIGHT COLUMN: OUTPUT (PROCESSED IMAGES) ================= */}
                <div
                  style={{
                    backgroundColor: 'rgba(52, 211, 153, 0.03)',
                    border: '1px solid rgba(52, 211, 153, 0.2)',
                    borderRadius: '12px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {/* Title & Download All as ZIP on the right */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '16px',
                      flexWrap: 'wrap',
                      gap: '8px',
                      minHeight: '34px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.1rem' }}>✨</span>
                      <h3
                        style={{
                          color: 'var(--text-main)',
                          fontSize: '1rem',
                          fontWeight: 700,
                          margin: 0,
                        }}
                      >
                        {tUI('outputImages', { count: processedCount })}
                      </h3>
                    </div>

                    {processedCount > 0 && (
                      <button
                        type="button"
                        onClick={handleDownloadAllZip}
                        disabled={zipping}
                        style={{
                          backgroundColor: '#059669',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 14px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: zipping ? 'not-allowed' : 'pointer',
                          opacity: zipping ? 0.7 : 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          whiteSpace: 'nowrap',
                          boxShadow: '0 2px 8px rgba(5, 150, 105, 0.3)',
                        }}
                      >
                        {zipping
                          ? tUI('zipping')
                          : tUI('downloadAllZip', { count: processedCount })}
                      </button>
                    )}
                  </div>

                  {/* Vertical list of output images */}
                  {processedCount === 0 ? (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '48px 20px',
                        color: '#64748b',
                        fontSize: '0.85rem',
                        textAlign: 'center',
                        border: '1px dashed rgba(52, 211, 153, 0.25)',
                        borderRadius: '8px',
                        minHeight: '200px',
                      }}
                    >
                      <p style={{ margin: '0 0 14px', color: 'var(--text-muted)' }}>
                        {tUI('clickResizePrompt')}
                      </p>
                      <button
                        type="button"
                        onClick={handleResizeAll}
                        disabled={loading}
                        style={{
                          backgroundColor: '#2563eb',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 18px',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          cursor: loading ? 'not-allowed' : 'pointer',
                          opacity: loading ? 0.7 : 1,
                          boxShadow: '0 2px 8px rgba(37, 99, 235, 0.35)',
                        }}
                      >
                        {loading ? tUI('processing') : tUI('resizeAll', { count: images.length })}
                      </button>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        maxHeight: '680px',
                        overflowY: 'auto',
                        paddingRight: '4px',
                      }}
                    >
                      {images
                        .filter((img) => img.processedImage)
                        .map((item) => (
                          <div
                            key={`out-${item.id}`}
                            style={{
                              backgroundColor: 'var(--bg-page)',
                              border: '1px solid rgba(52, 211, 153, 0.25)',
                              borderRadius: '8px',
                              padding: '10px 12px',
                              display: 'flex',
                              gap: '12px',
                              alignItems: 'center',
                            }}
                          >
                            <NextImage
                              src={item.processedImage || ''}
                              alt={item.file.name}
                              width={60}
                              height={60}
                              unoptimized
                              style={{
                                width: '60px',
                                height: '60px',
                                objectFit: 'contain',
                                borderRadius: '6px',
                                backgroundColor: 'var(--bg-page)',
                                flexShrink: 0,
                              }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p
                                style={{
                                  color: '#e2e8f0',
                                  fontSize: '0.85rem',
                                  margin: '0 0 4px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  fontWeight: 500,
                                }}
                                title={getOutputFileName(item)}
                              >
                                {getOutputFileName(item)}
                              </p>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span
                                  style={{ color: '#34d399', fontSize: '0.75rem', fontWeight: 600 }}
                                >
                                  {width} × {height} px
                                </span>
                                <span
                                  style={{
                                    backgroundColor: 'rgba(52, 211, 153, 0.15)',
                                    color: '#34d399',
                                    borderRadius: '4px',
                                    padding: '1px 6px',
                                    fontSize: '0.65rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                  }}
                                >
                                  {getFormatShortName(outputFormat)}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDownloadSingle(item)}
                              style={{
                                backgroundColor: 'rgba(52, 211, 153, 0.15)',
                                color: '#34d399',
                                border: '1px solid rgba(52, 211, 153, 0.4)',
                                borderRadius: '8px',
                                width: '34px',
                                height: '34px',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                              title={tUI('downloadTooltip')}
                            >
                              ⬇
                            </button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <ToolSeoContent
            toolSlug="image-resizer"
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
    </>
  );
}
