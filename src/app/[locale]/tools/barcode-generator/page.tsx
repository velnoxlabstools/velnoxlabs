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
  Settings,
  AlertCircle,
  FileArchive,
  RefreshCw,
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

interface BulkBarcodeItem {
  id: string;
  value: string;
  svgDataUrl?: string;
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
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Bulk mode state
  const [bulkInput, setBulkInput] = useState('PROD-001\nPROD-002\nPROD-003');
  const [bulkItems, setBulkItems] = useState<BulkBarcodeItem[]>([]);
  const [isZipping, setIsZipping] = useState(false);

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Render Single Barcode
  const renderSingleBarcode = useCallback(() => {
    if (!svgRef.current) return;
    if (!barcodeValue.trim()) {
      setError(null);
      svgRef.current.innerHTML = '';
      return;
    }

    try {
      // Clear previous content
      svgRef.current.innerHTML = '';
      JsBarcode(svgRef.current, barcodeValue.trim(), {
        format: format,
        lineColor: barColor,
        width: barWidth,
        height: barHeight,
        displayValue: showText,
        background: bgColor,
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
  }, [barcodeValue, format, barWidth, barHeight, showText, barColor, bgColor]);

  useEffect(() => {
    if (mode === 'single') {
      renderSingleBarcode();
    }
  }, [mode, renderSingleBarcode]);

  // Download Single PNG
  const downloadSinglePng = () => {
    if (!barcodeValue.trim() || error) return;
    try {
      const canvas = document.createElement('canvas');
      JsBarcode(canvas, barcodeValue.trim(), {
        format: format,
        lineColor: barColor,
        width: barWidth * 2, // 2x high resolution
        height: barHeight * 2,
        displayValue: showText,
        background: bgColor,
        margin: 20,
        fontSize: 28,
        textMargin: 8,
      });

      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `barcode-${barcodeValue.trim()}-${format.toLowerCase()}.png`;
      a.click();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    }
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
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  // Generate Bulk Barcodes
  const generateBulkBarcodes = () => {
    const lines = bulkInput
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const results: BulkBarcodeItem[] = lines.map((val, idx) => {
      const itemCanvas = document.createElement('canvas');
      const itemSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

      try {
        JsBarcode(itemCanvas, val, {
          format: format,
          lineColor: barColor,
          width: barWidth * 2,
          height: barHeight * 2,
          displayValue: showText,
          background: bgColor,
          margin: 16,
          fontSize: 24,
        });

        JsBarcode(itemSvg, val, {
          format: format,
          lineColor: barColor,
          width: barWidth,
          height: barHeight,
          displayValue: showText,
          background: bgColor,
          margin: 10,
          fontSize: 14,
        });

        const serializer = new XMLSerializer();
        const svgStr = serializer.serializeToString(itemSvg);
        const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
        const svgDataUrl = URL.createObjectURL(svgBlob);

        return {
          id: `${idx}-${val}`,
          value: val,
          pngDataUrl: itemCanvas.toDataURL('image/png'),
          svgDataUrl: svgDataUrl,
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
        <SectionHeading title={tUI('title')} subtitle={tUI('subtitle')} />

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
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
                  if (!barcodeValue.trim() || Object.values(FORMAT_SAMPLES).includes(barcodeValue.trim())) {
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

            {/* Show Text Toggle */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  marginTop: '18px',
                }}
              >
                <input
                  type="checkbox"
                  checked={showText}
                  onChange={(e) => setShowText(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary, #3b82f6)' }}
                />
                {tUI('showTextLabel')}
              </label>
            </div>
          </div>

          {/* SINGLE MODE */}
          {mode === 'single' ? (
            <div>
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
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    value={barcodeValue}
                    onChange={(e) => setBarcodeValue(e.target.value)}
                    placeholder={tUI('barcodeValuePlaceholder')}
                    style={{
                      flex: 1,
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
                    onClick={renderSingleBarcode}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: 'var(--color-primary, #3b82f6)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0 20px',
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

                {/* Barcode SVG Container with crisp white backing */}
                <div
                  style={{
                    backgroundColor: bgColor,
                    padding: '16px 24px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    display: 'inline-block',
                    maxWidth: '100%',
                    overflowX: 'auto',
                  }}
                >
                  <svg ref={svgRef} id="barcode-svg" style={{ display: 'block', margin: '0 auto' }} />
                </div>
              </div>

              {/* Action Buttons Deck */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '12px',
                  justifyContent: 'center',
                }}
              >
                <button
                  onClick={downloadSinglePng}
                  disabled={!!error || !barcodeValue.trim()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: 'rgba(59, 130, 246, 0.15)',
                    color: '#60a5fa',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '8px',
                    padding: '10px 18px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: error || !barcodeValue.trim() ? 'not-allowed' : 'pointer',
                    opacity: error || !barcodeValue.trim() ? 0.5 : 1,
                    transition: 'all 0.2s',
                  }}
                >
                  <Download size={16} />
                  {tUI('downloadPng')}
                </button>

                <button
                  onClick={downloadSingleSvg}
                  disabled={!!error || !barcodeValue.trim()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    color: '#34d399',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '8px',
                    padding: '10px 18px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: error || !barcodeValue.trim() ? 'not-allowed' : 'pointer',
                    opacity: error || !barcodeValue.trim() ? 0.5 : 1,
                    transition: 'all 0.2s',
                  }}
                >
                  <Download size={16} />
                  {tUI('downloadSvg')}
                </button>

                <button
                  onClick={copySingleSvg}
                  disabled={!!error || !barcodeValue.trim()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: copied ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    color: copied ? '#34d399' : 'var(--text-main)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '10px 18px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: error || !barcodeValue.trim() ? 'not-allowed' : 'pointer',
                    opacity: error || !barcodeValue.trim() ? 0.5 : 1,
                    transition: 'all 0.2s',
                  }}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? tUI('copied') : tUI('copySvg')}
                </button>
              </div>
            </div>
          ) : (
            /* BULK MODE */
            <div>
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
                    transition: 'opacity 0.2s',
                  }}
                >
                  <RefreshCw size={16} />
                  {tUI('generateAllButton')}
                </button>

                {bulkItems.filter((i) => i.valid).length > 0 && (
                  <button
                    onClick={downloadAllZip}
                    disabled={isZipping}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                      color: '#34d399',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '8px',
                      padding: '10px 18px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: isZipping ? 'wait' : 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <FileArchive size={16} />
                    {isZipping ? 'Compressing...' : tUI('bulkDownloadZip')}
                  </button>
                )}

                {bulkItems.length > 0 && (
                  <button
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
                              backgroundColor: bgColor,
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
                                color: '#60a5fa',
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
                          <p style={{ fontWeight: 600 }}>{tUI('formatMismatchWarning', { value: item.value })}</p>
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
