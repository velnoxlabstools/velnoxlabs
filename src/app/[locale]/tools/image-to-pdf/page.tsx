'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import { jsPDF } from 'jspdf';
import {
  UploadCloud,
  Download,
  Trash2,
  ArrowUp,
  ArrowDown,
  FileImage,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Plus,
  FileText,
} from 'lucide-react';

interface UploadedImage {
  id: string;
  file: File;
  name: string;
  size: number;
  previewUrl: string;
  width: number;
  height: number;
}

type PageSizeOption = 'a4' | 'letter' | 'fit';
type OrientationOption = 'auto' | 'p' | 'l';
type MarginOption = 'none' | 'small' | 'normal';
type ImageFitOption = 'contain' | 'cover';

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function ImageToPdfPage() {
  const tUI = useTranslations('ToolUI.imageToPdf');

  const [images, setImages] = useState<UploadedImage[]>([]);
  const [pageSize, setPageSize] = useState<PageSizeOption>('a4');
  const [orientation, setOrientation] = useState<OrientationOption>('auto');
  const [margin, setMargin] = useState<MarginOption>('small');
  const [imageFit, setImageFit] = useState<ImageFitOption>('contain');

  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [generatedPdfSize, setGeneratedPdfSize] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef<UploadedImage[]>(images);
  imagesRef.current = images;

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      imagesRef.current.forEach((img) => {
        if (img.previewUrl) URL.revokeObjectURL(img.previewUrl);
      });
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  const processFiles = useCallback((files: FileList | File[]) => {
    const validFiles = Array.from(files).filter((file) =>
      ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type.toLowerCase())
    );

    if (validFiles.length === 0) return;

    validFiles.forEach((file) => {
      const previewUrl = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const newImg: UploadedImage = {
          id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          file,
          name: file.name,
          size: file.size,
          previewUrl,
          width: img.naturalWidth,
          height: img.naturalHeight,
        };
        setImages((prev) => [...prev, newImg]);
      };
      img.src = previewUrl;
    });

    // Reset previous conversion output
    setPdfBlob(null);
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
    setGeneratedPdfSize(null);
  }, [pdfUrl]);

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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    setImages((prev) => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
    // Reset converted state when order changes
    setPdfBlob(null);
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const item = prev[index];
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
    setPdfBlob(null);
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  };

  const clearAllImages = () => {
    images.forEach((img) => {
      if (img.previewUrl) URL.revokeObjectURL(img.previewUrl);
    });
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setImages([]);
    setPdfBlob(null);
    setPdfUrl(null);
    setGeneratedPdfSize(null);
  };

  // Convert images to PDF using jsPDF
  const convertToPdf = async () => {
    if (images.length === 0) return;
    setIsConverting(true);

    try {
      // Determine margin in points (1 mm = 2.83465 pt)
      let marginPt = 0;
      if (margin === 'small') marginPt = 14.17; // ~5mm
      if (margin === 'normal') marginPt = 34.01; // ~12mm

      let doc: jsPDF | null = null;

      for (let i = 0; i < images.length; i++) {
        const item = images[i];

        // Draw image onto canvas to obtain a clean JPEG data URL
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error('Failed to get canvas 2d context'));
              return;
            }
            // Fill background white for transparent PNG/WebP images
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/jpeg', 0.95));
          };
          img.onerror = (err) => reject(err);
          img.src = item.previewUrl;
        });

        const imgW = item.width;
        const imgH = item.height;

        // Determine page dimensions in points (pt)
        let pageW = 595.28; // default A4 pt
        let pageH = 841.89;
        let pageOrientation: 'p' | 'l' = 'p';

        if (pageSize === 'fit') {
          // Exactly fit the image dimensions (at 72 DPI, 1 px = 1 pt)
          pageW = imgW * 0.75;
          pageH = imgH * 0.75;
          pageOrientation = pageW > pageH ? 'l' : 'p';
          marginPt = 0;
        } else if (pageSize === 'letter') {
          if (orientation === 'auto') {
            pageOrientation = imgW > imgH ? 'l' : 'p';
          } else {
            pageOrientation = orientation === 'l' ? 'l' : 'p';
          }
          pageW = pageOrientation === 'l' ? 792.0 : 612.0;
          pageH = pageOrientation === 'l' ? 612.0 : 792.0;
        } else {
          // A4
          if (orientation === 'auto') {
            pageOrientation = imgW > imgH ? 'l' : 'p';
          } else {
            pageOrientation = orientation === 'l' ? 'l' : 'p';
          }
          pageW = pageOrientation === 'l' ? 841.89 : 595.28;
          pageH = pageOrientation === 'l' ? 595.28 : 841.89;
        }

        // Initialize document on first image, add page on subsequent
        if (i === 0) {
          doc = new jsPDF({
            orientation: pageOrientation,
            unit: 'pt',
            format: [pageW, pageH],
          });
        } else if (doc) {
          doc.addPage([pageW, pageH], pageOrientation);
        }

        if (!doc) continue;

        // Calculate printable area
        const printableW = Math.max(1, pageW - marginPt * 2);
        const printableH = Math.max(1, pageH - marginPt * 2);

        let renderW = printableW;
        let renderH = printableH;
        let renderX = marginPt;
        let renderY = marginPt;

        if (imageFit === 'contain' && pageSize !== 'fit') {
          const ratio = Math.min(printableW / imgW, printableH / imgH);
          renderW = imgW * ratio;
          renderH = imgH * ratio;
          renderX = marginPt + (printableW - renderW) / 2;
          renderY = marginPt + (printableH - renderH) / 2;
        }

        doc.addImage(dataUrl, 'JPEG', renderX, renderY, renderW, renderH);
      }

      if (doc) {
        const outputBlob = doc.output('blob');
        const outputUrl = URL.createObjectURL(outputBlob);
        setPdfBlob(outputBlob);
        setPdfUrl(outputUrl);
        setGeneratedPdfSize(outputBlob.size);
      }
    } catch (error) {
      console.error('PDF Generation Error:', error);
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (!pdfUrl) return;
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = tUI('downloadFilename') || 'converted-document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <GlobalContainer>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 16px' }}>
        <SectionHeading title={tUI('title')} subtitle={tUI('subtitle')} />

        {/* Upload Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            marginTop: '24px',
            padding: '36px 20px',
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
            multiple
            accept="image/jpeg,image/png,image/webp,image/jpg"
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
          />
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: 'var(--accent)',
            }}
          >
            <UploadCloud size={28} />
          </div>
          <h3
            style={{
              fontSize: '1.1rem',
              fontWeight: 600,
              color: 'var(--text-main)',
              marginBottom: '6px',
            }}
          >
            {tUI('dropTitle')}
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '16px' }}>
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
              padding: '8px 20px',
              borderRadius: '6px',
              backgroundColor: 'var(--accent)',
              color: '#ffffff',
              fontSize: '0.875rem',
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Plus size={16} />
            {tUI('browseFiles')}
          </button>
        </div>

        {/* Options Panel */}
        {images.length > 0 && (
          <div
            style={{
              marginTop: '24px',
              padding: '20px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
                color: 'var(--text-main)',
                fontWeight: 600,
                fontSize: '0.95rem',
              }}
            >
              <Sliders size={18} />
              <span>{tUI('pageSize')} / {tUI('orientation')} / {tUI('margin')}</span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
              }}
            >
              {/* Page Size */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    color: '#94a3b8',
                    marginBottom: '6px',
                    fontWeight: 500,
                  }}
                >
                  {tUI('pageSize')}
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value as PageSizeOption)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-page)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem',
                  }}
                >
                  <option value="a4">{tUI('pageSizeA4')}</option>
                  <option value="letter">{tUI('pageSizeLetter')}</option>
                  <option value="fit">{tUI('pageSizeFit')}</option>
                </select>
              </div>

              {/* Orientation */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    color: '#94a3b8',
                    marginBottom: '6px',
                    fontWeight: 500,
                  }}
                >
                  {tUI('orientation')}
                </label>
                <select
                  value={orientation}
                  disabled={pageSize === 'fit'}
                  onChange={(e) => setOrientation(e.target.value as OrientationOption)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-page)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem',
                    opacity: pageSize === 'fit' ? 0.5 : 1,
                  }}
                >
                  <option value="auto">{tUI('orientationAuto')}</option>
                  <option value="p">{tUI('orientationPortrait')}</option>
                  <option value="l">{tUI('orientationLandscape')}</option>
                </select>
              </div>

              {/* Margins */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    color: '#94a3b8',
                    marginBottom: '6px',
                    fontWeight: 500,
                  }}
                >
                  {tUI('margin')}
                </label>
                <select
                  value={margin}
                  disabled={pageSize === 'fit'}
                  onChange={(e) => setMargin(e.target.value as MarginOption)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-page)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem',
                    opacity: pageSize === 'fit' ? 0.5 : 1,
                  }}
                >
                  <option value="none">{tUI('marginNone')}</option>
                  <option value="small">{tUI('marginSmall')}</option>
                  <option value="normal">{tUI('marginNormal')}</option>
                </select>
              </div>

              {/* Image Fit */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    color: '#94a3b8',
                    marginBottom: '6px',
                    fontWeight: 500,
                  }}
                >
                  {tUI('imageFit')}
                </label>
                <select
                  value={imageFit}
                  disabled={pageSize === 'fit'}
                  onChange={(e) => setImageFit(e.target.value as ImageFitOption)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-page)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem',
                    opacity: pageSize === 'fit' ? 0.5 : 1,
                  }}
                >
                  <option value="contain">{tUI('imageFitContain')}</option>
                  <option value="cover">{tUI('imageFitFill')}</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Uploaded Images List & Reordering */}
        {images.length > 0 && (
          <div style={{ marginTop: '24px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    color: 'var(--text-main)',
                    fontWeight: 600,
                    fontSize: '1rem',
                  }}
                >
                  {tUI('imagesUploaded')} ({images.length})
                </span>
              </div>
              <button
                type="button"
                onClick={clearAllImages}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '4px',
                }}
              >
                <Trash2 size={15} />
                {tUI('clearAll')}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {images.map((item, index) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    gap: '12px',
                  }}
                >
                  {/* Left: Thumbnail & Name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                    <span
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: '#64748b',
                        width: '24px',
                      }}
                    >
                      #{index + 1}
                    </span>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        backgroundColor: 'var(--bg-page)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      {item.previewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.previewUrl}
                          alt={item.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <FileImage size={24} color="#64748b" />
                      )}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '0.9rem',
                          fontWeight: 500,
                          color: 'var(--text-main)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '280px',
                        }}
                      >
                        {item.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                        {item.width} × {item.height} px • {formatFileSize(item.size)}
                      </div>
                    </div>
                  </div>

                  {/* Right: Reorder Up/Down & Remove */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveImage(index, 'up')}
                      title={tUI('moveUp')}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-page)',
                        color: index === 0 ? '#475569' : 'var(--text-main)',
                        cursor: index === 0 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button
                      type="button"
                      disabled={index === images.length - 1}
                      onClick={() => moveImage(index, 'down')}
                      title={tUI('moveDown')}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-page)',
                        color: index === images.length - 1 ? '#475569' : 'var(--text-main)',
                        cursor: index === images.length - 1 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <ArrowDown size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      title={tUI('remove')}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        backgroundColor: 'rgba(239, 68, 68, 0.08)',
                        color: '#ef4444',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Controls: Convert to PDF & Download PDF */}
        {images.length > 0 && (
          <div
            style={{
              marginTop: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              padding: '20px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={20} color="var(--accent)" />
                <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                  {tUI('totalPages')}: <strong style={{ color: 'var(--text-main)' }}>{images.length}</strong>
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  type="button"
                  onClick={convertToPdf}
                  disabled={isConverting}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 24px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--accent)',
                    color: '#ffffff',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    border: 'none',
                    cursor: isConverting ? 'not-allowed' : 'pointer',
                    opacity: isConverting ? 0.7 : 1,
                  }}
                >
                  {isConverting ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      {tUI('converting')}
                    </>
                  ) : (
                    <>
                      <FileText size={18} />
                      {tUI('convertToPdf')}
                    </>
                  )}
                </button>

                {pdfBlob && pdfUrl && (
                  <button
                    type="button"
                    onClick={handleDownload}
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
                      cursor: 'pointer',
                    }}
                  >
                    <Download size={18} />
                    {tUI('downloadPdf')}
                  </button>
                )}
              </div>
            </div>

            {/* Success Notification */}
            {pdfBlob && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 16px',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '8px',
                  color: '#10b981',
                  fontSize: '0.875rem',
                }}
              >
                <CheckCircle2 size={18} />
                <span>
                  {tUI('successMessage')} ({formatFileSize(generatedPdfSize || 0)}) • {tUI('pdfReady')}
                </span>
              </div>
            )}
          </div>
        )}

        <ToolSeoContent
          toolSlug="image-to-pdf"
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
