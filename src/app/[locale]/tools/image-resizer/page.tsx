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
  ShieldCheck,
  Scale,
  Ruler,
  Lock,
  Unlock,
  Check,
} from 'lucide-react';

type DimensionUnit = 'px' | 'cm' | 'in' | 'pct';
type FitMode = 'stretch' | 'contain_blur' | 'contain_white' | 'contain_black' | 'cover';
type SizeTargetMode = 'quality' | '20kb' | '50kb' | '100kb' | '200kb' | '1024kb' | 'custom_kb';
type OutputFormat = 'image/jpeg' | 'image/webp' | 'image/png';

interface ImageItem {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  previewUrl: string;
  resizedBlob: Blob | null;
  resizedUrl: string | null;
  resizedSize: number | null;
  resizedWidth: number | null;
  resizedHeight: number | null;
  savedPercent: number | null;
  status: 'idle' | 'processing' | 'done' | 'error';
  errorMessage?: string;
}

function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function unitToPx(val: number, unit: DimensionUnit, dpi: number, origPx: number): number {
  if (unit === 'px') return Math.max(1, Math.round(val));
  if (unit === 'cm') return Math.max(1, Math.round((val / 2.54) * dpi));
  if (unit === 'in') return Math.max(1, Math.round(val * dpi));
  // pct
  return Math.max(1, Math.round((origPx * val) / 100));
}

function pxToUnit(px: number, unit: DimensionUnit, dpi: number): string {
  if (unit === 'px') return Math.round(px).toString();
  if (unit === 'cm') return ((px / dpi) * 2.54).toFixed(2);
  if (unit === 'in') return (px / dpi).toFixed(2);
  return '100';
}

