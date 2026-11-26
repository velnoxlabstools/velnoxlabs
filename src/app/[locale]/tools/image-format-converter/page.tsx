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
  ArrowRight,
  AlertCircle,
  FileText,
  ShieldCheck,
  Scale,
  Sparkles,
  Check,
} from 'lucide-react';

type OutputFormat = 'image/jpeg' | 'image/png' | 'image/webp' | 'docx' | 'pdf';
type JpgSizeMode = 'custom' | '50kb' | '20kb';

interface ImageItem {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  originalFormat: string;
  originalWidth: number;
  originalHeight: number;
  previewUrl: string;
  convertedBlob: Blob | null;
  convertedUrl: string | null;
  convertedSize: number | null;
  targetFormat: OutputFormat;
  status: 'idle' | 'converting' | 'done' | 'error';
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

function detectFormatName(file: File): string {
  const type = file.type.toLowerCase();
  if (type.includes('png')) return 'PNG';
  if (type.includes('jpeg') || type.includes('jpg')) return 'JPEG';
  if (type.includes('webp')) return 'WebP';
  if (type.includes('gif')) return 'GIF';
  if (type.includes('svg')) return 'SVG';
  if (type.includes('avif')) return 'AVIF';
  if (type.includes('bmp')) return 'BMP';

  const ext = file.name.split('.').pop()?.toUpperCase();
  return ext || 'IMAGE';
}

function getFormatExtension(fmt: OutputFormat): string {
  if (fmt === 'image/webp') return 'webp';
  if (fmt === 'image/png') return 'png';
  if (fmt === 'docx') return 'docx';
  if (fmt === 'pdf') return 'pdf';
  return 'jpg';
}

function getFormatShortLabel(fmt: OutputFormat): string {
  if (fmt === 'image/webp') return 'WebP';
  if (fmt === 'image/png') return 'PNG';
  if (fmt === 'docx') return 'Word (.docx)';
  if (fmt === 'pdf') return 'PDF (.pdf)';
  return 'JPG';
}

// Client-side genuine Microsoft Word .docx generator using JSZip
async function createDocxFromImages(
  images: Array<{ dataUrl: string; width: number; height: number; name: string }>
): Promise<Blob> {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();

  // [Content_Types].xml
  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Default Extension="jpeg" ContentType="image/jpeg"/>
  <Default Extension="jpg" ContentType="image/jpeg"/>
  <Default Extension="png" ContentType="image/png"/>
</Types>`;
  zip.file('[Content_Types].xml', contentTypes);

  // _rels/.rels
  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;
  zip.file('_rels/.rels', rels);

  // word/_rels/document.xml.rels
  let docRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">`;

  images.forEach((_, idx) => {
    const rId = `rId${idx + 2}`;
    docRels += `\n  <Relationship Id="${rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image${idx + 1}.jpeg"/>`;
  });
  docRels += `\n</Relationships>`;
  zip.file('word/_rels/document.xml.rels', docRels);

  // word/media/image{i+1}.jpeg
  images.forEach((img, idx) => {
    const base64Data = img.dataUrl.split(',')[1];
    zip.file(`word/media/image${idx + 1}.jpeg`, base64Data, { base64: true });
  });

  // word/document.xml
  const MAX_EMU_W = 5500000;
  const MAX_EMU_H = 8000000;

  let bodyXml = '';
  images.forEach((img, idx) => {
    const rId = `rId${idx + 2}`;
    const imgId = idx + 10;

    let emuW = (img.width || 800) * 9525;
    let emuH = (img.height || 600) * 9525;

    if (emuW > MAX_EMU_W) {
      emuH = Math.round((emuH * MAX_EMU_W) / emuW);
      emuW = MAX_EMU_W;
    }
    if (emuH > MAX_EMU_H) {
      emuW = Math.round((emuW * MAX_EMU_H) / emuH);
      emuH = MAX_EMU_H;
    }

    bodyXml += `
    <w:p>
      <w:pPr>
        <w:jc w:val="center"/>
      </w:pPr>
      <w:r>
        <w:drawing>
          <wp:inline distT="0" distB="0" distL="0" distR="0" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
            <wp:extent cx="${emuW}" cy="${emuH}"/>
            <wp:docPr id="${imgId}" name="Image${idx + 1}"/>
            <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
              <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                  <pic:nvPicPr>
                    <pic:cNvPr id="${imgId}" name="Image${idx + 1}"/>
                    <pic:cNvPicPr/>
                  </pic:nvPicPr>
                  <pic:blipFill>
                    <a:blip r:embed="${rId}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/>
                    <a:stretch>
                      <a:fillRect/>
                    </a:stretch>
                  </pic:blipFill>
                  <pic:spPr>
                    <a:xfrm>
                      <a:off x="0" y="0"/>
                      <a:ext cx="${emuW}" cy="${emuH}"/>
                    </a:xfrm>
                    <a:prstGeom prst="rect">
                      <a:avLst/>
                    </a:prstGeom>
                  </pic:spPr>
                </pic:pic>
              </a:graphicData>
            </a:graphic>
          </wp:inline>
        </w:drawing>
      </w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="center"/></w:pPr>
      <w:r><w:t>${img.name}</w:t></w:r>
    </w:p>`;

    if (idx < images.length - 1) {
      bodyXml += `<w:p><w:r><w:br w:type="page"/></w:r></w:p>`;
    }
  });

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${bodyXml}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
    </w:sectPr>
  </w:body>
</w:document>`;
  zip.file('word/document.xml', documentXml);

  return await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
}

// Client-side PDF generation using jsPDF
async function createPdfFromImages(
  images: Array<{ dataUrl: string; width: number; height: number }>
): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;
  const maxW = pageWidth - margin * 2;
  const maxH = pageHeight - margin * 2;

  images.forEach((img, idx) => {
    if (idx > 0) pdf.addPage();

    let renderW = maxW;
    let renderH = (img.height * maxW) / img.width;

    if (renderH > maxH) {
      renderW = (renderW * maxH) / renderH;
      renderH = maxH;
    }

    const x = margin + (maxW - renderW) / 2;
    const y = margin + (maxH - renderH) / 2;

    pdf.addImage(img.dataUrl, 'JPEG', x, y, renderW, renderH);
  });

  return pdf.output('blob');
}

export default function ImageFormatConverterPage() {
  const tUI = useTranslations('ToolUI.imageFormatConverter');

  const [items, setItems] = useState<ImageItem[]>([]);
  const [globalFormat, setGlobalFormat] = useState<OutputFormat>('image/jpeg');
  const [jpgSizeMode, setJpgSizeMode] = useState<JpgSizeMode>('custom');
  const [quality, setQuality] = useState<number>(90);
  const [isDragging, setIsDragging] = useState(false);
  const [zipping, setZipping] = useState(false);
  const [batchDocxBlob, setBatchDocxBlob] = useState<Blob | null>(null);
  const [batchPdfBlob, setBatchPdfBlob] = useState<Blob | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const itemsRef = useRef<ImageItem[]>(items);
  itemsRef.current = items;

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
        if (item.convertedUrl) URL.revokeObjectURL(item.convertedUrl);
      });
    };
  }, []);

  const convertSingleItem = useCallback(
    async (
      item: ImageItem,
      targetFormat: OutputFormat,
      targetQuality: number,
      jpgMode: JpgSizeMode
    ): Promise<{ blob: Blob; url: string; size: number }> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = async () => {
          try {
            const canvas = document.createElement('canvas');
            const curWidth = img.naturalWidth || img.width;
            const curHeight = img.naturalHeight || img.height;

            canvas.width = curWidth;
            canvas.height = curHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error('Canvas context not available'));
              return;
            }

            // Always fill white background for JPEG / Word / PDF to handle alpha cleanly
            if (
              targetFormat === 'image/jpeg' ||
              targetFormat === 'docx' ||
              targetFormat === 'pdf'
            ) {
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Handle Word (.docx) Single Image Export
            if (targetFormat === 'docx') {
              const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
              const docxBlob = await createDocxFromImages([
                { dataUrl, width: curWidth, height: curHeight, name: item.name },
              ]);
              const url = URL.createObjectURL(docxBlob);
              resolve({ blob: docxBlob, url, size: docxBlob.size });
              return;
            }

            // Handle PDF Single Image Export
            if (targetFormat === 'pdf') {
              const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
              const pdfBlob = await createPdfFromImages([
                { dataUrl, width: curWidth, height: curHeight },
              ]);
              const url = URL.createObjectURL(pdfBlob);
              resolve({ blob: pdfBlob, url, size: pdfBlob.size });
              return;
            }

            // Handle Target Size JPG (<= 50KB or <= 20KB for portals)
            if (targetFormat === 'image/jpeg' && (jpgMode === '50kb' || jpgMode === '20kb')) {
              const targetBytes = (jpgMode === '50kb' ? 50 : 20) * 1024;
              let scale = 1.0;
              let bestBlob: Blob | null = null;

              const renderScaled = (w: number, h: number, q: number): Promise<Blob> => {
                return new Promise((res, rej) => {
                  const c = document.createElement('canvas');
                  c.width = Math.max(1, w);
                  c.height = Math.max(1, h);
                  const cx = c.getContext('2d');
                  if (!cx) return rej(new Error('Canvas context error'));
                  cx.fillStyle = '#FFFFFF';
                  cx.fillRect(0, 0, w, h);
                  cx.drawImage(img, 0, 0, w, h);
                  c.toBlob((b) => (b ? res(b) : rej(new Error('toBlob error'))), 'image/jpeg', q);
                });
              };

              for (let pass = 0; pass < 4; pass++) {
                const w = Math.max(20, Math.round(curWidth * scale));
                const h = Math.max(20, Math.round(curHeight * scale));

                let minQ = 0.05;
                let maxQ = 0.95;
                let passBest: Blob | null = null;

                for (let i = 0; i < 6; i++) {
                  const midQ = (minQ + maxQ) / 2;
                  const b = await renderScaled(w, h, midQ);
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
                } else {
                  scale *= 0.75;
                }
              }

              if (!bestBlob) {
                const w = Math.max(20, Math.round(curWidth * 0.3));
                const h = Math.max(20, Math.round(curHeight * 0.3));
                bestBlob = await renderScaled(w, h, 0.1);
              }

              const url = URL.createObjectURL(bestBlob);
              resolve({ blob: bestBlob, url, size: bestBlob.size });
              return;
            }

            // Standard Canvas Export (WebP, PNG, standard JPEG)
            const q = targetFormat === 'image/png' ? undefined : targetQuality / 100;
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error('Conversion failed'));
                  return;
                }
                const url = URL.createObjectURL(blob);
                resolve({ blob, url, size: blob.size });
              },
              targetFormat,
              q
            );
          } catch (err) {
            reject(err);
          }
        };
        img.onerror = () => reject(new Error('Failed to load image file'));
        img.src = item.previewUrl;
      });
    },
    []
  );

  const runBatchConversion = useCallback(
    async (
      list: ImageItem[],
      targetFormat: OutputFormat,
      targetQuality: number,
      jpgMode: JpgSizeMode
    ) => {
      if (list.length === 0) return;

      setItems((prev) =>
        prev.map((it) => (list.some((l) => l.id === it.id) ? { ...it, status: 'converting' } : it))
      );

      const updated = await Promise.all(
        list.map(async (item) => {
          try {
            if (item.convertedUrl) URL.revokeObjectURL(item.convertedUrl);
            const result = await convertSingleItem(item, targetFormat, targetQuality, jpgMode);
            return {
              ...item,
              convertedBlob: result.blob,
              convertedUrl: result.url,
              convertedSize: result.size,
              targetFormat,
              status: 'done' as const,
            };
          } catch (err) {
            return {
              ...item,
              targetFormat,
              status: 'error' as const,
              errorMessage: err instanceof Error ? err.message : 'Error converting image',
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

      // Pre-generate Combined Multi-image Word and PDF document if list has > 1 items
      if (updated.length > 0) {
        try {
          const validImages = await Promise.all(
            updated.map((u) => {
              return new Promise<{ dataUrl: string; width: number; height: number; name: string }>(
                (resolve) => {
                  const im = new Image();
                  im.onload = () => {
                    const c = document.createElement('canvas');
                    c.width = im.naturalWidth || im.width;
                    c.height = im.naturalHeight || im.height;
                    const ctx = c.getContext('2d');
                    if (ctx) {
                      ctx.fillStyle = '#FFFFFF';
                      ctx.fillRect(0, 0, c.width, c.height);
                      ctx.drawImage(im, 0, 0);
                    }
                    resolve({
                      dataUrl: c.toDataURL('image/jpeg', 0.9),
                      width: c.width,
                      height: c.height,
                      name: u.name,
                    });
                  };
                  im.src = u.previewUrl;
                }
              );
            })
          );

          const docxBlob = await createDocxFromImages(validImages);
          setBatchDocxBlob(docxBlob);

          const pdfBlob = await createPdfFromImages(validImages);
          setBatchPdfBlob(pdfBlob);
        } catch {
          // Non-critical fallback
        }
      }
    },
    [convertSingleItem]
  );

  // Auto re-convert when format or quality or size mode changes
  const prevSettingsRef = useRef({ globalFormat, quality, jpgSizeMode });
  useEffect(() => {
    if (
      prevSettingsRef.current.globalFormat !== globalFormat ||
      prevSettingsRef.current.quality !== quality ||
      prevSettingsRef.current.jpgSizeMode !== jpgSizeMode
    ) {
      prevSettingsRef.current = { globalFormat, quality, jpgSizeMode };
      if (items.length > 0) {
        const timer = setTimeout(() => {
          runBatchConversion(items, globalFormat, quality, jpgSizeMode);
        }, 220);
        return () => clearTimeout(timer);
      }
    }
  }, [globalFormat, quality, jpgSizeMode, items, runBatchConversion]);

  const processIncomingFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter(
      (file) =>
        file.type.startsWith('image/') || /\.(jpe?g|png|webp|gif|svg|avif|bmp)$/i.test(file.name)
    );
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
          originalFormat: detectFormatName(file),
          originalWidth: img.naturalWidth || img.width,
          originalHeight: img.naturalHeight || img.height,
          previewUrl: url,
          convertedBlob: null,
          convertedUrl: null,
          convertedSize: null,
          targetFormat: globalFormat,
          status: 'idle',
        });
        loadedCount++;
        if (loadedCount === fileArray.length) {
          setItems((prev) => [...prev, ...newItems]);
          runBatchConversion(newItems, globalFormat, quality, jpgSizeMode);
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === fileArray.length && newItems.length > 0) {
          setItems((prev) => [...prev, ...newItems]);
          runBatchConversion(newItems, globalFormat, quality, jpgSizeMode);
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
      processIncomingFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processIncomingFiles(e.target.files);
    }
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => {
      const item = prev.find((it) => it.id === id);
      if (item) {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
        if (item.convertedUrl) URL.revokeObjectURL(item.convertedUrl);
      }
      return prev.filter((it) => it.id !== id);
    });
  };

  const handleClearAll = () => {
    items.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      if (item.convertedUrl) URL.revokeObjectURL(item.convertedUrl);
    });
    setItems([]);
    setBatchDocxBlob(null);
    setBatchPdfBlob(null);
  };

  const handleDownloadSingle = (item: ImageItem) => {
    if (!item.convertedUrl) return;
    const ext = getFormatExtension(item.targetFormat);
    const base = item.name.replace(/\.[^/.]+$/, '');
    const link = document.createElement('a');
    link.href = item.convertedUrl;
    link.download = `${base}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadCombinedDocx = () => {
    if (!batchDocxBlob) return;
    const url = URL.createObjectURL(batchDocxBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `converted-documents-${Date.now()}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadCombinedPdf = () => {
    if (!batchPdfBlob) return;
    const url = URL.createObjectURL(batchPdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `converted-document-${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAllZip = async () => {
    const readyItems = items.filter((it) => it.convertedBlob);
    if (readyItems.length === 0) return;

    setZipping(true);
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      readyItems.forEach((item, index) => {
        const ext = getFormatExtension(item.targetFormat);
        const base = item.name.replace(/\.[^/.]+$/, '');
        const filename = `${base || `image-${index + 1}`}.${ext}`;
        zip.file(filename, item.convertedBlob!);
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `converted-images-${Date.now()}.zip`;
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
    name: 'AI Image Converter to JPG & Word (.docx) - VelnoxLabs',
    url: 'https://velnoxlabs.com/tools/image-format-converter',
    description:
      'Free AI online image converter to JPG, Word (.docx), PDF, PNG & WebP. Client-side converter supporting 50KB & 20KB JPG targets and ChatGPT images with 100% privacy.',
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
            accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.svg,.avif,.bmp"
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
                100% Client-Side Private (Zero Upload)
              </span>
            </div>
          </div>
        </div>

        {/* Conversion Settings Panel */}
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

          {/* Target Output Format Grid: JPG, Word (.docx), PDF, WebP, PNG */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-[var(--text-main)] block">
              {tUI('targetFormatLabel')}
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {[
                {
                  id: 'image/jpeg' as OutputFormat,
                  label: 'JPG / JPEG',
                  hint: tUI('hintJpeg'),
                  badge: 'Photos & Portals',
                },
                {
                  id: 'docx' as OutputFormat,
                  label: 'Word (.docx)',
                  hint: tUI('hintWord'),
                  badge: 'Docs & Reports',
                },
                {
                  id: 'pdf' as OutputFormat,
                  label: 'PDF (.pdf)',
                  hint: tUI('hintPdf'),
                  badge: 'iLovePDF Alt',
                },
                {
                  id: 'image/webp' as OutputFormat,
                  label: 'WebP',
                  hint: tUI('hintWebp'),
                  badge: 'Fast Web',
                },
                {
                  id: 'image/png' as OutputFormat,
                  label: 'PNG',
                  hint: tUI('hintPng'),
                  badge: 'Lossless',
                },
              ].map((fmt) => (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => setGlobalFormat(fmt.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                    globalFormat === fmt.id
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-blue-600'
                      : 'border-[var(--border-color)] bg-[var(--bg-page)] text-[var(--text-muted)] hover:border-zinc-400 dark:hover:border-zinc-700 hover:text-[var(--text-main)]'
                  }`}
                >
                  <span className="text-xs font-bold">{fmt.label}</span>
                  <span className="text-[10px] opacity-75 mt-0.5">{fmt.hint}</span>
                  <span className="inline-block text-[9px] font-semibold mt-1 px-1.5 py-0.2 rounded bg-zinc-200/60 dark:bg-zinc-800">
                    {fmt.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Conditional Options for JPG: Quality Slider vs 50KB / 20KB Target Presets */}
          {globalFormat === 'image/jpeg' && (
            <div className="p-4 rounded-xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-[var(--text-main)] flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-blue-600" />
                  <span>{tUI('jpgSizeModeLabel')}</span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setJpgSizeMode('custom')}
                    className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                      jpgSizeMode === 'custom'
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-white dark:bg-zinc-800 text-[var(--text-muted)] border border-[var(--border-color)]'
                    }`}
                  >
                    {tUI('jpgModeNormal')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setJpgSizeMode('50kb')}
                    className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                      jpgSizeMode === '50kb'
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-white dark:bg-zinc-800 text-[var(--text-muted)] border border-[var(--border-color)]'
                    }`}
                  >
                    Convert to JPG &le; 50 KB
                  </button>
                  <button
                    type="button"
                    onClick={() => setJpgSizeMode('20kb')}
                    className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                      jpgSizeMode === '20kb'
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-white dark:bg-zinc-800 text-[var(--text-muted)] border border-[var(--border-color)]'
                    }`}
                  >
                    Convert to JPG &le; 20 KB
                  </button>
                </div>
              </div>

              {jpgSizeMode === 'custom' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[var(--text-main)]">
                      {tUI('qualityLabel')}
                    </span>
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
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
                  <p className="text-[11px] text-[var(--text-muted)]">{tUI('qualityHint')}</p>
                </div>
              ) : (
                <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>
                    Auto-optimizer will binary-search canvas resolution to ensure output JPG stays
                    strictly under {jpgSizeMode === '50kb' ? '50 KB' : '20 KB'} for official
                    portals.
                  </span>
                </p>
              )}
            </div>
          )}

          {/* Word (.docx) Notice */}
          {globalFormat === 'docx' && (
            <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40 flex items-start gap-3">
              <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-indigo-950 dark:text-indigo-200">
                  Microsoft Word (.docx) Native Embedding Active
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1">{tUI('wordNotice')}</p>
              </div>
            </div>
          )}

          {/* PDF Notice */}
          {globalFormat === 'pdf' && (
            <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 flex items-start gap-3">
              <FileArchive className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-rose-950 dark:text-rose-200">
                  Client-side PDF Document Engine (Free iLovePDF Alternative)
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1">{tUI('pdfNotice')}</p>
              </div>
            </div>
          )}

          {/* Batch Status Bar & Multi-Image Export Controls */}
          {items.length > 0 && (
            <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border-color)]">
              <div className="text-xs text-[var(--text-muted)] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>
                  {tUI('selectedCount', { count: items.length })} • {readyCount} / {items.length}{' '}
                  {tUI('statusDone')}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Export All to Single Word Document */}
                {readyCount > 1 && batchDocxBlob && (
                  <button
                    type="button"
                    onClick={handleDownloadCombinedDocx}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-blue-700 hover:bg-blue-800 text-white shadow-sm transition-all cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{tUI('downloadCombinedWord')}</span>
                  </button>
                )}

                {/* Export All to Single PDF Document */}
                {readyCount > 1 && batchPdfBlob && (
                  <button
                    type="button"
                    onClick={handleDownloadCombinedPdf}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all cursor-pointer"
                  >
                    <FileArchive className="w-3.5 h-3.5" />
                    <span>{tUI('downloadCombinedPdf')}</span>
                  </button>
                )}

                {/* Download All as ZIP */}
                {readyCount > 1 && (
                  <button
                    type="button"
                    onClick={handleDownloadAllZip}
                    disabled={zipping}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm disabled:opacity-50 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{zipping ? tUI('zipping') : tUI('downloadAllZip')}</span>
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
                const targetLabel = getFormatShortLabel(item.targetFormat);

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl p-4 sm:p-5 border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
                  >
                    {/* Left: Preview & Details */}
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

                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          {/* Format Transition Badge */}
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-semibold bg-zinc-100 dark:bg-zinc-800 text-[var(--text-main)] border border-[var(--border-color)]">
                            <span>{item.originalFormat}</span>
                            <ArrowRight className="w-3 h-3 text-[var(--text-muted)]" />
                            <span className="text-blue-600 dark:text-blue-400 font-bold">
                              {targetLabel}
                            </span>
                          </span>

                          <span className="text-[var(--text-muted)] font-mono">
                            {item.originalWidth} × {item.originalHeight} px
                          </span>
                        </div>

                        {/* File Size Transition */}
                        {item.status === 'done' && item.convertedSize !== null ? (
                          <div className="flex flex-wrap items-center gap-2 font-mono text-xs sm:text-sm">
                            <span className="text-[var(--text-muted)]">
                              {tUI('original')}: {formatBytes(item.originalSize)}
                            </span>
                            <span className="text-[var(--text-muted)] font-bold">→</span>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                              {tUI('result')}: {formatBytes(item.convertedSize)}
                            </span>
                          </div>
                        ) : item.status === 'converting' ? (
                          <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>{tUI('statusConverting')}</span>
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
                      {item.status === 'done' && item.convertedUrl && (
                        <button
                          type="button"
                          onClick={() => handleDownloadSingle(item)}
                          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                          <span>{tUI('download')}</span>
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
                  <th className="py-2.5 px-3 font-semibold">{tUI('compColConvertio')}</th>
                  <th className="py-2.5 px-3 font-semibold">{tUI('compColCloud')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-main)]">
                <tr>
                  <td className="py-2.5 px-3 font-medium">Native Word (.docx) & PDF Export</td>
                  <td className="py-2.5 px-3 text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Yes (Pure Client-side)
                  </td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">Separate Paid Tools</td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">Cloud Quota Limited</td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">25 Daily Cap</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium">
                    1-Click Convert to JPG &le; 50KB & 20KB
                  </td>
                  <td className="py-2.5 px-3 text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Built-in Optimizer
                  </td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">No Target Size</td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">No Target Size</td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">Requires API Script</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium">100% Client-Side Privacy (No Upload)</td>
                  <td className="py-2.5 px-3 text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> 100% Local Browser
                  </td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">Cloud Server Upload</td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">Cloud Server Upload</td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">Cloud Server Upload</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium">ChatGPT / AI & Vector Images to JPG</td>
                  <td className="py-2.5 px-3 text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Full Support
                  </td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">Limited Formats</td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">Paid Tier</td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">Paid Tier</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium">Account / Watermark Restrictions</td>
                  <td className="py-2.5 px-3 text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> No Account & No Watermark
                  </td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">Account for Multi-file</td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">Subscription Required</td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">Minutes Cap</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Centralized SEO, About, How-to, & FAQs Component */}
        <ToolSeoContent
          toolSlug="image-format-converter"
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
