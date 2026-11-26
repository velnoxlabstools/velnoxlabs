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
  ShieldCheck,
  Scale,
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
type PdfSizeMode = 'high' | '100kb' | '200kb' | '500kb' | '1024kb' | 'custom';

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function loadHtmlImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

export default function ImageToPdfPage() {
  const tUI = useTranslations('ToolUI.imageToPdf');

  const [images, setImages] = useState<UploadedImage[]>([]);
  const [pageSize, setPageSize] = useState<PageSizeOption>('a4');
  const [orientation, setOrientation] = useState<OrientationOption>('auto');
  const [margin, setMargin] = useState<MarginOption>('small');
  const [imageFit, setImageFit] = useState<ImageFitOption>('contain');
  const [includePageNumbers, setIncludePageNumbers] = useState<boolean>(false);

  // Target PDF Size Optimizer
  const [pdfSizeMode, setPdfSizeMode] = useState<PdfSizeMode>('high');
  const [customPdfKB, setCustomPdfKB] = useState<string>('150');

  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [generatedPdfSize, setGeneratedPdfSize] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef<UploadedImage[]>(images);
  imagesRef.current = images;

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((img) => {
        if (img.previewUrl) URL.revokeObjectURL(img.previewUrl);
      });
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  const processFiles = useCallback(
    (files: FileList | File[]) => {
      const validFiles = Array.from(files).filter(
        (file) =>
          file.type.startsWith('image/') || /\.(jpe?g|png|webp|avif|bmp|gif)$/i.test(file.name)
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

      setPdfBlob(null);
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
      }
      setGeneratedPdfSize(null);
    },
    [pdfUrl]
  );

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

  // Assemble PDF from pre-loaded HTMLImageElements at given scale and JPEG quality
  const assemblePdfBlob = async (
    loadedImages: { img: HTMLImageElement; item: UploadedImage }[],
    scale: number,
    jpegQuality: number
  ): Promise<Blob> => {
    let marginPt = 0;
    if (margin === 'small') marginPt = 14.17;
    if (margin === 'normal') marginPt = 34.01;

    let doc: jsPDF | null = null;
    const totalPages = loadedImages.length;

    for (let i = 0; i < totalPages; i++) {
      const { img, item } = loadedImages[i];
      const targetW = Math.max(40, Math.round(img.naturalWidth * scale));
      const targetH = Math.max(40, Math.round(img.naturalHeight * scale));

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context failed');

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, targetW, targetH);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, targetW, targetH);

      const dataUrl = canvas.toDataURL('image/jpeg', jpegQuality);

      const imgW = item.width;
      const imgH = item.height;

      let pageW = 595.28;
      let pageH = 841.89;
      let pageOrientation: 'p' | 'l' = 'p';
      let currentMargin = marginPt;

      if (pageSize === 'fit') {
        pageW = imgW * 0.75;
        pageH = imgH * 0.75;
        pageOrientation = pageW > pageH ? 'l' : 'p';
        currentMargin = 0;
      } else if (pageSize === 'letter') {
        pageOrientation =
          orientation === 'auto' ? (imgW > imgH ? 'l' : 'p') : orientation === 'l' ? 'l' : 'p';
        pageW = pageOrientation === 'l' ? 792.0 : 612.0;
        pageH = pageOrientation === 'l' ? 612.0 : 792.0;
      } else {
        pageOrientation =
          orientation === 'auto' ? (imgW > imgH ? 'l' : 'p') : orientation === 'l' ? 'l' : 'p';
        pageW = pageOrientation === 'l' ? 841.89 : 595.28;
        pageH = pageOrientation === 'l' ? 595.28 : 841.89;
      }

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

      const printableW = Math.max(1, pageW - currentMargin * 2);
      const printableH = Math.max(1, pageH - currentMargin * 2);

      let renderW = printableW;
      let renderH = printableH;
      let renderX = currentMargin;
      let renderY = currentMargin;

      if (imageFit === 'contain' && pageSize !== 'fit') {
        const ratio = Math.min(printableW / imgW, printableH / imgH);
        renderW = imgW * ratio;
        renderH = imgH * ratio;
        renderX = currentMargin + (printableW - renderW) / 2;
        renderY = currentMargin + (printableH - renderH) / 2;
      }

      doc.addImage(dataUrl, 'JPEG', renderX, renderY, renderW, renderH);

      if (includePageNumbers && pageSize !== 'fit') {
        doc.setFontSize(9);
        doc.setTextColor(120, 120, 120);
        doc.text(`${i + 1} / ${totalPages}`, pageW / 2, pageH - 8, { align: 'center' });
      }
    }

    if (!doc) throw new Error('Failed to initialize PDF document');
    return doc.output('blob');
  };

  const convertToPdf = async () => {
    if (images.length === 0) return;
    setIsConverting(true);

    try {
      const loadedImages = await Promise.all(
        images.map(async (item) => ({
          img: await loadHtmlImage(item.previewUrl),
          item,
        }))
      );

      let targetKB = 0;
      if (pdfSizeMode === '100kb') targetKB = 100;
      else if (pdfSizeMode === '200kb') targetKB = 200;
      else if (pdfSizeMode === '500kb') targetKB = 500;
      else if (pdfSizeMode === '1024kb') targetKB = 1024;
      else if (pdfSizeMode === 'custom') targetKB = Math.max(15, parseInt(customPdfKB, 10) || 150);

      let finalBlob: Blob;

      if (targetKB === 0) {
        // High Quality Mode
        finalBlob = await assemblePdfBlob(loadedImages, 1.0, 0.92);
      } else {
        // Multi-pass binary search to hit target PDF KB
        const targetBytes = targetKB * 1024;
        const scales = [1.0, 0.72, 0.52, 0.36, 0.25];
        let bestBlob: Blob | null = null;

        for (const s of scales) {
          let minQ = 0.12;
          let maxQ = 0.92;
          let passBest: Blob | null = null;

          for (let iter = 0; iter < 5; iter++) {
            const midQ = (minQ + maxQ) / 2;
            const b = await assemblePdfBlob(loadedImages, s, midQ);
            if (b.size <= targetBytes) {
              passBest = b;
              minQ = midQ;
            } else {
              maxQ = midQ;
            }
          }

          if (passBest) {
            bestBlob = passBest;
            break;
          }
        }

        if (!bestBlob) {
          bestBlob = await assemblePdfBlob(loadedImages, 0.2, 0.15);
        }
        finalBlob = bestBlob;
      }

      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      const outputUrl = URL.createObjectURL(finalBlob);
      setPdfBlob(finalBlob);
      setPdfUrl(outputUrl);
      setGeneratedPdfSize(finalBlob.size);
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

  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: 'AI Image to PDF Converter Online - VelnoxLabs',
        url: 'https://velnoxlabs.com/tools/image-to-pdf',
        description:
          'Free AI online image to PDF converter. Convert JPG, PNG, WebP, and AI-generated images into compressed 100KB or 200KB PDF documents directly in your browser.',
        applicationCategory: 'MultimediaApplication',
        operatingSystem: 'Any',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How to convert images to a 100KB or 200KB PDF online?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Upload your images, select 100 KB or 200 KB in the Target PDF Size panel, and click Convert to PDF. The optimizer automatically balances resolution and compression to keep the final PDF under your selected limit.',
            },
          },
          {
            '@type': 'Question',
            name: 'Can I convert Canva, ChatGPT, and AI images to PDF?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes! You can upload JPG, PNG, WebP, AVIF, GIF, and BMP images exported from Canva, ChatGPT, or DALL-E and merge them into a multi-page PDF locally in your browser.',
            },
          },
        ],
      },
    ],
  };

  return (
    <GlobalContainer>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <SectionHeading title={tUI('title')} subtitle={tUI('subtitle')} />

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Upload Dropzone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 select-none ${
            isDragging
              ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 scale-[1.01]'
              : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:border-blue-400 dark:hover:border-blue-500 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.jpg,.jpeg,.png,.webp,.avif,.bmp,.gif"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <UploadCloud className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-bold text-[var(--text-main)]">
                {tUI('dropTitle')}
              </h3>
              <p className="text-sm text-[var(--text-muted)] mt-1">{tUI('dropSubtitle')}</p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>{tUI('browseFiles')}</span>
              </button>
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-500/20">
                <ShieldCheck className="w-4 h-4" />
                100% Client-Side Private
              </span>
            </div>
          </div>
        </div>

        {/* Settings & Target PDF Size Panel */}
        <div className="rounded-2xl p-6 border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-base font-semibold text-[var(--text-main)]">
                {tUI('settingsTitle')}
              </h2>
            </div>

            {images.length > 0 && (
              <button
                type="button"
                onClick={clearAllImages}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{tUI('clearAll')}</span>
              </button>
            )}
          </div>

          {/* Target PDF Size Optimizer (100KB, 200KB, 500KB, 1MB) */}
          <div className="p-4 rounded-xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 space-y-3">
            <label className="text-xs font-bold text-[var(--text-main)] flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-blue-600" />
              <span>{tUI('targetPdfSizeLabel')}</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {[
                { id: 'high' as PdfSizeMode, label: tUI('sizeHighQuality') },
                { id: '100kb' as PdfSizeMode, label: '<= 100 KB' },
                { id: '200kb' as PdfSizeMode, label: '<= 200 KB' },
                { id: '500kb' as PdfSizeMode, label: '<= 500 KB' },
                { id: '1024kb' as PdfSizeMode, label: '<= 1 MB' },
                { id: 'custom' as PdfSizeMode, label: tUI('sizeCustom') },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setPdfSizeMode(opt.id);
                    setPdfBlob(null);
                    setPdfUrl(null);
                  }}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    pdfSizeMode === opt.id
                      ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                      : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)] hover:border-blue-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {pdfSizeMode === 'custom' && (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="number"
                  min="15"
                  max="50000"
                  value={customPdfKB}
                  onChange={(e) => setCustomPdfKB(e.target.value)}
                  className="w-28 px-3 py-1.5 text-xs font-mono rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)]"
                />
                <span className="text-xs font-semibold text-[var(--text-muted)]">KB max</span>
              </div>
            )}
          </div>

          {/* PDF Layout Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1.5">
                {tUI('pageSize')}
              </label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value as PageSizeOption)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] text-xs font-medium text-[var(--text-main)]"
              >
                <option value="a4">{tUI('pageSizeA4')}</option>
                <option value="letter">{tUI('pageSizeLetter')}</option>
                <option value="fit">{tUI('pageSizeFit')}</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1.5">
                {tUI('orientation')}
              </label>
              <select
                value={orientation}
                disabled={pageSize === 'fit'}
                onChange={(e) => setOrientation(e.target.value as OrientationOption)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] text-xs font-medium text-[var(--text-main)] disabled:opacity-50"
              >
                <option value="auto">{tUI('orientationAuto')}</option>
                <option value="p">{tUI('orientationPortrait')}</option>
                <option value="l">{tUI('orientationLandscape')}</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1.5">
                {tUI('margin')}
              </label>
              <select
                value={margin}
                disabled={pageSize === 'fit'}
                onChange={(e) => setMargin(e.target.value as MarginOption)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] text-xs font-medium text-[var(--text-main)] disabled:opacity-50"
              >
                <option value="none">{tUI('marginNone')}</option>
                <option value="small">{tUI('marginSmall')}</option>
                <option value="normal">{tUI('marginNormal')}</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1.5">
                {tUI('imageFit')}
              </label>
              <select
                value={imageFit}
                disabled={pageSize === 'fit'}
                onChange={(e) => setImageFit(e.target.value as ImageFitOption)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] text-xs font-medium text-[var(--text-main)] disabled:opacity-50"
              >
                <option value="contain">{tUI('imageFitContain')}</option>
                <option value="cover">{tUI('imageFitFill')}</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[var(--border-color)]">
            <label className="inline-flex items-center gap-2 text-xs font-medium text-[var(--text-main)] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includePageNumbers}
                onChange={(e) => setIncludePageNumbers(e.target.checked)}
                className="rounded border-[var(--border-color)] accent-blue-600"
              />
              <span>{tUI('includePageNumbers')}</span>
            </label>

            <button
              type="button"
              onClick={convertToPdf}
              disabled={isConverting || images.length === 0}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isConverting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{tUI('converting')}</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>{tUI('convertToPdf')}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Success Output Banner */}
        {pdfBlob && pdfUrl && (
          <div className="rounded-2xl p-5 border border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-[var(--text-main)]">
                  {tUI('successMessage')}
                </h3>
                <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
                  {tUI('totalPages')}: {images.length} • {tUI('fileSize')}:{' '}
                  <strong className="text-emerald-600 dark:text-emerald-400">
                    {formatFileSize(generatedPdfSize || 0)}
                  </strong>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{tUI('downloadPdf')}</span>
            </button>
          </div>
        )}

        {/* Uploaded Images Reorder Queue */}
        {images.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[var(--text-main)] flex items-center gap-2">
              <FileImage className="w-4 h-4 text-blue-600" />
              <span>
                {tUI('imagesUploaded')} ({images.length})
              </span>
            </h3>

            <div className="space-y-2.5">
              {images.map((item, idx) => (
                <div
                  key={item.id}
                  className="rounded-xl p-3.5 border border-[var(--border-color)] bg-[var(--bg-card)] flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono font-bold text-[var(--text-muted)] w-6 text-center">
                      #{idx + 1}
                    </span>
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-[var(--border-color)] flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.previewUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-[var(--text-main)] truncate max-w-xs sm:max-w-md">
                        {item.name}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] font-mono">
                        {item.width} × {item.height} px • {formatFileSize(item.size)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => moveImage(idx, 'up')}
                      disabled={idx === 0}
                      title={tUI('moveUp')}
                      className="p-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-page)] text-[var(--text-main)] disabled:opacity-30 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveImage(idx, 'down')}
                      disabled={idx === images.length - 1}
                      title={tUI('moveDown')}
                      className="p-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-page)] text-[var(--text-main)] disabled:opacity-30 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      title={tUI('remove')}
                      className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Clean Standard HTML Comparison Table */}
        <div className="rounded-2xl p-6 border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm space-y-4">
          <h3 className="text-base font-bold text-[var(--text-main)]">{tUI('comparisonTitle')}</h3>

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
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-main)]">
                <tr>
                  <td className="py-2.5 px-3 font-medium">{tUI('compRow1Feature')}</td>
                  <td className="py-2.5 px-3 font-semibold text-emerald-600 dark:text-emerald-400">
                    {tUI('compRow1Velnox')}
                  </td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">{tUI('compRow1ILove')}</td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">{tUI('compRow1Canva')}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium">{tUI('compRow2Feature')}</td>
                  <td className="py-2.5 px-3 font-semibold text-emerald-600 dark:text-emerald-400">
                    {tUI('compRow2Velnox')}
                  </td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">{tUI('compRow2ILove')}</td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">{tUI('compRow2Canva')}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium">{tUI('compRow3Feature')}</td>
                  <td className="py-2.5 px-3 font-semibold text-emerald-600 dark:text-emerald-400">
                    {tUI('compRow3Velnox')}
                  </td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">{tUI('compRow3ILove')}</td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">{tUI('compRow3Canva')}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium">{tUI('compRow4Feature')}</td>
                  <td className="py-2.5 px-3 font-semibold text-emerald-600 dark:text-emerald-400">
                    {tUI('compRow4Velnox')}
                  </td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">{tUI('compRow4ILove')}</td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">{tUI('compRow4Canva')}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

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