export default function ImageResizerPage() {
  const tUI = useTranslations('ToolUI.imageResizer');

  const [items, setItems] = useState<ImageItem[]>([]);
  const [unit, setUnit] = useState<DimensionUnit>('px');
  const [dpi, setDpi] = useState<number>(300);
  const [widthInput, setWidthInput] = useState<string>('1080');
  const [heightInput, setHeightInput] = useState<string>('1080');
  const [scalePct, setScalePct] = useState<number>(50);
  const [maintainAspect, setMaintainAspect] = useState<boolean>(true);
  const [fitMode, setFitMode] = useState<FitMode>('contain_blur');
  const [sizeTargetMode, setSizeTargetMode] = useState<SizeTargetMode>('quality');
  const [customTargetKB, setCustomTargetKB] = useState<string>('50');
  const [quality, setQuality] = useState<number>(90);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('image/jpeg');

  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [zipping, setZipping] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const itemsRef = useRef<ImageItem[]>(items);
  itemsRef.current = items;

  useEffect(() => {
    return () => {
      itemsRef.current.forEach((it) => {
        if (it.previewUrl) URL.revokeObjectURL(it.previewUrl);
        if (it.resizedUrl) URL.revokeObjectURL(it.resizedUrl);
      });
    };
  }, []);

  const drawResizedCanvas = (
    img: HTMLImageElement,
    targetW: number,
    targetH: number,
    mode: FitMode,
    format: OutputFormat
  ): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, targetW);
    canvas.height = Math.max(1, targetH);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;

    // Handle Fit Modes
    if (mode === 'contain_blur') {
      // Draw blurred cover background ("Generative Ambient Fill")
      const coverScale = Math.max(targetW / iw, targetH / ih);
      const bgW = iw * coverScale;
      const bgH = ih * coverScale;
      const bgX = (targetW - bgW) / 2;
      const bgY = (targetH - bgH) / 2;

      ctx.save();
      ctx.filter = 'blur(26px) brightness(0.92)';
      // Overdraw slightly to avoid edge transparency bleed
      ctx.drawImage(img, bgX - 20, bgY - 20, bgW + 40, bgH + 40);
      ctx.restore();

      // Draw crisp foreground centered without cropping
      const containScale = Math.min(targetW / iw, targetH / ih);
      const fgW = iw * containScale;
      const fgH = ih * containScale;
      const fgX = (targetW - fgW) / 2;
      const fgY = (targetH - fgH) / 2;
      ctx.drawImage(img, fgX, fgY, fgW, fgH);
    } else if (mode === 'contain_white' || mode === 'contain_black') {
      ctx.fillStyle = mode === 'contain_black' ? '#000000' : '#FFFFFF';
      ctx.fillRect(0, 0, targetW, targetH);

      const containScale = Math.min(targetW / iw, targetH / ih);
      const fgW = iw * containScale;
      const fgH = ih * containScale;
      const fgX = (targetW - fgW) / 2;
      const fgY = (targetH - fgH) / 2;
      ctx.drawImage(img, fgX, fgY, fgW, fgH);
    } else if (mode === 'cover') {
      if (format === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, targetW, targetH);
      }
      const coverScale = Math.max(targetW / iw, targetH / ih);
      const dw = iw * coverScale;
      const dh = ih * coverScale;
      const dx = (targetW - dw) / 2;
      const dy = (targetH - dh) / 2;
      ctx.drawImage(img, dx, dy, dw, dh);
    } else {
      // stretch / direct resize
      if (format === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, targetW, targetH);
      }
      ctx.drawImage(img, 0, 0, targetW, targetH);
    }

    return canvas;
  };

  const resizeSingleItem = useCallback(
    async (
      item: ImageItem,
      curUnit: DimensionUnit,
      curDpi: number,
      wStr: string,
      hStr: string,
      pct: number,
      lockRatio: boolean,
      curFit: FitMode,
      szMode: SizeTargetMode,
      custKB: string,
      qVal: number,
      fmt: OutputFormat
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
            let targetW = item.originalWidth;
            let targetH = item.originalHeight;

            if (curUnit === 'pct') {
              targetW = Math.max(1, Math.round((item.originalWidth * pct) / 100));
              targetH = Math.max(1, Math.round((item.originalHeight * pct) / 100));
            } else {
              const parsedW = parseFloat(wStr) || item.originalWidth;
              const parsedH = parseFloat(hStr) || item.originalHeight;
              targetW = unitToPx(parsedW, curUnit, curDpi, item.originalWidth);
              if (lockRatio && curFit === 'stretch') {
                // Keep each item's own aspect ratio if stretch + locked
                targetH = Math.max(
                  1,
                  Math.round(targetW * (item.originalHeight / item.originalWidth))
                );
              } else {
                targetH = unitToPx(parsedH, curUnit, curDpi, item.originalHeight);
              }
            }

            const renderBlob = (w: number, h: number, q: number): Promise<Blob> => {
              return new Promise((res, rej) => {
                const c = drawResizedCanvas(img, w, h, curFit, fmt);
                c.toBlob(
                  (b) => (b ? res(b) : rej(new Error('toBlob error'))),
                  fmt,
                  fmt === 'image/png' ? undefined : Math.min(1, Math.max(0.01, q))
                );
              });
            };

            // Determine target KB if any
            let targetKB = 0;
            if (szMode === '20kb') targetKB = 20;
            else if (szMode === '50kb') targetKB = 50;
            else if (szMode === '100kb') targetKB = 100;
            else if (szMode === '200kb') targetKB = 200;
            else if (szMode === '1024kb') targetKB = 1024;
            else if (szMode === 'custom_kb') targetKB = Math.max(5, parseInt(custKB, 10) || 50);

            let finalBlob: Blob;
            let finalW = targetW;
            let finalH = targetH;

            if (targetKB > 0) {
              const targetBytes = targetKB * 1024;
              let scale = 1.0;
              let bestBlob: Blob | null = null;

              for (let pass = 0; pass < 4; pass++) {
                const w = Math.max(20, Math.round(targetW * scale));
                const h = Math.max(20, Math.round(targetH * scale));

                if (fmt === 'image/png') {
                  const b = await renderBlob(w, h, 0.9);
                  if (b.size <= targetBytes || pass === 3) {
                    bestBlob = b;
                    finalW = w;
                    finalH = h;
                    break;
                  }
                  scale *= 0.75;
                  continue;
                }

                let minQ = 0.05;
                let maxQ = 0.96;
                let passBest: Blob | null = null;

                for (let iter = 0; iter < 6; iter++) {
                  const midQ = (minQ + maxQ) / 2;
                  const b = await renderBlob(w, h, midQ);
                  if (b.size <= targetBytes) {
                    passBest = b;
                    minQ = midQ;
                  } else {
                    maxQ = midQ;
                  }
                }

                if (passBest) {
                  bestBlob = passBest;
                  finalW = w;
                  finalH = h;
                  break;
                } else {
                  scale *= 0.75;
                }
              }

              if (!bestBlob) {
                finalW = Math.max(20, Math.round(targetW * 0.35));
                finalH = Math.max(20, Math.round(targetH * 0.35));
                finalBlob = await renderBlob(finalW, finalH, 0.1);
              } else {
                finalBlob = bestBlob;
              }
            } else {
              // Standard Quality Mode
              finalBlob = await renderBlob(targetW, targetH, qVal / 100);
            }

            const url = URL.createObjectURL(finalBlob);
            const saved =
              item.originalSize > 0
                ? Math.round(((item.originalSize - finalBlob.size) / item.originalSize) * 100)
                : 0;

            resolve({
              blob: finalBlob,
              url,
              size: finalBlob.size,
              width: finalW,
              height: finalH,
              savedPercent: saved,
            });
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

  const handleResizeAll = useCallback(
    async (
      targetList?: ImageItem[],
      overrideW?: string,
      overrideH?: string,
      overrideUnit?: DimensionUnit
    ) => {
      const list = targetList || items;
      if (list.length === 0) return;
      setIsProcessingAll(true);

      setItems((prev) =>
        prev.map((it) => (list.some((l) => l.id === it.id) ? { ...it, status: 'processing' } : it))
      );

      const u = overrideUnit || unit;
      const wS = overrideW !== undefined ? overrideW : widthInput;
      const hS = overrideH !== undefined ? overrideH : heightInput;

      const updated = await Promise.all(
        list.map(async (item) => {
          try {
            if (item.resizedUrl) URL.revokeObjectURL(item.resizedUrl);
            const res = await resizeSingleItem(
              item,
              u,
              dpi,
              wS,
              hS,
              scalePct,
              maintainAspect,
              fitMode,
              sizeTargetMode,
              customTargetKB,
              quality,
              outputFormat
            );
            return {
              ...item,
              resizedBlob: res.blob,
              resizedUrl: res.url,
              resizedSize: res.size,
              resizedWidth: res.width,
              resizedHeight: res.height,
              savedPercent: res.savedPercent,
              status: 'done' as const,
            };
          } catch (err) {
            return {
              ...item,
              status: 'error' as const,
              errorMessage: err instanceof Error ? err.message : 'Resize error',
            };
          }
        })
      );

      setItems((prev) =>
        prev.map((it) => {
          const match = updated.find((uItem) => uItem.id === it.id);
          return match || it;
        })
      );
      setIsProcessingAll(false);
    },
    [
      items,
      unit,
      dpi,
      widthInput,
      heightInput,
      scalePct,
      maintainAspect,
      fitMode,
      sizeTargetMode,
      customTargetKB,
      quality,
      outputFormat,
      resizeSingleItem,
    ]
  );

  const processIncomingFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((file) => file.type.startsWith('image/'));
    if (fileArray.length === 0) return;

    const newItems: ImageItem[] = [];
    let loaded = 0;

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
          resizedBlob: null,
          resizedUrl: null,
          resizedSize: null,
          resizedWidth: null,
          resizedHeight: null,
          savedPercent: null,
          status: 'idle',
        });
        loaded++;
        if (loaded === fileArray.length) {
          let nextW = widthInput;
          let nextH = heightInput;
          if (items.length === 0 && newItems.length > 0 && unit !== 'pct') {
            nextW = pxToUnit(newItems[0].originalWidth, unit, dpi);
            nextH = pxToUnit(newItems[0].originalHeight, unit, dpi);
            setWidthInput(nextW);
            setHeightInput(nextH);
          }
          setItems((prev) => [...prev, ...newItems]);
          handleResizeAll(newItems, nextW, nextH, unit);
        }
      };
      img.onerror = () => {
        loaded++;
        if (loaded === fileArray.length && newItems.length > 0) {
          setItems((prev) => [...prev, ...newItems]);
          handleResizeAll(newItems);
        }
      };
      img.src = url;
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleWidthChange = (valStr: string) => {
    setWidthInput(valStr);
    const val = parseFloat(valStr);
    if (maintainAspect && !isNaN(val) && val > 0 && items.length > 0) {
      const first = items[0];
      const ratio = first.originalHeight / first.originalWidth;
      setHeightInput(unit === 'px' ? Math.round(val * ratio).toString() : (val * ratio).toFixed(2));
    }
  };

  const handleHeightChange = (valStr: string) => {
    setHeightInput(valStr);
    const val = parseFloat(valStr);
    if (maintainAspect && !isNaN(val) && val > 0 && items.length > 0) {
      const first = items[0];
      const ratio = first.originalWidth / first.originalHeight;
      setWidthInput(unit === 'px' ? Math.round(val * ratio).toString() : (val * ratio).toFixed(2));
    }
  };

  const applyPreset = (
    pUnit: DimensionUnit,
    pW: string,
    pH: string,
    pDpi: number,
    pFit?: FitMode
  ) => {
    setUnit(pUnit);
    setDpi(pDpi);
    setWidthInput(pW);
    setHeightInput(pH);
    setMaintainAspect(false);
    if (pFit) setFitMode(pFit);
  };

  const handleDownloadSingle = (item: ImageItem) => {
    if (!item.resizedUrl) return;
    const ext =
      outputFormat === 'image/webp' ? 'webp' : outputFormat === 'image/png' ? 'png' : 'jpg';
    const base = item.name.replace(/\.[^/.]+$/, '');
    const link = document.createElement('a');
    link.href = item.resizedUrl;
    link.download = `resized-${base}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAllZip = async () => {
    const readyItems = items.filter((it) => it.resizedBlob);
    if (readyItems.length === 0) return;

    setZipping(true);
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      const ext =
        outputFormat === 'image/webp' ? 'webp' : outputFormat === 'image/png' ? 'png' : 'jpg';

      readyItems.forEach((item, index) => {
        const base = item.name.replace(/\.[^/.]+$/, '');
        const filename = `resized-${base || `image-${index + 1}`}.${ext}`;
        zip.file(filename, item.resizedBlob!);
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `resized-images-${Date.now()}.zip`;
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

  const handleRemoveItem = (id: string) => {
    setItems((prev) => {
      const item = prev.find((it) => it.id === id);
      if (item) {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
        if (item.resizedUrl) URL.revokeObjectURL(item.resizedUrl);
      }
      return prev.filter((it) => it.id !== id);
    });
  };

  const handleClearAll = () => {
    items.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      if (item.resizedUrl) URL.revokeObjectURL(item.resizedUrl);
    });
    setItems([]);
  };

  const readyCount = items.filter((it) => it.status === 'done').length;

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'AI Image Resizer in KB, MB & CM - VelnoxLabs',
    url: 'https://velnoxlabs.com/tools/image-resizer',
    description:
      'Free AI online image resizer in KB, MB, and CM. Resize images to 20KB, 50KB, 100KB, or 200KB without cropping using AI Ambient Blur Fill and 300 DPI centimeter scaling.',
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
        {/* Upload Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              processIncomingFiles(e.dataTransfer.files);
            }
          }}
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
            accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                processIncomingFiles(e.target.files);
              }
            }}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <UploadCloud className="w-7 h-7" />
            </div>

            <div>
              <p className="text-base sm:text-lg font-semibold text-[var(--text-main)]">
                {tUI('uploadPrompt')}
              </p>
              <p className="text-sm text-[var(--text-muted)] mt-1">{tUI('uploadFormats')}</p>
            </div>

            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Client-Side Private (Zero Upload)
            </span>
          </div>
        </div>

        {/* Settings & Presets Panel */}
        <div className="rounded-2xl p-6 border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-base font-semibold text-[var(--text-main)]">
                {tUI('conversionSettings')}
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
                  {tUI('addMoreImages')}
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

          {/* 1-Click Social Media & Passport CM Presets */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-[var(--text-main)] flex items-center gap-1.5">
              <Ruler className="w-3.5 h-3.5 text-blue-600" />
              <span>{tUI('presetsLabel')}</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                {
                  label: 'Instagram Post (1080×1080)',
                  u: 'px' as DimensionUnit,
                  w: '1080',
                  h: '1080',
                  d: 96,
                  f: 'contain_blur' as FitMode,
                },
                {
                  label: 'Instagram Portrait (1080×1350)',
                  u: 'px' as DimensionUnit,
                  w: '1080',
                  h: '1350',
                  d: 96,
                  f: 'contain_blur' as FitMode,
                },
                {
                  label: 'Reels / Story (1080×1920)',
                  u: 'px' as DimensionUnit,
                  w: '1080',
                  h: '1920',
                  d: 96,
                  f: 'contain_blur' as FitMode,
                },
                {
                  label: 'YouTube Thumb (1280×720)',
                  u: 'px' as DimensionUnit,
                  w: '1280',
                  h: '720',
                  d: 96,
                  f: 'contain_blur' as FitMode,
                },
                {
                  label: 'Passport (3.5×4.5 cm)',
                  u: 'cm' as DimensionUnit,
                  w: '3.5',
                  h: '4.5',
                  d: 300,
                  f: 'cover' as FitMode,
                },
                {
                  label: 'US Visa (2×2 in)',
                  u: 'in' as DimensionUnit,
                  w: '2',
                  h: '2',
                  d: 300,
                  f: 'cover' as FitMode,
                },
                {
                  label: 'Signature (3.5×1.5 cm)',
                  u: 'cm' as DimensionUnit,
                  w: '3.5',
                  h: '1.5',
                  d: 300,
                  f: 'contain_white' as FitMode,
                },
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => applyPreset(p.u, p.w, p.h, p.d, p.f)}
                  className="px-2.5 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-page)] hover:border-blue-400 text-xs font-medium text-[var(--text-main)] transition-colors cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid: Dimensions (PX/CM/IN/%) & Target KB/MB */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Dimensions & Unit Selector */}
            <div className="p-4 rounded-xl bg-[var(--bg-page)] border border-[var(--border-color)] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-[var(--text-main)]">
                  {tUI('dimensionsLabel')}
                </span>
                <div className="flex items-center gap-1.5">
                  {(
                    [
                      { id: 'px', label: 'PX' },
                      { id: 'cm', label: 'CM' },
                      { id: 'in', label: 'IN' },
                      { id: 'pct', label: '%' },
                    ] as const
                  ).map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setUnit(u.id)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${
                        unit === u.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-zinc-200 dark:bg-zinc-800 text-[var(--text-muted)]'
                      }`}
                    >
                      {u.label}
                    </button>
                  ))}

                  {(unit === 'cm' || unit === 'in') && (
                    <select
                      value={dpi}
                      onChange={(e) => setDpi(Number(e.target.value))}
                      className="ml-1 px-2 py-1 text-xs rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)]"
                    >
                      <option value={300}>300 DPI</option>
                      <option value={150}>150 DPI</option>
                      <option value={96}>96 DPI</option>
                    </select>
                  )}
                </div>
              </div>

              {unit === 'pct' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-muted)]">{tUI('scalePercentLabel')}</span>
                    <span className="font-mono font-bold text-blue-600">{scalePct}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    step="5"
                    value={scalePct}
                    onChange={(e) => setScalePct(Number(e.target.value))}
                    className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex gap-2 pt-1">
                    {[25, 50, 75, 100, 150].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setScalePct(v)}
                        className={`flex-1 py-1 text-xs rounded border ${
                          scalePct === v
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-600 font-bold'
                            : 'border-[var(--border-color)] text-[var(--text-muted)]'
                        }`}
                      >
                        {v}%
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="text-[11px] text-[var(--text-muted)] block mb-1">
                      {tUI('widthLabel')} ({unit})
                    </label>
                    <input
                      type="number"
                      step={unit === 'px' ? '1' : '0.1'}
                      value={widthInput}
                      onChange={(e) => handleWidthChange(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setMaintainAspect(!maintainAspect)}
                    title={tUI('lockRatio')}
                    className={`p-2 rounded-lg border transition-colors ${
                      maintainAspect
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-blue-600'
                        : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)]'
                    }`}
                  >
                    {maintainAspect ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  </button>

                  <div className="flex-1">
                    <label className="text-[11px] text-[var(--text-muted)] block mb-1">
                      {tUI('heightLabel')} ({unit})
                    </label>
                    <input
                      type="number"
                      step={unit === 'px' ? '1' : '0.1'}
                      value={heightInput}
                      onChange={(e) => handleHeightChange(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)]"
                    />
                  </div>
                </div>
              )}

              {/* Fit Mode ("Without Cropping" & "AI Ambient Blur Fill") */}
              {unit !== 'pct' && (
                <div className="space-y-2 pt-2 border-t border-[var(--border-color)]">
                  <label className="text-[11px] font-bold text-[var(--text-main)] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{tUI('fitModeLabel')}</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {[
                      { id: 'contain_blur' as FitMode, label: tUI('fitAiBlur') },
                      { id: 'contain_white' as FitMode, label: tUI('fitWhitePad') },
                      { id: 'contain_black' as FitMode, label: tUI('fitBlackPad') },
                      { id: 'cover' as FitMode, label: tUI('fitCover') },
                      { id: 'stretch' as FitMode, label: tUI('fitStretch') },
                    ].map((fm) => (
                      <button
                        key={fm.id}
                        type="button"
                        onClick={() => setFitMode(fm.id)}
                        className={`px-2 py-1.5 rounded-lg border text-[11px] font-medium transition-all ${
                          fitMode === fm.id
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                            : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)]'
                        }`}
                      >
                        {fm.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Target File Size (KB/MB) & Output Format */}
            <div className="p-4 rounded-xl bg-[var(--bg-page)] border border-[var(--border-color)] space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-main)] flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-blue-600" />
                  <span>{tUI('targetSizeLabel')}</span>
                </label>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                  {[
                    { id: 'quality' as SizeTargetMode, label: tUI('modeManualQuality') },
                    { id: '20kb' as SizeTargetMode, label: '20 KB' },
                    { id: '50kb' as SizeTargetMode, label: '50 KB' },
                    { id: '100kb' as SizeTargetMode, label: '100 KB' },
                    { id: '200kb' as SizeTargetMode, label: '200 KB' },
                    { id: '1024kb' as SizeTargetMode, label: '1 MB' },
                    { id: 'custom_kb' as SizeTargetMode, label: tUI('customKb') },
                  ].map((sm) => (
                    <button
                      key={sm.id}
                      type="button"
                      onClick={() => setSizeTargetMode(sm.id)}
                      className={`py-1.5 px-2 rounded-lg border text-xs font-semibold transition-all ${
                        sizeTargetMode === sm.id
                          ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                          : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)] hover:border-blue-400'
                      }`}
                    >
                      {sm.label}
                    </button>
                  ))}
                </div>

                {sizeTargetMode === 'custom_kb' && (
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="number"
                      min="5"
                      max="50000"
                      value={customTargetKB}
                      onChange={(e) => setCustomTargetKB(e.target.value)}
                      className="w-28 px-3 py-1.5 text-xs font-mono rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)]"
                    />
                    <span className="text-xs font-semibold text-[var(--text-muted)]">KB max</span>
                  </div>
                )}

                {sizeTargetMode === 'quality' && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--text-muted)]">{tUI('qualityLabel')}</span>
                      <span className="font-mono font-bold text-blue-600">{quality}%</span>
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
                  </div>
                )}
              </div>

              {/* Format & Resize Action */}
              <div className="pt-2 border-t border-[var(--border-color)] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {(
                    [
                      { id: 'image/jpeg' as OutputFormat, label: 'JPEG' },
                      { id: 'image/webp' as OutputFormat, label: 'WebP' },
                      { id: 'image/png' as OutputFormat, label: 'PNG' },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setOutputFormat(f.id)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                        outputFormat === f.id
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                          : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)]'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handleResizeAll()}
                  disabled={isProcessingAll || items.length === 0}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-sm disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {isProcessingAll ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{tUI('processing')}</span>
                    </>
                  ) : (
                    <span>{tUI('resizeAll', { count: items.length })}</span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Batch Download Bar */}
          {items.length > 0 && (
            <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border-color)]">
              <div className="text-xs text-[var(--text-muted)] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>
                  {tUI('selectedStatus', { count: items.length })} • {readyCount} / {items.length}{' '}
                  {tUI('statusDone')}
                </span>
              </div>

              {readyCount > 1 && (
                <button
                  type="button"
                  onClick={handleDownloadAllZip}
                  disabled={zipping}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md disabled:opacity-50 transition-all cursor-pointer"
                >
                  <FileArchive className="w-4 h-4" />
                  <span>
                    {zipping ? tUI('zipping') : tUI('downloadAllZip', { count: readyCount })}
                  </span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Images List */}
        {items.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[var(--text-main)] flex items-center gap-2">
              <FileImage className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>{tUI('originalImages', { count: items.length })}</span>
            </h3>

            {items.map((item) => {
              const isSaved = item.resizedSize !== null && item.originalSize > item.resizedSize;
              const percent = item.savedPercent ?? 0;

              return (
                <div
                  key={item.id}
                  className="rounded-2xl p-4 sm:p-5 border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-[var(--border-color)] flex-shrink-0 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.resizedUrl || item.previewUrl}
                        alt={item.name}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="min-w-0 flex-1 space-y-1.5">
                      <p className="text-sm font-semibold text-[var(--text-main)] truncate max-w-xs sm:max-w-md">
                        {item.name}
                      </p>

                      <p className="text-xs text-[var(--text-muted)] font-mono">
                        {item.originalWidth} × {item.originalHeight} px
                        {item.resizedWidth && item.resizedHeight && (
                          <span className="text-blue-600 dark:text-blue-400 ml-1.5 font-semibold">
                            → {item.resizedWidth} × {item.resizedHeight} px
                          </span>
                        )}
                      </p>

                      {item.status === 'done' && item.resizedSize !== null ? (
                        <div className="flex flex-wrap items-center gap-2 font-mono text-xs sm:text-sm">
                          <span className="text-[var(--text-muted)]">
                            {formatBytes(item.originalSize)}
                          </span>
                          <span className="text-[var(--text-muted)] font-bold">→</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {formatBytes(item.resizedSize)}
                          </span>
                          {isSaved && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              (-{percent}%)
                            </span>
                          )}
                        </div>
                      ) : item.status === 'processing' ? (
                        <div className="flex items-center gap-2 text-xs text-blue-600">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>{tUI('processing')}</span>
                        </div>
                      ) : item.status === 'error' ? (
                        <div className="flex items-center gap-1.5 text-xs text-rose-500">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{item.errorMessage || 'Error'}</span>
                        </div>
                      ) : (
                        <p className="text-xs text-[var(--text-muted)]">
                          {formatBytes(item.originalSize)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                    {item.status === 'done' && item.resizedUrl && (
                      <button
                        type="button"
                        onClick={() => handleDownloadSingle(item)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>{tUI('downloadTooltip')}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-2 rounded-xl text-[var(--text-muted)] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                      title={tUI('remove')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
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
                  <th className="py-2.5 px-3 font-semibold">{tUI('compColILove')}</th>
                  <th className="py-2.5 px-3 font-semibold">{tUI('compColResizePixel')}</th>
                  <th className="py-2.5 px-3 font-semibold">{tUI('compColCanva')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-main)]">
                <tr>
                  <td className="py-2.5 px-3 font-medium">
                    Exact Target Size (20KB, 50KB, 100KB, 1MB)
                  </td>
                  <td className="py-2.5 px-3 text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Binary Search Engine
                  </td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">Manual Slider</td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">Yes (Cloud Upload)</td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">No Target KB</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium">
                    AI Resize Without Cropping (Ambient Blur Fill)
                  </td>
                  <td className="py-2.5 px-3 text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Free Built-in AI Fill
                  </td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">Stretches / Crops</td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">No</td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">Paid Magic Expand</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium">CM, Inch & 300 DPI Passport Sizing</td>
                  <td className="py-2.5 px-3 text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Live CM + Presets
                  </td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">Pixels & % Only</td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">Pixels Only</td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">Pro Plan Only</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium">
                    100% Client-Side Privacy (Zero Upload)
                  </td>
                  <td className="py-2.5 px-3 text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> 100% Local Browser
                  </td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">Cloud Server</td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">Cloud Server</td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">Cloud Storage</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <ToolSeoContent
          toolId="image-resizer"
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
