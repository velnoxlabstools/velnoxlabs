'use client';

import React, { useState, useRef } from 'react';
import NextImage from 'next/image';
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
  const [images, setImages] = useState<ImageItem[]>([]);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [outputFormat, setOutputFormat] = useState('image/jpeg');
  const [quality, setQuality] = useState(0.9);
  const [loading, setLoading] = useState(false);
  const [zipping, setZipping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      alert('ZIP banane mein error aaya. Kya aapne "npm install jszip" chalaya hai?');
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
          <SectionHeading
            title="Online Image Resizer & Compressor"
            subtitle="Resize, compress, and convert multiple images at once — JPG, PNG, WEBP. Download individually or as ZIP."
          />

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
                Click to upload images (Multiple allowed)
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                PNG, JPG, WEBP supported — select as many as you want
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
              {/* ===== TOP TOOLBAR ===== */}
              <div
                style={{
                  marginTop: 'var(--space-6)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <p
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    margin: 0,
                  }}
                >
                  {images.length} image{images.length > 1 ? 's' : ''} selected
                  {processedCount > 0 && ` • ${processedCount} processed`}
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      backgroundColor: 'rgba(59, 130, 246, 0.15)',
                      color: '#60a5fa',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '6px',
                      padding: '6px 14px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    + Add More
                  </button>
                  <button
                    onClick={handleClearAll}
                    style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      color: '#f87171',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '6px',
                      padding: '6px 14px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Clear All
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>

              {/* ===== TWO COLUMN LAYOUT: LEFT = INPUT, RIGHT = OUTPUT ===== */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: '20px',
                  marginTop: '20px',
                }}
              >
                {/* LEFT COLUMN: Original Images */}
                <div
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '20px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '16px',
                    }}
                  >
                    <span style={{ fontSize: '1.1rem' }}>📁</span>
                    <h3
                      style={{
                        color: 'var(--text-main)',
                        fontSize: '1rem',
                        fontWeight: 700,
                        margin: 0,
                      }}
                    >
                      Original Images ({images.length})
                    </h3>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      maxHeight: '600px',
                      overflowY: 'auto',
                    }}
                  >
                    {images.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          backgroundColor: 'var(--bg-page)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          padding: '10px',
                          display: 'flex',
                          gap: '12px',
                          alignItems: 'center',
                        }}
                      >
                        <NextImage
                          src={item.src}
                          alt={item.file.name}
                          width={70}
                          height={70}
                          unoptimized
                          style={{
                            width: '70px',
                            height: '70px',
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
                              fontSize: '0.8rem',
                              margin: '0 0 4px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {item.file.name}
                          </p>
                          <p style={{ color: '#64748b', fontSize: '0.7rem', margin: 0 }}>
                            {item.originalWidth} × {item.originalHeight} px
                          </p>
                        </div>
                        <button
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
                          title="Remove"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RIGHT COLUMN: Processed Output */}
                <div
                  style={{
                    backgroundColor: 'rgba(52, 211, 153, 0.03)',
                    border: '1px solid rgba(52, 211, 153, 0.15)',
                    borderRadius: '12px',
                    padding: '20px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '16px',
                    }}
                  >
                    <span style={{ fontSize: '1.1rem' }}>✨</span>
                    <h3
                      style={{
                        color: 'var(--text-main)',
                        fontSize: '1rem',
                        fontWeight: 700,
                        margin: 0,
                      }}
                    >
                      Output Images ({processedCount})
                    </h3>
                  </div>

                  {processedCount === 0 ? (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '40px 20px',
                        color: '#64748b',
                        fontSize: '0.85rem',
                        textAlign: 'center',
                      }}
                    >
                      <p style={{ margin: 0 }}>
                        Click &quot;Resize All&quot; to see processed images here
                      </p>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        maxHeight: '600px',
                        overflowY: 'auto',
                      }}
                    >
                      {images
                        .filter((img) => img.processedImage)
                        .map((item) => (
                          <div
                            key={`out-${item.id}`}
                            style={{
                              backgroundColor: 'var(--bg-page)',
                              border: '1px solid rgba(52, 211, 153, 0.2)',
                              borderRadius: '8px',
                              padding: '10px',
                              display: 'flex',
                              gap: '12px',
                              alignItems: 'center',
                            }}
                          >
                            <NextImage
                              src={item.processedImage || ''}
                              alt={item.file.name}
                              width={70}
                              height={70}
                              unoptimized
                              style={{
                                width: '70px',
                                height: '70px',
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
                                  fontSize: '0.8rem',
                                  margin: '0 0 4px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {getOutputFileName(item)}
                              </p>
                              <p style={{ color: '#34d399', fontSize: '0.7rem', margin: 0 }}>
                                {width} × {height} px
                              </p>
                            </div>
                            <button
                              onClick={() => handleDownloadSingle(item)}
                              style={{
                                backgroundColor: 'rgba(52, 211, 153, 0.15)',
                                color: '#34d399',
                                border: '1px solid rgba(52, 211, 153, 0.4)',
                                borderRadius: '6px',
                                width: '34px',
                                height: '34px',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                              title="Download this image"
                            >
                              ⬇
                            </button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ===== SETTINGS PANEL ===== */}
              <div
                style={{
                  marginTop: '24px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '24px',
                }}
              >
                <h3
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    marginBottom: '16px',
                  }}
                >
                  ⚙️ Conversion Settings
                </h3>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '16px',
                  }}
                >
                  <div>
                    <label
                      style={{
                        color: 'var(--text-main)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        display: 'block',
                        marginBottom: '6px',
                      }}
                    >
                      Width (px):
                    </label>
                    <input
                      type="number"
                      value={width}
                      onChange={(e) => handleWidthChange(Number(e.target.value))}
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'var(--text-main)',
                        padding: '10px',
                        fontSize: '0.9rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        color: 'var(--text-main)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        display: 'block',
                        marginBottom: '6px',
                      }}
                    >
                      Height (px):
                    </label>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => handleHeightChange(Number(e.target.value))}
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'var(--text-main)',
                        padding: '10px',
                        fontSize: '0.9rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        color: 'var(--text-main)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        display: 'block',
                        marginBottom: '6px',
                      }}
                    >
                      Output Format:
                    </label>
                    <select
                      value={outputFormat}
                      onChange={(e) => setOutputFormat(e.target.value)}
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'var(--text-main)',
                        padding: '10px',
                        fontSize: '0.9rem',
                        outline: 'none',
                      }}
                    >
                      <option value="image/jpeg">JPEG (JPG)</option>
                      <option value="image/png">PNG</option>
                      <option value="image/webp">WEBP</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: '16px' }}>
                  <label
                    style={{
                      color: 'var(--text-main)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      display: 'block',
                      marginBottom: '6px',
                    }}
                  >
                    Quality: {Math.round(quality * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
                  <label
                    style={{
                      color: 'var(--text-muted)',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={maintainAspect}
                      onChange={(e) => setMaintainAspect(e.target.checked)}
                    />
                    Maintain Aspect Ratio
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
                  <button
                    onClick={handleResizeAll}
                    disabled={loading}
                    style={{
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 24px',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.7 : 1,
                    }}
                  >
                    {loading ? 'Processing...' : `🚀 Resize All (${images.length})`}
                  </button>
                  {processedCount > 0 && (
                    <button
                      onClick={handleDownloadAllZip}
                      disabled={zipping}
                      style={{
                        backgroundColor: '#059669',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px 24px',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        cursor: zipping ? 'not-allowed' : 'pointer',
                        opacity: zipping ? 0.7 : 1,
                      }}
                    >
                      {zipping ? 'Zipping...' : `📦 Download All as ZIP (${processedCount})`}
                    </button>
                  )}
                </div>
              </div>
            </>
          )}

          <ToolSeoContent toolSlug="image-resizer" toolName="Image Resizer" />
        </div>
      </GlobalContainer>
    </>
  );
}
