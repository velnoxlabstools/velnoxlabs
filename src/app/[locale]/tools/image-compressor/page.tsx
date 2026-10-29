'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import {
  UploadCloud,
  Download,
  Trash2,
  Sliders,
  CheckCircle2,
  Plus,
  RefreshCw,
  FileImage,
  FileArchive,
  AlertCircle,
} from 'lucide-react';

interface ImageItem {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  previewUrl: string;
  compressedBlob: Blob | null;
  compressedUrl: string | null;
  compressedSize: number | null;
  savedPercent: number | null;
  status: 'idle' | 'compressing' | 'done' | 'error';
  errorMessage?: string;
}

type OutputFormat = 'image/jpeg' | 'image/png' | 'image/webp';

function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export default function ImageCompressorPage() {
  const tUI = useTranslations('ToolUI.imageCompressor');

  const [items, setItems] = useState<ImageItem[]>([]);
  const [quality, setQuality] = useState<number>(80);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('image/webp');
  const [isDragging, setIsDragging] = useState(false);
  const [zipping, setZipping] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const itemsRef = useRef<ImageItem[]>(items);
  itemsRef.current = items;

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
        if (item.compressedUrl) URL.revokeObjectURL(item.compressedUrl);
      });
    };
  }, []);

  const compressSingleItem = useCallback(
    async (
      item: ImageItem,
      targetQuality: number,
      targetFormat: OutputFormat
    ): Promise<{ blob: Blob; url: string; size: number; savedPercent: number }> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth || img.width;
            canvas.height = img.naturalHeight || img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error('Canvas context not available'));
              return;
            }

            // Fill white background for JPEG to handle PNG transparency
            if (targetFormat === 'image/jpeg') {
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            ctx.drawImage(img, 0, 0);

            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error('Compression failed'));
                  return;
                }
                const url = URL.createObjectURL(blob);
                const saved =
                  item.originalSize > 0
                    ? Math.round(((item.originalSize - blob.size) / item.originalSize) * 100)
                    : 0;
                resolve({ blob, url, size: blob.size, savedPercent: saved });
              },
              targetFormat,
              targetQuality / 100
            );
          } catch (err) {
            reject(err);
          }
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = item.previewUrl;
      });
    },
    []
  );

  // Compress a batch of items
  const runCompression = useCallback(
    async (list: ImageItem[], targetQuality: number, targetFormat: OutputFormat) => {
      if (list.length === 0) return;

      setItems((prev) =>
        prev.map((it) => (list.some((l) => l.id === it.id) ? { ...it, status: 'compressing' } : it))
      );

      const updated = await Promise.all(
        list.map(async (item) => {
          try {
            // Revoke old compressed url if exists
            if (item.compressedUrl) URL.revokeObjectURL(item.compressedUrl);

            const result = await compressSingleItem(item, targetQuality, targetFormat);
            return {
              ...item,
              compressedBlob: result.blob,
              compressedUrl: result.url,
              compressedSize: result.size,
              savedPercent: result.savedPercent,
              status: 'done' as const,
            };
          } catch (err) {
            return {
              ...item,
              status: 'error' as const,
              errorMessage: err instanceof Error ? err.message : 'Compression error',
            };
          }
        })
      );

      setItems((prev) =>
        prev.map((it) => {
          const match = updated.find((u) => u.id === it.id);
          return match || it;
        })
      );
    },
    [compressSingleItem]
  );

  // Re-compress all when quality or format changes
  const prevSettingsRef = useRef({ quality, outputFormat });
  useEffect(() => {
    if (
      prevSettingsRef.current.quality !== quality ||
      prevSettingsRef.current.outputFormat !== outputFormat
    ) {
      prevSettingsRef.current = { quality, outputFormat };
      if (items.length > 0) {
        const debounce = setTimeout(() => {
          runCompression(items, quality, outputFormat);
        }, 200);
        return () => clearTimeout(debounce);
      }
    }
  }, [quality, outputFormat, items, runCompression]);

  // Handle incoming files
  const processFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((file) => file.type.startsWith('image/'));
    if (fileArray.length === 0) return;

    const newItems: ImageItem[] = [];
    let loadedCount = 0;

    fileArray.forEach((file) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        newItems.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          file,
          name: file.name,
          originalSize: file.size,
          originalWidth: img.naturalWidth || img.width,
          originalHeight: img.naturalHeight || img.height,
          previewUrl: url,
          compressedBlob: null,
          compressedUrl: null,
          compressedSize: null,
          savedPercent: null,
          status: 'idle',
        });
        loadedCount++;
        if (loadedCount === fileArray.length) {
          setItems((prev) => [...prev, ...newItems]);
          runCompression(newItems, quality, outputFormat);
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === fileArray.length && newItems.length > 0) {
          setItems((prev) => [...prev, ...newItems]);
          runCompression(newItems, quality, outputFormat);
        }
      };
      img.src = url;
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => {
      const item = prev.find((it) => it.id === id);
      if (item) {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
        if (item.compressedUrl) URL.revokeObjectURL(item.compressedUrl);
      }
      return prev.filter((it) => it.id !== id);
    });
  };

  const handleClearAll = () => {
    items.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      if (item.compressedUrl) URL.revokeObjectURL(item.compressedUrl);
    });
    setItems([]);
  };

  const getOutputExtension = () => {
    if (outputFormat === 'image/webp') return 'webp';
    if (outputFormat === 'image/png') return 'png';
    return 'jpg';
  };

  const handleDownloadSingle = (item: ImageItem) => {
    if (!item.compressedUrl) return;
    const ext = getOutputExtension();
    const base = item.name.replace(/\.[^/.]+$/, '');
    const link = document.createElement('a');
    link.href = item.compressedUrl;
    link.download = `compressed-${base}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAllZip = async () => {
    const readyItems = items.filter((it) => it.compressedBlob);
    if (readyItems.length === 0) return;

    setZipping(true);
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      const ext = getOutputExtension();

      readyItems.forEach((item, index) => {
        const base = item.name.replace(/\.[^/.]+$/, '');
        const filename = `compressed-${base || `image-${index + 1}`}.${ext}`;
        zip.file(filename, item.compressedBlob!);
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `compressed-images-${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      alert(tUI('zipError'));
    } finally {
      setZipping(false);
    }
  };

  const readyCount = items.filter((it) => it.status === 'done').length;

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Image Compressor - VelnoxLabs',
    url: 'https://velnoxlabs.com/tools/image-compressor',
    description:
      'Compress JPEG, PNG, and WebP images directly in your browser with real-time size comparison and zero privacy risk.',
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
          style={{ minHeight: '180px' }}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center space-y-3">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-200 ${
                isDragging
                  ? 'bg-blue-600 text-white scale-110'
                  : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
              }`}
            >
              <UploadCloud className="w-7 h-7" />
            </div>

            <div>
              <p className="text-base sm:text-lg font-semibold text-[var(--text-main)]">
                {isDragging ? tUI('dragOverActive') : tUI('dropPrompt')}
              </p>
              <p className="text-sm text-[var(--text-muted)] mt-1">{tUI('browsePrompt')}</p>
            </div>

            <span className="inline-flex items-center text-xs text-[var(--text-muted)] font-medium px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/80 border border-[var(--border-color)]">
              {tUI('supportedFormats')}
            </span>
          </div>
        </div>

        {/* Compression Settings Panel */}
        <div className="rounded-2xl p-6 border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-base font-semibold text-[var(--text-main)]">
                {tUI('settingsTitle')}
              </h2>
            </div>

            {items.length > 0 && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {tUI('addMore')}
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {tUI('clearAll')}
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Compression Quality Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[var(--text-main)]">
                  {tUI('qualityLabel')}
                </label>
                <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-900/60">
                  {quality}%
                </span>
              </div>

              <input
                type="range"
                min="10"
                max="100"
                step="1"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />

              <div className="flex justify-between text-xs text-[var(--text-muted)]">
                <span>{tUI('qualitySmallest')}</span>
                <span>{tUI('qualityRecommended')}</span>
                <span>{tUI('qualityBest')}</span>
              </div>
            </div>

            {/* Output Format Selector */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-[var(--text-main)] block">
                {tUI('formatLabel')}
              </label>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'image/webp' as OutputFormat, label: 'WebP', hint: tUI('hintRecommended') },
                  { id: 'image/jpeg' as OutputFormat, label: 'JPEG', hint: tUI('hintStandard') },
                  { id: 'image/png' as OutputFormat, label: 'PNG', hint: tUI('hintLossless') },
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setOutputFormat(fmt.id)}
                    className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      outputFormat === fmt.id
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-blue-600'
                        : 'border-[var(--border-color)] bg-[var(--bg-page)] text-[var(--text-muted)] hover:border-zinc-400 dark:hover:border-zinc-700 hover:text-[var(--text-main)]'
                    }`}
                  >
                    <span className="text-sm">{fmt.label}</span>
                    <span className="text-[10px] font-normal opacity-75">{fmt.hint}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Global Batch Controls */}
          {items.length > 0 && (
            <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border-color)]">
              <div className="text-xs text-[var(--text-muted)] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>
                  {tUI('selectedCount', { count: items.length })} • {readyCount} / {items.length}{' '}
                  {tUI('statusDone')}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {readyCount > 1 && (
                  <button
                    type="button"
                    onClick={handleDownloadAllZip}
                    disabled={zipping}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    <FileArchive className="w-4 h-4" />
                    {zipping ? tUI('zipping') : tUI('downloadAllZip')}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Images List */}
        {items.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[var(--text-main)] flex items-center gap-2">
              <FileImage className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>{tUI('selectedCount', { count: items.length })}</span>
            </h3>

            <div className="space-y-3">
              {items.map((item) => {
                const isSaved =
                  item.compressedSize !== null && item.originalSize > item.compressedSize;
                const isLarger =
                  item.compressedSize !== null && item.compressedSize > item.originalSize;
                const percent = item.savedPercent ?? 0;

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl p-4 sm:p-5 border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
                  >
                    {/* Left: Preview & File Info */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-[var(--border-color)] flex-shrink-0 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.previewUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="min-w-0 flex-1 space-y-1.5">
                        <p className="text-sm font-semibold text-[var(--text-main)] truncate max-w-xs sm:max-w-md">
                          {item.name}
                        </p>

                        <p className="text-xs text-[var(--text-muted)] font-mono">
                          {item.originalWidth} × {item.originalHeight} px
                        </p>

                        {/* File Size Difference Display */}
                        {item.status === 'done' && item.compressedSize !== null ? (
                          <div className="flex flex-wrap items-center gap-2 font-mono text-xs sm:text-sm">
                            <span className="text-[var(--text-muted)]">
                              {tUI('original')}: {formatBytes(item.originalSize)}
                            </span>
                            <span className="text-[var(--text-muted)] font-bold">→</span>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                              {tUI('compressed')}: {formatBytes(item.compressedSize)}
                            </span>
                            {isSaved && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                ({tUI('savedPercent', { percent })})
                              </span>
                            )}
                            {isLarger && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                ({tUI('largerPercent', { percent: Math.abs(percent) })})
                              </span>
                            )}
                          </div>
                        ) : item.status === 'compressing' ? (
                          <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>{tUI('statusCompressing')}</span>
                          </div>
                        ) : item.status === 'error' ? (
                          <div className="flex items-center gap-1.5 text-xs text-rose-500">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>{item.errorMessage || tUI('statusError')}</span>
                          </div>
                        ) : (
                          <p className="text-xs text-[var(--text-muted)]">
                            {tUI('original')}: {formatBytes(item.originalSize)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                      {item.status === 'done' && item.compressedUrl && (
                        <button
                          type="button"
                          onClick={() => handleDownloadSingle(item)}
                          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                          <span>{tUI('downloadCompressed')}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-2 rounded-xl text-[var(--text-muted)] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-transparent hover:border-rose-200 dark:hover:border-rose-900/40 transition-colors"
                        title={tUI('remove')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SEO, About, How-to, & FAQs Content */}
        <ToolSeoContent
          toolId="image-compressor"
          name={tUI('title')}
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
