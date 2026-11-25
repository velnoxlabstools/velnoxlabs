'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import JsBarcode from 'jsbarcode';
import JSZip from 'jszip';
import {
  Download,
  Copy,
  Check,
  Barcode as BarcodeIcon,
  Layers,
  AlertCircle,
  FileArchive,
  RefreshCw,
  Wand2,
  Printer,
  Tag,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';

const FORMAT_SAMPLES: Record<string, string> = {
  CODE128: 'VELNOX-128',
  EAN13: '9780201379624',
  UPC: '012345678905',
  CODE39: 'VELNOX39',
  ITF14: '12345678901231',
  MSI: '123456',
  pharmacode: '1234',
};

function computeGs1CheckDigit(digits: string): string {
  const arr = digits.split('').map(Number);
  let sum = 0;
  // Traverse from right to left; rightmost digit has weight 3
  for (let i = arr.length - 1, pos = 0; i >= 0; i--, pos++) {
    sum += arr[i] * (pos % 2 === 0 ? 3 : 1);
  }
  const mod = sum % 10;
  return String(mod === 0 ? 0 : 10 - mod);
}

interface BulkBarcodeItem {
  id: string;
  value: string;
  pngDataUrl?: string;
  error?: string;
  valid: boolean;
}

export default function BarcodeGeneratorPage() {
  const tUI = useTranslations('ToolUI.barcodeGenerator');

  // Mode: 'single' | 'bulk'
  const [mode, setMode] = useState<'single' | 'bulk'>('single');

  // Single mode state
  const [barcodeValue, setBarcodeValue] = useState('VELNOX-128');
  const [format, setFormat] = useState('CODE128');
  const [barWidth, setBarWidth] = useState(2);
  const [barHeight, setBarHeight] = useState(80);
  const [showText, setShowText] = useState(true);
  const [barColor, setBarColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [transparentBg, setTransparentBg] = useState(false);

  // Product Sticker / Label mode
  const [showLabelOptions, setShowLabelOptions] = useState(false);
  const [productTitle, setProductTitle] = useState('');
  const [productPrice, setProductPrice] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [copiedSvg, setCopiedSvg] = useState(false);
  const [copiedPng, setCopiedPng] = useState(false);

  // Bulk mode state
  const [bulkInput, setBulkInput] = useState('PROD-001\nPROD-002\nPROD-003');
  const [bulkItems, setBulkItems] = useState<BulkBarcodeItem[]>([]);
  const [isZipping, setIsZipping] = useState(false);

  // Sequential generator state
  const [seqPrefix, setSeqPrefix] = useState('SKU-');
  const [seqStart, setSeqStart] = useState(1);
  const [seqCount, setSeqCount] = useState(10);
  const [seqPad, setSeqPad] = useState(3);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const effectiveBg = transparentBg ? 'transparent' : bgColor;

  // Smart AI Check-Digit & Format Suggestion
  const smartSuggestion = useMemo(() => {
    const val = barcodeValue.trim();
    if (!val) return null;

    const isNumericOnly = /^\d+$/.test(val);
    if (format === 'EAN13' && isNumericOnly && val.length === 12) {
      return { type: 'checkdigit' as const, fixed: val + computeGs1CheckDigit(val) };
    }
    if (format === 'UPC' && isNumericOnly && val.length === 11) {
      return { type: 'checkdigit' as const, fixed: val + computeGs1CheckDigit(val) };
    }
    if (format === 'ITF14' && isNumericOnly && val.length === 13) {
      return { type: 'checkdigit' as const, fixed: val + computeGs1CheckDigit(val) };
    }
    if (['EAN13', 'UPC', 'ITF14', 'MSI', 'pharmacode'].includes(format) && !isNumericOnly) {
      return { type: 'switch128' as const };
    }
    return null;
  }, [barcodeValue, format]);

  // Render Single Barcode SVG
  const renderSingleBarcode = useCallback(() => {
    if (!svgRef.current) return;
    if (!barcodeValue.trim()) {
      setError(null);
      svgRef.current.innerHTML = '';
      return;
    }

    try {
      svgRef.current.innerHTML = '';
      JsBarcode(svgRef.current, barcodeValue.trim(), {
        format: format,
        lineColor: barColor,
        width: barWidth,
        height: barHeight,
        displayValue: showText,
        background: effectiveBg,
        margin: 12,
        fontSize: 16,
        textMargin: 6,
        valid: function (valid) {
          if (!valid) {
            setError(format);
          } else {
            setError(null);
          }
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      if (svgRef.current) {
        svgRef.current.innerHTML = '';
      }
    }
  }, [barcodeValue, format, barWidth, barHeight, showText, barColor, effectiveBg]);

  useEffect(() => {
    if (mode === 'single') {
      renderSingleBarcode();
    }
  }, [mode, renderSingleBarcode]);

  // Build high-res canvas (including optional product label header)
  const buildSingleCanvas = useCallback((): HTMLCanvasElement | null => {
    if (!barcodeValue.trim() || error) return null;
    try {
      const barcodeCanvas = document.createElement('canvas');
      JsBarcode(barcodeCanvas, barcodeValue.trim(), {
        format: format,
        lineColor: barColor,
        width: barWidth * 2,
        height: barHeight * 2,
        displayValue: showText,
        background: transparentBg ? 'rgba(0,0,0,0)' : bgColor,
        margin: 20,
        fontSize: 28,
        textMargin: 8,
      });

      const hasHeader = showLabelOptions && (productTitle.trim() || productPrice.trim());
      if (!hasHeader) return barcodeCanvas;

      const headerHeight = 56;
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = Math.max(barcodeCanvas.width, 320);
      finalCanvas.height = barcodeCanvas.height + headerHeight;

      const ctx = finalCanvas.getContext('2d');
      if (!ctx) return barcodeCanvas;

      if (!transparentBg) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
      }

      ctx.fillStyle = barColor;
      ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
      ctx.textBaseline = 'middle';

      const title = productTitle.trim();
      const price = productPrice.trim();

      if (title && price) {
        ctx.textAlign = 'left';
        ctx.fillText(title, 20, 32, finalCanvas.width - 130);
        ctx.textAlign = 'right';
        ctx.fillText(price, finalCanvas.width - 20, 32);
      } else {
        ctx.textAlign = 'center';
        ctx.fillText(title || price, finalCanvas.width / 2, 32, finalCanvas.width - 40);
      }

      const xOffset = Math.floor((finalCanvas.width - barcodeCanvas.width) / 2);
      ctx.drawImage(barcodeCanvas, xOffset, headerHeight);
      return finalCanvas;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      return null;
    }
  }, [
    barcodeValue,
    error,
    format,
    barColor,
    barWidth,
    barHeight,
    showText,
    transparentBg,
    bgColor,
    showLabelOptions,
    productTitle,
    productPrice,
  ]);

  // Download Single PNG
  const downloadSinglePng = () => {
    const canvas = buildSingleCanvas();
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `barcode-${barcodeValue.trim()}-${format.toLowerCase()}.png`;
    a.click();
  };

  // Copy Single PNG to Clipboard
  const copySinglePng = async () => {
    const canvas = buildSingleCanvas();
    if (!canvas) return;
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      try {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setCopiedPng(true);
        setTimeout(() => setCopiedPng(false), 2000);
      } catch {
        // Fallback if ClipboardItem is unsupported
        downloadSinglePng();
      }
    }, 'image/png');
  };

  // Download Single SVG
  const downloadSingleSvg = () => {
    if (!svgRef.current || !barcodeValue.trim() || error) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svgRef.current);
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `barcode-${barcodeValue.trim()}-${format.toLowerCase()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy SVG to Clipboard
  const copySingleSvg = async () => {
    if (!svgRef.current || !barcodeValue.trim() || error) return;
    try {
      const serializer = new XMLSerializer();
      const svgStr = serializer.serializeToString(svgRef.current);
      await navigator.clipboard.writeText(svgStr);
      setCopiedSvg(true);
      setTimeout(() => setCopiedSvg(false), 2000);
    } catch {
      // fallback
    }
  };

  // Print Single or Bulk Labels cleanly
  const handlePrintLabels = (items: { title?: string; price?: string; dataUrl: string }[]) => {
    if (items.length === 0) return;
    const printWin = window.open('', '_blank', 'width=800,height=600');
    if (!printWin) return;

    const cardsHtml = items
      .map(
        (it) => `
      <div style="border: 1px dashed #cbd5e1; padding: 12px; display: inline-flex; flex-direction: column; align-items: center; margin: 8px; page-break-inside: avoid; background: #fff;">
        ${
          it.title || it.price
            ? `<div style="width:100%; display:flex; justify-content:space-between; font-family:sans-serif; font-size:12px; font-weight:700; margin-bottom:4px; color:#000;">
                <span>${it.title || ''}</span><span>${it.price || ''}</span>
               </div>`
            : ''
        }
        <img src="${it.dataUrl}" style="max-width: 240px; height: auto;" />
      </div>
    `
      )
      .join('');

    printWin.document.write(`
      <!doctype html>
      <html>
        <head><title>Barcode Labels</title></head>
        <body style="margin: 16px; font-family: sans-serif; display: flex; flex-wrap: wrap; align-items: flex-start;">
          ${cardsHtml}
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  const printSingleLabel = () => {
    const canvas = buildSingleCanvas();
    if (!canvas) return;
    handlePrintLabels([{ dataUrl: canvas.toDataURL('image/png') }]);
  };

  // Generate Sequential Bulk Values
  const handleGenerateSequence = () => {
    const safeCount = Math.min(Math.max(seqCount, 1), 200);
    const lines: string[] = [];
    for (let i = 0; i < safeCount; i++) {
      const numStr = String(seqStart + i).padStart(seqPad, '0');
      lines.push(`${seqPrefix}${numStr}`);
    }
    setBulkInput(lines.join('\n'));
  };

  // Handle CSV / TXT upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = String(ev.target?.result || '');
      const lines = content
        .split(/[\r\n,;]+/)
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 500);
      setBulkInput(lines.join('\n'));
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Generate Bulk Barcodes
  const generateBulkBarcodes = () => {
    const lines = bulkInput
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const results: BulkBarcodeItem[] = lines.map((val, idx) => {
      const itemCanvas = document.createElement('canvas');
      try {
        JsBarcode(itemCanvas, val, {
          format: format,
          lineColor: barColor,
          width: barWidth * 2,
          height: barHeight * 2,
          displayValue: showText,
          background: transparentBg ? 'rgba(0,0,0,0)' : bgColor,
          margin: 16,
          fontSize: 24,
        });

        return {
          id: `${idx}-${val}`,
          value: val,
          pngDataUrl: itemCanvas.toDataURL('image/png'),
          valid: true,
        };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return {
          id: `${idx}-${val}`,
          value: val,
          error: msg,
          valid: false,
        };
      }
    });

    setBulkItems(results);
  };

  // Download All as ZIP in Bulk Mode
  const downloadAllZip = async () => {
    const validItems = bulkItems.filter((i) => i.valid && i.pngDataUrl);
    if (validItems.length === 0) return;

    setIsZipping(true);
    try {
      const zip = new JSZip();
      validItems.forEach((item, index) => {
        const base64Data = (item.pngDataUrl || '').replace(/^data:image\/png;base64,/, '');
        const filename = `barcode-${item.value.replace(/[^a-zA-Z0-9_-]/g, '_') || index + 1}.png`;
        zip.file(filename, base64Data, { base64: true });
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `barcodes-${format.toLowerCase()}-batch.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // zip error
    } finally {
      setIsZipping(false);
    }
  };

  // Dynamic Format Helper Hint
  const formatHint = useMemo(() => {
    switch (format) {
      case 'EAN13':
        return tUI('formatHintEan13');
      case 'UPC':
        return tUI('formatHintUpcA');
      case 'ITF14':
        return tUI('formatHintItf14');
      case 'CODE39':
        return tUI('formatHintCode39');
      case 'MSI':
        return tUI('formatHintMsi');
      case 'pharmacode':
        return tUI('formatHintPharmacode');
      case 'CODE128':
      default:
        return tUI('formatHintCode128');
    }
  }, [format, tUI]);

  return (
    <GlobalContainer maxWidth="2xl">
      <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
        <SectionHeading
          toolSlug="barcode-generator"
          title={tUI('title')}
          subtitle={tUI('subtitle')}
        />

        {/* MODE SWITCHER PILLS */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            backgroundColor: 'var(--bg-card)',
            padding: '6px',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
            width: 'fit-content',
            margin: 'var(--space-6) 0 var(--space-4) 0',
          }}
        >
          <button
            type="button"
            onClick={() => setMode('single')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '7px',
              border: 'none',
              backgroundColor: mode === 'single' ? 'var(--color-primary, #3b82f6)' : 'transparent',
              color: mode === 'single' ? '#ffffff' : 'var(--text-muted)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <BarcodeIcon size={16} />
            {tUI('singleMode')}
          </button>
          <button
            type="button"
            onClick={() => setMode('bulk')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '7px',
              border: 'none',
              backgroundColor: mode === 'bulk' ? 'var(--color-primary, #3b82f6)' : 'transparent',
              color: mode === 'bulk' ? '#ffffff' : 'var(--text-muted)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <Layers size={16} />
            {tUI('bulkMode')}
          </button>
        </div>

        {/* MAIN TOOL CONTAINER */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '24px',
          }}
        >
          {/* FORMAT & OPTIONS BAR */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '16px',
              marginBottom: '20px',
              paddingBottom: '20px',
              borderBottom: '1px solid var(--border-color)',
            }}
          >
            {/* Format Selection */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  marginBottom: '6px',
                }}
              >
                {tUI('formatLabel')}
              </label>
              <select
                value={format}
                onChange={(e) => {
                  const nextFormat = e.target.value;
                  setFormat(nextFormat);
                  if (
                    !barcodeValue.trim() ||
                    Object.values(FORMAT_SAMPLES).includes(barcodeValue.trim())
                  ) {
                    setBarcodeValue(FORMAT_SAMPLES[nextFormat] || 'VELNOX-128');
                  }
                }}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  padding: '10px 12px',
                  fontSize: '0.875rem',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="CODE128">{tUI('code128')}</option>
                <option value="EAN13">{tUI('ean13')}</option>
                <option value="UPC">{tUI('upcA')}</option>
                <option value="CODE39">{tUI('code39')}</option>
                <option value="ITF14">{tUI('itf14')}</option>
                <option value="MSI">{tUI('msi')}</option>
                <option value="pharmacode">{tUI('pharmacode')}</option>
              </select>
            </div>

            {/* Bar Width */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  marginBottom: '6px',
                }}
              >
                {tUI('barWidthLabel')}: {barWidth}px
              </label>
              <input
                type="range"
                min="1"
                max="4"
                step="1"
                value={barWidth}
                onChange={(e) => setBarWidth(parseInt(e.target.value, 10))}
                style={{ width: '100%', accentColor: 'var(--color-primary, #3b82f6)' }}
              />
            </div>

            {/* Bar Height */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  marginBottom: '6px',
                }}
              >
                {tUI('barHeightLabel')}: {barHeight}px
              </label>
              <input
                type="range"
                min="40"
                max="140"
                step="5"
                value={barHeight}
                onChange={(e) => setBarHeight(parseInt(e.target.value, 10))}
                style={{ width: '100%', accentColor: 'var(--color-primary, #3b82f6)' }}
              />
            </div>

            {/* Colors */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  marginBottom: '6px',
                }}
              >
                {tUI('colorsLabel')}
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="color"
                  value={barColor}
                  onChange={(e) => setBarColor(e.target.value)}
                  title={tUI('barColorLabel')}
                  style={{
                    width: '36px',
                    height: '32px',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                  }}
                />
                <input
                  type="color"
                  value={bgColor}
                  disabled={transparentBg}
                  onChange={(e) => setBgColor(e.target.value)}
                  title={tUI('bgColorLabel')}
                  style={{
                    width: '36px',
                    height: '32px',
                    border: 'none',
                    background: 'none',
                    cursor: transparentBg ? 'not-allowed' : 'pointer',
                    opacity: transparentBg ? 0.4 : 1,
                  }}
                />
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.78rem',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={transparentBg}
                    onChange={(e) => setTransparentBg(e.target.checked)}
                    style={{ accentColor: 'var(--color-primary, #3b82f6)' }}
                  />
                  {tUI('transparentLabel')}
                </label>
              </div>
            </div>

            {/* Toggles */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={showText}
                  onChange={(e) => setShowText(e.target.checked)}
                  style={{
                    width: '16px',
                    height: '16px',
                    accentColor: 'var(--color-primary, #3b82f6)',
                  }}
                />
                {tUI('showTextLabel')}
              </label>

              {mode === 'single' && (
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={showLabelOptions}
                    onChange={(e) => setShowLabelOptions(e.target.checked)}
                    style={{
                      width: '16px',
                      height: '16px',
                      accentColor: 'var(--color-primary, #3b82f6)',
                    }}
                  />
                  {tUI('productLabelToggle')}
                </label>
              )}
            </div>
          </div>

          {/* SINGLE MODE */}
          {mode === 'single' ? (
            <div>
              {/* Optional Product Sticker Fields */}
              {showLabelOptions && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '12px',
                    marginBottom: '16px',
                    padding: '14px',
                    backgroundColor: 'rgba(59, 130, 246, 0.05)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '10px',
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: 'var(--text-main)',
                        marginBottom: '6px',
                      }}
                    >
                      <Tag size={14} />
                      {tUI('productTitleLabel')}
                    </label>
                    <input
                      type="text"
                      value={productTitle}
                      onChange={(e) => setProductTitle(e.target.value)}
                      placeholder={tUI('productTitlePlaceholder')}
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        color: 'var(--text-main)',
                        fontSize: '0.875rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: 'var(--text-main)',
                        marginBottom: '6px',
                      }}
                    >
                      {tUI('productPriceLabel')}
                    </label>
                    <input
                      type="text"
                      value={productPrice}
                      onChange={(e) => setProductPrice(e.target.value)}
                      placeholder={tUI('productPricePlaceholder')}
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        color: 'var(--text-main)',
                        fontSize: '0.875rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Input Row */}
              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    marginBottom: '8px',
                  }}
                >
                  {tUI('barcodeValueLabel')}
                </label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    value={barcodeValue}
                    onChange={(e) => setBarcodeValue(e.target.value)}
                    placeholder={tUI('barcodeValuePlaceholder')}
                    style={{
                      flex: 1,
                      minWidth: '220px',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      padding: '12px 14px',
                      fontSize: '1rem',
                      fontFamily: 'monospace',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={renderSingleBarcode}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: 'var(--color-primary, #3b82f6)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px 20px',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      transition: 'opacity 0.2s',
                    }}
                  >
                    <RefreshCw size={16} />
                    {tUI('generateButton')}
                  </button>
                </div>
                <p
                  id="format-helper-hint"
                  key={format}
                  style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '6px' }}
                >
                  {formatHint}
                </p>
              </div>

              {/* AI Smart Auto-Fix / Format Suggestion Banner */}
              {smartSuggestion && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    marginBottom: '16px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#8b5cf6',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                    }}
                  >
                    <Wand2 size={16} />
                    <span>
                      {smartSuggestion.type === 'checkdigit'
                        ? tUI('aiCheckDigitHint', { fixed: smartSuggestion.fixed })
                        : tUI('aiSwitch128Hint')}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (smartSuggestion.type === 'checkdigit') {
                        setBarcodeValue(smartSuggestion.fixed);
                      } else {
                        setFormat('CODE128');
                      }
                    }}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: '#8b5cf6',
                      color: '#ffffff',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {smartSuggestion.type === 'checkdigit'
                      ? tUI('aiAutoFixBtn')
                      : tUI('aiSwitch128Btn')}
                  </button>
                </div>
              )}

              {/* Error Box */}
              {error && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#f87171',
                    fontSize: '0.875rem',
                    marginBottom: '20px',
                  }}
                >
                  <AlertCircle size={18} />
                  <span>{tUI('invalidFormatError', { error })}</span>
                </div>
              )}

              {/* Barcode Output Preview Area */}
              <div
                style={{
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '28px',
                  textAlign: 'center',
                  minHeight: '200px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                }}
              >
                <p
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '16px',
                  }}
                >
                  {tUI('previewHeading')} ({format})
                </p>

                {/* Barcode SVG Container */}
                <div
                  style={{
                    backgroundColor: transparentBg ? 'transparent' : bgColor,
                    backgroundImage: transparentBg
                      ? 'repeating-conic-gradient(#e2e8f0 0% 25%, transparent 0% 50%)'
                      : undefined,
                    backgroundSize: transparentBg ? '16px 16px' : undefined,
                    padding: '16px 24px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    display: 'inline-block',
                    maxWidth: '100%',
                    overflowX: 'auto',
                  }}
                >
                  {showLabelOptions && (productTitle.trim() || productPrice.trim()) && (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '16px',
                        color: barColor,
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        marginBottom: '6px',
                      }}
                    >
                      <span>{productTitle.trim()}</span>
                      <span>{productPrice.trim()}</span>
                    </div>
                  )}
                  <svg
                    ref={svgRef}
                    id="barcode-svg"
                    style={{ display: 'block', margin: '0 auto' }}
                  />
                </div>
              </div>

              {/* Action Buttons Deck */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '10px',
                  justifyContent: 'center',
                }}
              >
                <button
                  type="button"
                  onClick={downloadSinglePng}
                  disabled={!!error || !barcodeValue.trim()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: 'rgba(59, 130, 246, 0.15)',
                    color: '#3b82f6',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '8px',
                    padding: '10px 16px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: error || !barcodeValue.trim() ? 'not-allowed' : 'pointer',
                    opacity: error || !barcodeValue.trim() ? 0.5 : 1,
                  }}
                >
                  <Download size={16} />
                  {tUI('downloadPng')}
                </button>

                <button
                  type="button"
                  onClick={downloadSingleSvg}
                  disabled={!!error || !barcodeValue.trim()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    color: '#10b981',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '8px',
                    padding: '10px 16px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: error || !barcodeValue.trim() ? 'not-allowed' : 'pointer',
                    opacity: error || !barcodeValue.trim() ? 0.5 : 1,
                  }}
                >
                  <Download size={16} />
                  {tUI('downloadSvg')}
                </button>

                <button
                  type="button"
                  onClick={copySinglePng}
                  disabled={!!error || !barcodeValue.trim()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: copiedPng
                      ? 'rgba(16, 185, 129, 0.2)'
                      : 'rgba(255, 255, 255, 0.05)',
                    color: copiedPng ? '#10b981' : 'var(--text-main)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '10px 16px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: error || !barcodeValue.trim() ? 'not-allowed' : 'pointer',
                    opacity: error || !barcodeValue.trim() ? 0.5 : 1,
                  }}
                >
                  {copiedPng ? <Check size={16} /> : <ImageIcon size={16} />}
                  {copiedPng ? tUI('copied') : tUI('copyPng')}
                </button>

                <button
                  type="button"
                  onClick={copySingleSvg}
                  disabled={!!error || !barcodeValue.trim()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: copiedSvg
                      ? 'rgba(16, 185, 129, 0.2)'
                      : 'rgba(255, 255, 255, 0.05)',
                    color: copiedSvg ? '#10b981' : 'var(--text-main)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '10px 16px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: error || !barcodeValue.trim() ? 'not-allowed' : 'pointer',
                    opacity: error || !barcodeValue.trim() ? 0.5 : 1,
                  }}
                >
                  {copiedSvg ? <Check size={16} /> : <Copy size={16} />}
                  {copiedSvg ? tUI('copied') : tUI('copySvg')}
                </button>

                <button
                  type="button"
                  onClick={printSingleLabel}
                  disabled={!!error || !barcodeValue.trim()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: 'rgba(234, 179, 8, 0.15)',
                    color: '#ca8a04',
                    border: '1px solid rgba(234, 179, 8, 0.3)',
                    borderRadius: '8px',
                    padding: '10px 16px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: error || !barcodeValue.trim() ? 'not-allowed' : 'pointer',
                    opacity: error || !barcodeValue.trim() ? 0.5 : 1,
                  }}
                >
                  <Printer size={16} />
                  {tUI('printLabel')}
                </button>
              </div>
            </div>
          ) : (
            /* BULK MODE */
            <div>
              {/* Sequential Generator & CSV Upload */}
              <div
                style={{
                  backgroundColor: 'rgba(0,0,0,0.02)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '14px',
                  marginBottom: '16px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '10px',
                    marginBottom: '10px',
                  }}
                >
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {tUI('seqGeneratorTitle')}
                  </span>

                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,.txt"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-card)',
                        color: 'var(--text-main)',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <Upload size={14} />
                      {tUI('uploadCsvBtn')}
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                    gap: '8px',
                    alignItems: 'end',
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.72rem',
                        color: 'var(--text-muted)',
                        marginBottom: '4px',
                      }}
                    >
                      {tUI('seqPrefix')}
                    </label>
                    <input
                      type="text"
                      value={seqPrefix}
                      onChange={(e) => setSeqPrefix(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-page)',
                        color: 'var(--text-main)',
                        fontSize: '0.85rem',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.72rem',
                        color: 'var(--text-muted)',
                        marginBottom: '4px',
                      }}
                    >
                      {tUI('seqStart')}
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={seqStart}
                      onChange={(e) => setSeqStart(Number(e.target.value) || 0)}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-page)',
                        color: 'var(--text-main)',
                        fontSize: '0.85rem',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.72rem',
                        color: 'var(--text-muted)',
                        marginBottom: '4px',
                      }}
                    >
                      {tUI('seqCount')}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={200}
                      value={seqCount}
                      onChange={(e) => setSeqCount(Number(e.target.value) || 1)}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-page)',
                        color: 'var(--text-main)',
                        fontSize: '0.85rem',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.72rem',
                        color: 'var(--text-muted)',
                        marginBottom: '4px',
                      }}
                    >
                      {tUI('seqPad')}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={seqPad}
                      onChange={(e) => setSeqPad(Number(e.target.value) || 1)}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-page)',
                        color: 'var(--text-main)',
                        fontSize: '0.85rem',
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateSequence}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: '#3b82f6',
                      color: '#ffffff',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {tUI('seqFillBtn')}
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    marginBottom: '8px',
                  }}
                >
                  {tUI('bulkInputLabel')}
                </label>
                <textarea
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  rows={6}
                  placeholder={tUI('bulkInputPlaceholder')}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    padding: '12px 14px',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* Bulk Actions */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
                <button
                  type="button"
                  onClick={generateBulkBarcodes}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: 'var(--color-primary, #3b82f6)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                  }}
                >
                  <RefreshCw size={16} />
                  {tUI('generateAllButton')}
                </button>

                {bulkItems.filter((i) => i.valid).length > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={downloadAllZip}
                      disabled={isZipping}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        color: '#10b981',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '8px',
                        padding: '10px 18px',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        cursor: isZipping ? 'wait' : 'pointer',
                      }}
                    >
                      <FileArchive size={16} />
                      {isZipping ? tUI('compressingZip') : tUI('bulkDownloadZip')}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handlePrintLabels(
                          bulkItems
                            .filter((i) => i.valid && i.pngDataUrl)
                            .map((i) => ({ dataUrl: i.pngDataUrl! }))
                        )
                      }
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: 'rgba(234, 179, 8, 0.15)',
                        color: '#ca8a04',
                        border: '1px solid rgba(234, 179, 8, 0.3)',
                        borderRadius: '8px',
                        padding: '10px 18px',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <Printer size={16} />
                      {tUI('printAllLabels')}
                    </button>
                  </>
                )}

                {bulkItems.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setBulkItems([]);
                      setBulkInput('');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: 'transparent',
                      color: 'var(--text-muted)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '10px 16px',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                    }}
                  >
                    {tUI('clearAll')}
                  </button>
                )}
              </div>

              {/* Bulk Results Summary */}
              {bulkItems.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>
                    {tUI('bulkSummary', { count: bulkItems.filter((i) => i.valid).length })}
                  </p>
                </div>
              )}

              {/* Bulk Items Grid */}
              {bulkItems.length > 0 && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                    gap: '16px',
                  }}
                >
                  {bulkItems.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      {item.valid && item.pngDataUrl ? (
                        <>
                          <div
                            style={{
                              backgroundColor: transparentBg ? 'transparent' : bgColor,
                              padding: '10px 12px',
                              borderRadius: '6px',
                              width: '100%',
                              display: 'flex',
                              justifyContent: 'center',
                              marginBottom: '12px',
                            }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.pngDataUrl}
                              alt={item.value}
                              style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
                            />
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              width: '100%',
                              alignItems: 'center',
                              borderTop: '1px solid var(--border-color)',
                              paddingTop: '10px',
                            }}
                          >
                            <span
                              style={{
                                fontSize: '0.8rem',
                                color: 'var(--text-muted)',
                                fontFamily: 'monospace',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '120px',
                              }}
                            >
                              {item.value}
                            </span>
                            <a
                              href={item.pngDataUrl}
                              download={`barcode-${item.value}.png`}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                color: '#3b82f6',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                textDecoration: 'none',
                              }}
                            >
                              <Download size={14} />
                              PNG
                            </a>
                          </div>
                        </>
                      ) : (
                        <div
                          style={{
                            padding: '16px',
                            textAlign: 'center',
                            color: '#f87171',
                            fontSize: '0.8rem',
                          }}
                        >
                          <AlertCircle size={20} style={{ margin: '0 auto 6px auto' }} />
                          <p style={{ fontWeight: 600 }}>
                            {tUI('formatMismatchWarning', { value: item.value })}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Centralized SEO & FAQ Section */}
        <ToolSeoContent
          toolSlug="barcode-generator"
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
