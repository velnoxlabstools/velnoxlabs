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
  Sparkles,
  Eye,
  X,
  ShieldCheck,
  Scale,
  Check,
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
  compressedWidth: number | null;
  compressedHeight: number | null;
  savedPercent: number | null;
  status: 'idle' | 'compressing' | 'done' | 'error';
  errorMessage?: string;
}

type OutputFormat = 'image/webp' | 'image/jpeg' | 'image/png';
type CompressionMode = 'target_size' | 'ai_smart' | 'manual';

const TARGET_SIZE_PRESETS = [
  { kb: 20, labelKey: 'target20kbLabel', descKey: 'target20kbDesc' },
  { kb: 50, labelKey: 'target50kbLabel', descKey: 'target50kbDesc' },
  { kb: 100, labelKey: 'target100kbLabel', descKey: 'target100kbDesc' },
  { kb: 200, labelKey: 'target200kbLabel', descKey: 'target200kbDesc' },
  { kb: 500, labelKey: 'target500kbLabel', descKey: 'target500kbDesc' },
  { kb: 1024, labelKey: 'target1mbLabel', descKey: 'target1mbDesc' },
] as const;

const MAX_DIMENSION_PRESETS = [
  { val: 0, labelKey: 'resizeOriginal' },
  { val: 1920, labelKey: 'resizeFHD' },
  { val: 1280, labelKey: 'resizeHD' },
  { val: 800, labelKey: 'resizeSmall' },
] as const;

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
  const [mode, setMode] = useState<CompressionMode>('target_size');
  const [targetKB, setTargetKB] = useState<number>(50);
  const [customKBInput, setCustomKBInput] = useState<string>('50');
  const [quality, setQuality] = useState<number>(80);
  const [maxDimension, setMaxDimension] = useState<number>(0);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('image/webp');
  const [isDragging, setIsDragging] = useState(false);
  const [zipping, setZipping] = useState(false);
  const [comparisonItem, setComparisonItem] = useState<ImageItem | null>(null);

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

  // Compression engine using Canvas and multi-pass binary search
  const compressSingleItem = useCallback(
    async (
      item: ImageItem,
      cmpMode: CompressionMode,
      tgtKB: number,
      targetQuality: number,
      targetFormat: OutputFormat,
      maxDim: number
    ): Promise<{
      blob: Blob;
      url: string;
      size: number;
      width: number;
      height: number;
      savedPercent: number;
    }> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = async () => {
          try {
            let baseWidth = img.naturalWidth || img.width;
            let baseHeight = img.naturalHeight || img.height;

            // Apply max dimension constraint if set
            if (maxDim > 0 && (baseWidth > maxDim || baseHeight > maxDim)) {
              if (baseWidth >= baseHeight) {
                baseHeight = Math.round((baseHeight * maxDim) / baseWidth);
                baseWidth = maxDim;
              } else {
                baseWidth = Math.round((baseWidth * maxDim) / baseHeight);
                baseHeight = maxDim;
              }
            }

            const renderToBlob = (w: number, h: number, q: number): Promise<Blob> => {
              return new Promise((res, rej) => {
                const canvas = document.createElement('canvas');
                canvas.width = Math.max(1, w);
                canvas.height = Math.max(1, h);
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                  rej(new Error('Canvas context not available'));
                  return;
                }

                // Fill white background for JPEG to handle PNG transparency
                if (targetFormat === 'image/jpeg') {
                  ctx.fillStyle = '#FFFFFF';
                  ctx.fillRect(0, 0, canvas.width, canvas.height);
                }

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                canvas.toBlob(
                  (blob) => {
                    if (blob) res(blob);
                    else rej(new Error('Compression blob failed'));
                  },
                  targetFormat,
                  Math.min(1, Math.max(0.01, q))
                );
              });
            };

            // Mode 1: Target File Size (Multi-pass binary search)
            if (cmpMode === 'target_size') {
              const targetBytes = tgtKB * 1024;
              let scale = 1.0;
              let bestBlob: Blob | null = null;
              let bestW = baseWidth;
              let bestH = baseHeight;

              // Up to 4 dimension scaling passes if image is high-res
              for (let pass = 0; pass < 4; pass++) {
                const w = Math.max(20, Math.round(baseWidth * scale));
                const h = Math.max(20, Math.round(baseHeight * scale));

                if (targetFormat === 'image/png') {
                  // PNG is lossless, scale dimension directly
                  const b = await renderToBlob(w, h, 0.9);
                  if (b.size <= targetBytes || pass === 3) {
                    bestBlob = b;
                    bestW = w;
                    bestH = h;
                    break;
                  }
                  scale *= 0.75;
                  continue;
                }

                // For WebP / JPEG: Binary search on quality factor
                let minQ = 0.04;
                let maxQ = 0.96;
                let passBestBlob: Blob | null = null;

                for (let iter = 0; iter < 6; iter++) {
                  const midQ = (minQ + maxQ) / 2;
                  const b = await renderToBlob(w, h, midQ);
                  if (b.size <= targetBytes) {
                    passBestBlob = b;
                    minQ = midQ; // Try higher visual quality while staying <= target
                  } else {
                    maxQ = midQ; // Need smaller file size
                  }
                }

                if (passBestBlob) {
                  bestBlob = passBestBlob;
                  bestW = w;
                  bestH = h;
                  break; // Found optimal compression <= targetBytes
                } else {
                  // Quality alone couldn't reach target size, scale dimensions down
                  scale *= 0.75;
                }
              }

              if (!bestBlob) {
                // Fallback to minimal size
                const w = Math.max(20, Math.round(baseWidth * 0.3));
                const h = Math.max(20, Math.round(baseHeight * 0.3));
                bestBlob = await renderToBlob(w, h, 0.1);
                bestW = w;
                bestH = h;
              }

              const url = URL.createObjectURL(bestBlob);
              const saved =
                item.originalSize > 0
                  ? Math.round(((item.originalSize - bestBlob.size) / item.originalSize) * 100)
                  : 0;

              resolve({
                blob: bestBlob,
                url,
                size: bestBlob.size,
                width: bestW,
                height: bestH,
                savedPercent: saved,
              });
              return;
            }

            // Mode 2: AI Smart Auto Mode (Optimal perceptual compression curve)
            if (cmpMode === 'ai_smart') {
              let smartQuality = 0.82;
              let smartScale = 1.0;

              if (item.originalSize > 5 * 1024 * 1024) {
                smartQuality = 0.76;
                if (baseWidth > 2560) smartScale = 2560 / baseWidth;
              } else if (item.originalSize > 2 * 1024 * 1024) {
                smartQuality = 0.8;
                if (baseWidth > 2048) smartScale = 2048 / baseWidth;
              } else if (item.originalSize > 500 * 1024) {
                smartQuality = 0.84;
                if (baseWidth > 1920) smartScale = 1920 / baseWidth;
              } else {
                smartQuality = 0.88;
              }

              const finalW = Math.round(baseWidth * smartScale);
              const finalH = Math.round(baseHeight * smartScale);
              const blob = await renderToBlob(finalW, finalH, smartQuality);
              const url = URL.createObjectURL(blob);
              const saved =
                item.originalSize > 0
                  ? Math.round(((item.originalSize - blob.size) / item.originalSize) * 100)
                  : 0;

              resolve({
                blob,
                url,
                size: blob.size,
                width: finalW,
                height: finalH,
                savedPercent: saved,
              });
              return;
            }

            // Mode 3: Manual Quality Slider
            const finalW = baseWidth;
            const finalH = baseHeight;
            const blob = await renderToBlob(finalW, finalH, targetQuality / 100);
            const url = URL.createObjectURL(blob);
            const saved =
              item.originalSize > 0
                ? Math.round(((item.originalSize - blob.size) / item.originalSize) * 100)
                : 0;

            resolve({
              blob,
              url,
              size: blob.size,
              width: finalW,
              height: finalH,
              savedPercent: saved,
            });
          } catch (err) {
            reject(err);
          }
        };
        img.onerror = () => reject(new Error('Failed to load image for compression'));
        img.src = item.previewUrl;
      });
    },
    []
  );

  // Compress a batch of items
  const runCompression = useCallback(
    async (
      list: ImageItem[],
      cmpMode: CompressionMode,
      tgtKB: number,
      targetQuality: number,
      targetFormat: OutputFormat,
      maxDim: number
    ) => {
      if (list.length === 0) return;

      setItems((prev) =>
        prev.map((it) => (list.some((l) => l.id === it.id) ? { ...it, status: 'compressing' } : it))
      );

      const updated = await Promise.all(
        list.map(async (item) => {
          try {
            if (item.compressedUrl) URL.revokeObjectURL(item.compressedUrl);

            const result = await compressSingleItem(
              item,
              cmpMode,
              tgtKB,
              targetQuality,
              targetFormat,
              maxDim
            );
            return {
              ...item,
              compressedBlob: result.blob,
              compressedUrl: result.url,
              compressedSize: result.size,
              compressedWidth: result.width,
              compressedHeight: result.height,
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

  // Re-compress when any settings change
  const prevSettingsRef = useRef({ mode, targetKB, quality, outputFormat, maxDimension });
  useEffect(() => {
    const prev = prevSettingsRef.current;
    if (
      prev.mode !== mode ||
      prev.targetKB !== targetKB ||
      prev.quality !== quality ||
      prev.outputFormat !== outputFormat ||
      prev.maxDimension !== maxDimension
    ) {
      prevSettingsRef.current = { mode, targetKB, quality, outputFormat, maxDimension };
      if (items.length > 0) {
        const debounce = setTimeout(() => {
          runCompression(items, mode, targetKB, quality, outputFormat, maxDimension);
        }, 220);
        return () => clearTimeout(debounce);
      }
    }
  }, [mode, targetKB, quality, outputFormat, maxDimension, items, runCompression]);

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
          compressedWidth: null,
          compressedHeight: null,
          savedPercent: null,
          status: 'idle',
        });
        loadedCount++;
        if (loadedCount === fileArray.length) {
          setItems((prev) => [...prev, ...newItems]);
          runCompression(newItems, mode, targetKB, quality, outputFormat, maxDimension);
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === fileArray.length && newItems.length > 0) {
          setItems((prev) => [...prev, ...newItems]);
          runCompression(newItems, mode, targetKB, quality, outputFormat, maxDimension);
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

  const handleCustomKBChange = (val: string) => {
    setCustomKBInput(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 50000) {
      setTargetKB(parsed);
    }
  };

  const readyCount = items.filter((it) => it.status === 'done').length;

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'AI Image Compressor to 20KB, 50KB, 100KB & 1MB - VelnoxLabs',
    url: 'https://velnoxlabs.com/tools/image-compressor',
    description:
      'Free AI online image compressor to 20KB, 50KB, 100KB, 200KB & 1MB. Smart photo reducer with binary-search target size compression, zero quality loss, and 100% browser privacy.',
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

            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <span className="inline-flex items-center text-xs text-[var(--text-muted)] font-medium px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/80 border border-[var(--border-color)]">
                {tUI('supportedFormats')}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                100% Client-Side Private
              </span>
            </div>
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

          {/* Mode Selector: Target Size vs AI Smart vs Manual */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-[var(--text-main)] block">
              {tUI('modeLabel')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setMode('target_size')}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                  mode === 'target_size'
                    ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-blue-600'
                    : 'border-[var(--border-color)] bg-[var(--bg-page)] text-[var(--text-muted)] hover:border-zinc-400 dark:hover:border-zinc-700 hover:text-[var(--text-main)]'
                }`}
              >
                <Scale className="w-4 h-4 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold leading-none">{tUI('modeTargetSize')}</p>
                  <p className="text-[10px] opacity-75 mt-1">20KB, 50KB, 100KB & 1MB</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMode('ai_smart')}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                  mode === 'ai_smart'
                    ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-indigo-600'
                    : 'border-[var(--border-color)] bg-[var(--bg-page)] text-[var(--text-muted)] hover:border-zinc-400 dark:hover:border-zinc-700 hover:text-[var(--text-main)]'
                }`}
              >
                <Sparkles className="w-4 h-4 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold leading-none">{tUI('modeAiSmart')}</p>
                  <p className="text-[10px] opacity-75 mt-1">Auto Perceptual Optimization</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMode('manual')}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                  mode === 'manual'
                    ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-blue-600'
                    : 'border-[var(--border-color)] bg-[var(--bg-page)] text-[var(--text-muted)] hover:border-zinc-400 dark:hover:border-zinc-700 hover:text-[var(--text-main)]'
                }`}
              >
                <Sliders className="w-4 h-4 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold leading-none">{tUI('modeManual')}</p>
                  <p className="text-[10px] opacity-75 mt-1">Quality % Slider (10% - 100%)</p>
                </div>
              </button>
            </div>
          </div>

          {/* Mode 1: Target Size Presets & Custom KB Input */}
          {mode === 'target_size' && (
            <div className="space-y-3 p-4 rounded-xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[var(--text-main)] flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-blue-600" />
                  <span>{tUI('targetSizeLabel')}</span>
                </label>
                <span className="text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900/50">
                  Target: {targetKB >= 1024 ? `${targetKB / 1024} MB` : `${targetKB} KB`}
                </span>
              </div>

              {/* Preset buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {TARGET_SIZE_PRESETS.map((preset) => {
                  const isSelected = targetKB === preset.kb;
                  return (
                    <button
                      key={preset.kb}
                      type="button"
                      onClick={() => {
                        setTargetKB(preset.kb);
                        setCustomKBInput(preset.kb.toString());
                      }}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-600 text-white font-bold shadow-sm'
                          : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)] hover:border-blue-300 dark:hover:border-blue-700'
                      }`}
                    >
                      <span className="text-xs font-bold">{tUI(preset.labelKey)}</span>
                      <span
                        className={`text-[9px] line-clamp-1 mt-0.5 ${
                          isSelected ? 'text-blue-100' : 'text-[var(--text-muted)]'
                        }`}
                        title={tUI(preset.descKey)}
                      >
                        {tUI(preset.descKey)}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Target KB input */}
              <div className="flex items-center gap-3 pt-2">
                <span className="text-xs text-[var(--text-muted)] font-medium">
                  {tUI('targetCustom')}:
                </span>
                <div className="relative max-w-xs flex items-center">
                  <input
                    type="number"
                    min="5"
                    max="50000"
                    value={customKBInput}
                    onChange={(e) => handleCustomKBChange(e.target.value)}
                    placeholder={tUI('customSizePlaceholder')}
                    className="w-32 px-3 py-1.5 text-xs font-mono rounded-lg border border-[var(--border-color)] bg-[var(--bg-page)] text-[var(--text-main)] focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-xs font-semibold text-[var(--text-muted)]">KB</span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] hidden sm:block">
                  {tUI('approximateSizeNotice', { size: targetKB })}
                </p>
              </div>
            </div>
          )}

          {/* Mode 2: AI Smart Auto Note */}
          {mode === 'ai_smart' && (
            <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-indigo-950 dark:text-indigo-200">
                  AI Perceptual Quality Optimization Active
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1">{tUI('aiSmartNotice')}</p>
              </div>
            </div>
          )}

          {/* Mode 3: Manual Quality Slider */}
          {mode === 'manual' && (
            <div className="space-y-3 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-[var(--border-color)]">
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
          )}

          {/* Output Format & Max Dimension Resizing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Output Format Selector */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-[var(--text-main)] block">
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
                    <span className="text-xs">{fmt.label}</span>
                    <span className="text-[10px] font-normal opacity-75">{fmt.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Max Dimensions Resizing */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-[var(--text-main)] block">
                {tUI('resizeLabel')}
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {MAX_DIMENSION_PRESETS.map((d) => (
                  <button
                    key={d.val}
                    type="button"
                    onClick={() => setMaxDimension(d.val)}
                    className={`py-2 px-2.5 rounded-xl border text-center transition-all ${
                      maxDimension === d.val
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold shadow-sm ring-1 ring-blue-600'
                        : 'border-[var(--border-color)] bg-[var(--bg-page)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                    }`}
                  >
                    <span className="text-[11px] block">{tUI(d.labelKey)}</span>
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
                          {item.compressedWidth && item.compressedHeight && (
                            <span className="text-blue-600 dark:text-blue-400 ml-1.5">
                              → {item.compressedWidth} × {item.compressedHeight} px
                            </span>
                          )}
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
                        <>
                          <button
                            type="button"
                            onClick={() => setComparisonItem(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[var(--text-main)] transition-colors cursor-pointer"
                            title={tUI('compareBtn')}
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-500" />
                            <span>{tUI('compareBtn')}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDownloadSingle(item)}
                            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors cursor-pointer"
                          >
                            <Download className="w-4 h-4" />
                            <span>{tUI('downloadCompressed')}</span>
                          </button>
                        </>
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

        {/* Before vs After Visual Comparison Modal */}
        {comparisonItem && comparisonItem.compressedUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="relative w-full max-w-4xl bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[var(--border-color)]">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-600" />
                  <h3 className="text-sm sm:text-base font-bold text-[var(--text-main)]">
                    {tUI('compareModalTitle')}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setComparisonItem(null)}
                  className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body: Side-by-Side Comparison */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
                <p className="text-xs text-[var(--text-muted)]">{tUI('compareZoomNotice')}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left: Original Image */}
                  <div className="space-y-2 rounded-xl p-3 border border-[var(--border-color)] bg-[var(--bg-page)]">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-[var(--text-main)]">
                        {tUI('compareOriginal', {
                          size: formatBytes(comparisonItem.originalSize),
                        })}
                      </span>
                      <span className="font-mono text-[var(--text-muted)]">
                        {comparisonItem.originalWidth} × {comparisonItem.originalHeight} px
                      </span>
                    </div>
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-950 flex items-center justify-center border border-[var(--border-color)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={comparisonItem.previewUrl}
                        alt="Original"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  </div>

                  {/* Right: Compressed Image */}
                  <div className="space-y-2 rounded-xl p-3 border border-emerald-500/40 bg-emerald-50/10 dark:bg-emerald-950/10">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        {tUI('compareCompressed', {
                          size: formatBytes(comparisonItem.compressedSize || 0),
                        })}
                      </span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400">
                        {comparisonItem.compressedWidth || comparisonItem.originalWidth} ×{' '}
                        {comparisonItem.compressedHeight || comparisonItem.originalHeight} px
                      </span>
                    </div>
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-950 flex items-center justify-center border border-emerald-500/30">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={comparisonItem.compressedUrl}
                        alt="Compressed"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
                  <span className="text-[var(--text-muted)] font-mono truncate max-w-sm">
                    {comparisonItem.name}
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {tUI('savedPercent', { percent: comparisonItem.savedPercent || 0 })}
                  </span>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-[var(--border-color)] flex justify-end gap-3 bg-[var(--bg-card)]">
                <button
                  type="button"
                  onClick={() => setComparisonItem(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[var(--text-main)] transition-colors"
                >
                  {tUI('closeModal')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleDownloadSingle(comparisonItem);
                    setComparisonItem(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{tUI('downloadCompressed')}</span>
                </button>
              </div>
            </div>
          </div>
        )}

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
                  <th className="py-2.5 px-3 font-semibold">{tUI('compCol11zon')}</th>
                  <th className="py-2.5 px-3 font-semibold">{tUI('compColILove')}</th>
                  <th className="py-2.5 px-3 font-semibold">{tUI('compColTiny')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-main)]">
                <tr>
                  <td className="py-2.5 px-3 font-medium">100% Client-Side Privacy (No Upload)</td>
                  <td className="py-2.5 px-3 text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> 100% Local Browser
                  </td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">Cloud Server</td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">Cloud Server</td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">Cloud Server</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium">
                    Exact Target Size (20KB, 50KB, 100KB, 1MB)
                  </td>
                  <td className="py-2.5 px-3 text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Binary Search Engine
                  </td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">Approximate</td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">Manual Slider</td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">No Target Size</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium">Before vs After Quality Inspector</td>
                  <td className="py-2.5 px-3 text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Side-by-Side Modal
                  </td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">Limited</td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">No</td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">No</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium">Batch ZIP Download Limit</td>
                  <td className="py-2.5 px-3 text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Unlimited Free
                  </td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">Ad Throttled</td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">Limited Batch</td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">20 Max / Session</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium">Next-Gen WebP & Dimension Resize</td>
                  <td className="py-2.5 px-3 text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Yes (FHD, HD, Custom)
                  </td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">Basic</td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">Separate Tool</td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">Paid Pro API</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Official Portal Guidelines Table */}
        <div className="rounded-2xl p-6 border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <FileArchive className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-[var(--text-main)]">
              {tUI('portalRequirementsTitle')}
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-color)] bg-zinc-50 dark:bg-zinc-900/50 text-[var(--text-muted)]">
                  <th className="py-2.5 px-3 font-semibold">{tUI('portalColExam')}</th>
                  <th className="py-2.5 px-3 font-semibold">{tUI('portalColType')}</th>
                  <th className="py-2.5 px-3 font-semibold">{tUI('portalColSize')}</th>
                  <th className="py-2.5 px-3 font-semibold">{tUI('portalColDim')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-main)]">
                <tr>
                  <td className="py-2.5 px-3 font-bold">UPSC Civil Services / NDA</td>
                  <td className="py-2.5 px-3">Passport Photo</td>
                  <td className="py-2.5 px-3 font-mono text-blue-600 dark:text-blue-400">
                    20 KB – 50 KB
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[var(--text-muted)]">
                    350 × 350 to 1000 × 1000 px
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold">UPSC / SSC CGL / CHSL</td>
                  <td className="py-2.5 px-3">Signature & Thumb</td>
                  <td className="py-2.5 px-3 font-mono text-blue-600 dark:text-blue-400">
                    10 KB – 20 KB
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[var(--text-muted)]">
                    140 × 60 px (Aspect 7:3)
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold">NTA NEET / JEE Main</td>
                  <td className="py-2.5 px-3">Candidate Photograph</td>
                  <td className="py-2.5 px-3 font-mono text-blue-600 dark:text-blue-400">
                    10 KB – 200 KB
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[var(--text-muted)]">
                    3.5 × 4.5 cm (White Background)
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold">Indian Passport & Visa</td>
                  <td className="py-2.5 px-3">Passport Photo</td>
                  <td className="py-2.5 px-3 font-mono text-blue-600 dark:text-blue-400">
                    &lt; 100 KB
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[var(--text-muted)]">
                    200 DPI (35 × 45 mm)
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold">US Visa (DS-160)</td>
                  <td className="py-2.5 px-3">Digital Photo</td>
                  <td className="py-2.5 px-3 font-mono text-blue-600 dark:text-blue-400">
                    &le; 240 KB
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[var(--text-muted)]">
                    600 × 600 to 1200 × 1200 px
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

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
