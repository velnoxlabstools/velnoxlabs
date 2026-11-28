'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import { Sparkles, Copy, Check, Upload, Palette, Eye } from 'lucide-react';

interface PantoneEntry {
  name: string;
  rgb: [number, number, number];
}

const PANTONE_PALETTE: PantoneEntry[] = [
  { name: 'Pantone 285 C', rgb: [0, 114, 206] },
  { name: 'Pantone 2728 C', rgb: [0, 71, 187] },
  { name: 'Pantone 2925 C', rgb: [0, 156, 222] },
  { name: 'Pantone 185 C', rgb: [228, 0, 43] },
  { name: 'Pantone 485 C', rgb: [218, 41, 28] },
  { name: 'Pantone 1505 C', rgb: [255, 105, 0] },
  { name: 'Pantone 116 C', rgb: [255, 205, 0] },
  { name: 'Pantone 354 C', rgb: [0, 177, 64] },
  { name: 'Pantone 347 C', rgb: [0, 154, 68] },
  { name: 'Pantone 2685 C', rgb: [51, 0, 114] },
  { name: 'Pantone 2592 C', rgb: [155, 38, 182] },
  { name: 'Pantone 219 C', rgb: [218, 24, 132] },
  { name: 'Pantone Black C', rgb: [45, 41, 38] },
  { name: 'Pantone Cool Gray 9 C', rgb: [117, 120, 123] },
  { name: 'Pantone Cool Gray 3 C', rgb: [200, 201, 199] },
  { name: 'Pantone 7541 C', rgb: [217, 225, 226] },
];

function clamp255(n: number) {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => clamp255(x).toString(16).padStart(2, '0')).join('');
}

function rgbToHslObj(r: number, g: number, b: number) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn:
        h = (gn - bn) / d + (gn < bn ? 6 : 0);
        break;
      case gn:
        h = (bn - rn) / d + 2;
        break;
      case bn:
        h = (rn - gn) / d + 4;
        break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslToRgbObj(h: number, s: number, l: number) {
  const sn = Math.max(0, Math.min(100, s)) / 100;
  const ln = Math.max(0, Math.min(100, l)) / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sn * Math.min(ln, 1 - ln);
  const f = (n: number) => ln - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return {
    r: Math.round(255 * f(0)),
    g: Math.round(255 * f(8)),
    b: Math.round(255 * f(4)),
  };
}

function rgbToCmyk(r: number, g: number, b: number) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const k = 1 - Math.max(rn, gn, bn);
  if (k >= 1) return { c: 0, m: 0, y: 0, k: 100 };
  const c = Math.round(((1 - rn - k) / (1 - k)) * 100);
  const m = Math.round(((1 - gn - k) / (1 - k)) * 100);
  const y = Math.round(((1 - bn - k) / (1 - k)) * 100);
  return { c, m, y, k: Math.round(k * 100) };
}

function rgbToLab(r: number, g: number, b: number) {
  const lin = (v: number) => {
    const s = v / 255;
    return s > 0.04045 ? Math.pow((s + 0.055) / 1.055, 2.4) : s / 12.92;
  };
  const rl = lin(r);
  const gl = lin(g);
  const bl = lin(b);

  const x = (rl * 0.4124 + gl * 0.3576 + bl * 0.1805) / 0.95047;
  const y = (rl * 0.2126 + gl * 0.7152 + bl * 0.0722) / 1.0;
  const z = (rl * 0.0193 + gl * 0.1192 + bl * 0.9505) / 1.08883;

  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const fx = f(x);
  const fy = f(y);
  const fz = f(z);

  return {
    l: Math.round(116 * fy - 16),
    a: Math.round(500 * (fx - fy)),
    b: Math.round(200 * (fy - fz)),
  };
}

function findNearestPantone(r: number, g: number, b: number): string {
  let best = PANTONE_PALETTE[0].name;
  let minDist = Infinity;
  for (const p of PANTONE_PALETTE) {
    const d = Math.pow(r - p.rgb[0], 2) + Math.pow(g - p.rgb[1], 2) + Math.pow(b - p.rgb[2], 2);
    if (d < minDist) {
      minDist = d;
      best = p.name;
    }
  }
  return best;
}

function rgbToNcs(r: number, g: number, b: number): string {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const sBlackness = Math.round((1 - max) * 100);
  const d = max - min;
  const cChroma = Math.round(d * 100);

  let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  let huePart = 'N';
  if (cChroma > 5) {
    if (h >= 0 && h < 60) {
      const p = Math.round((h / 60) * 100);
      huePart = p === 0 ? 'R' : `Y${100 - p}R`;
    } else if (h >= 60 && h < 120) {
      const p = Math.round(((h - 60) / 60) * 100);
      huePart = p === 0 ? 'Y' : `Y${p}G`;
    } else if (h >= 120 && h < 240) {
      const p = Math.round(((h - 120) / 120) * 100);
      huePart = p === 0 ? 'G' : `B${p}G`;
    } else {
      const p = Math.round(((h - 240) / 120) * 100);
      huePart = p === 0 ? 'B' : `R${p}B`;
    }
  }

  const sPad = String(Math.min(99, Math.max(0, Math.round(sBlackness / 10) * 10))).padStart(2, '0');
  const cPad = String(Math.min(99, Math.max(0, Math.round(cChroma / 10) * 10))).padStart(2, '0');
  return `S ${sPad}${cPad}-${huePart}`;
}

function relativeLuminance(r: number, g: number, b: number) {
  const lin = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrastRatio(l1: number, l2: number) {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export default function ColorConverterPage() {
  const tUI = useTranslations('ToolUI.colorConverter');

  const [rgbObj, setRgbObj] = useState({ r: 59, g: 130, b: 246 });
  const [hexInput, setHexInput] = useState('#3b82f6');
  const [rgbInput, setRgbInput] = useState('rgb(59, 130, 246)');
  const [hslInput, setHslInput] = useState('hsl(217, 91%, 60%)');
  const [copiedField, setCopiedField] = useState('');
  const [error, setError] = useState('');
  const [extractedPalette, setExtractedPalette] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleHexChange = (value: string) => {
    setHexInput(value);
    setError('');
    let cleanHex = value.replace('#', '').trim();
    if (cleanHex.length === 3) {
      cleanHex = cleanHex
        .split('')
        .map((c) => c + c)
        .join('');
    }
    if (cleanHex.length === 6 && /^[0-9a-fA-F]{6}$/.test(cleanHex)) {
      const r = parseInt(cleanHex.substring(0, 2), 16);
      const g = parseInt(cleanHex.substring(2, 4), 16);
      const b = parseInt(cleanHex.substring(4, 6), 16);
      setRgbObj({ r, g, b });
      setRgbInput(`rgb(${r}, ${g}, ${b})`);
      const hsl = rgbToHslObj(r, g, b);
      setHslInput(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`);
    } else if (value.trim() !== '') {
      setError(tUI('errorInvalidHex'));
    }
  };

  const handleRgbChange = (value: string) => {
    setRgbInput(value);
    setError('');
    const match = value.match(/\d+/g);
    if (match && match.length >= 3) {
      const r = clamp255(parseInt(match[0], 10));
      const g = clamp255(parseInt(match[1], 10));
      const b = clamp255(parseInt(match[2], 10));
      setRgbObj({ r, g, b });
      setHexInput(rgbToHex(r, g, b));
      const hsl = rgbToHslObj(r, g, b);
      setHslInput(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`);
    } else if (value.trim() !== '') {
      setError(tUI('errorInvalidRgb'));
    }
  };

  const handleHslChange = (value: string) => {
    setHslInput(value);
    setError('');
    const match = value.match(/\d+/g);
    if (match && match.length >= 3) {
      const h = parseInt(match[0], 10) % 360;
      const s = Math.min(100, parseInt(match[1], 10));
      const l = Math.min(100, parseInt(match[2], 10));
      const conv = hslToRgbObj(h, s, l);
      setRgbObj(conv);
      setHexInput(rgbToHex(conv.r, conv.g, conv.b));
      setRgbInput(`rgb(${conv.r}, ${conv.g}, ${conv.b})`);
    } else if (value.trim() !== '') {
      setError(tUI('errorInvalidHsl'));
    }
  };

  const cmyk = useMemo(() => rgbToCmyk(rgbObj.r, rgbObj.g, rgbObj.b), [rgbObj]);
  const lab = useMemo(() => rgbToLab(rgbObj.r, rgbObj.g, rgbObj.b), [rgbObj]);
  const pantone = useMemo(() => findNearestPantone(rgbObj.r, rgbObj.g, rgbObj.b), [rgbObj]);
  const currentHex = rgbToHex(rgbObj.r, rgbObj.g, rgbObj.b);

  const contrast = useMemo(() => {
    const lum = relativeLuminance(rgbObj.r, rgbObj.g, rgbObj.b);
    return {
      white: contrastRatio(1, lum),
      black: contrastRatio(lum, 0),
    };
  }, [rgbObj]);

  const harmonies = useMemo(() => {
    const { h, s, l } = rgbToHslObj(rgbObj.r, rgbObj.g, rgbObj.b);
    const toHex = (hh: number, ss: number, ll: number) => {
      const c = hslToRgbObj((hh + 360) % 360, ss, ll);
      return rgbToHex(c.r, c.g, c.b);
    };
    return [
      { label: tUI('harmonyComp'), hex: toHex(h + 180, s, l) },
      { label: tUI('harmonyAnalog1'), hex: toHex(h - 30, s, l) },
      { label: tUI('harmonyAnalog2'), hex: toHex(h + 30, s, l) },
      { label: tUI('harmonyTriad1'), hex: toHex(h + 120, s, l) },
      { label: tUI('harmonyTriad2'), hex: toHex(h + 240, s, l) },
    ];
  }, [rgbObj, tUI]);

  const handleImageExtract = (file: File) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 40;
      canvas.height = 40;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, 40, 40);
      const data = ctx.getImageData(0, 0, 40, 40).data;
      const buckets = new Map<string, number>();
      for (let i = 0; i < data.length; i += 4) {
        const r = Math.round(data[i] / 24) * 24;
        const g = Math.round(data[i + 1] / 24) * 24;
        const b = Math.round(data[i + 2] / 24) * 24;
        const hx = rgbToHex(r, g, b);
        buckets.set(hx, (buckets.get(hx) || 0) + 1);
      }
      const top5 = Array.from(buckets.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([hx]) => hx);
      setExtractedPalette(top5);
      if (top5[0]) handleHexChange(top5[0]);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const handleCopy = (field: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 1800);
  };

  const cmykStr = `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;
  const labStr = `lab(${lab.l}% ${lab.a} ${lab.b})`;
  const ncsStr = rgbToNcs(rgbObj.r, rgbObj.g, rgbObj.b);

  return (
    <GlobalContainer maxWidth="2xl">
      <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
        <SectionHeading
          title={tUI('title')}
          subtitle={tUI('subtitle')}
          toolSlug="color-converter"
        />

        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '14px',
            padding: '24px',
            marginTop: 'var(--space-6)',
            marginBottom: '28px',
          }}
        >
          {/* Live Color Preview + Native Picker */}
          <div style={{ marginBottom: '22px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
              }}
            >
              <label style={{ color: 'var(--text-main)', fontSize: '0.875rem', fontWeight: 600 }}>
                {tUI('colorPreview')}
              </label>
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#60a5fa',
                  cursor: 'pointer',
                }}
              >
                <Palette size={14} />
                {tUI('pickColor')}
                <input
                  type="color"
                  value={currentHex}
                  onChange={(e) => handleHexChange(e.target.value)}
                  style={{
                    width: '28px',
                    height: '24px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                  }}
                />
              </label>
            </div>
            <div
              style={{
                width: '100%',
                height: '110px',
                borderRadius: '10px',
                backgroundColor: currentHex,
                border: '1px solid rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                padding: '12px 16px',
              }}
            >
              <span
                style={{
                  backgroundColor: 'rgba(0,0,0,0.55)',
                  color: '#ffffff',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontFamily: 'monospace',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                }}
              >
                {currentHex.toUpperCase()}
              </span>
              <span
                style={{
                  backgroundColor: 'rgba(0,0,0,0.55)',
                  color: '#ffffff',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                }}
              >
                {pantone}
              </span>
            </div>
          </div>

          {error && (
            <div style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: '16px' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Editable HEX / RGB / HSL */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '14px',
              marginBottom: '16px',
            }}
          >
            {[
              { id: 'hex', label: tUI('hexLabel'), val: hexInput, onChange: handleHexChange },
              { id: 'rgb', label: tUI('rgbLabel'), val: rgbInput, onChange: handleRgbChange },
              { id: 'hsl', label: tUI('hslLabel'), val: hslInput, onChange: handleHslChange },
            ].map((item) => (
              <div key={item.id}>
                <label
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
                  {item.label}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={item.val}
                    onChange={(e) => item.onChange(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      padding: '10px 70px 10px 12px',
                      fontSize: '0.9rem',
                      outline: 'none',
                      fontFamily: 'monospace',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(item.id, item.val)}
                    style={{
                      position: 'absolute',
                      right: '6px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor:
                        copiedField === item.id ? '#10b981' : 'rgba(59, 130, 246, 0.2)',
                      color: copiedField === item.id ? '#ffffff' : '#60a5fa',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '5px 10px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {copiedField === item.id ? <Check size={12} /> : <Copy size={12} />}
                    {copiedField === item.id ? tUI('copied') : tUI('copy')}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* CMYK, CIE LAB & Pantone Output Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '12px',
              marginBottom: '22px',
            }}
          >
            {[
              { id: 'cmyk', label: 'CMYK (Print)', val: cmykStr },
              { id: 'lab', label: 'CIE LAB', val: labStr },
              { id: 'ncs', label: 'NCS (Natural Colour)', val: ncsStr },
              { id: 'pantone', label: tUI('pantoneLabel'), val: pantone },
            ].map((card) => (
              <div
                key={card.id}
                style={{
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {card.label}
                  </div>
                  <code style={{ fontSize: '0.84rem', color: '#34d399', fontWeight: 700 }}>
                    {card.val}
                  </code>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(card.id, card.val)}
                  style={{
                    backgroundColor:
                      copiedField === card.id ? '#10b981' : 'rgba(59, 130, 246, 0.16)',
                    color: copiedField === card.id ? '#ffffff' : '#60a5fa',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '5px 9px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {copiedField === card.id ? tUI('copied') : tUI('copy')}
                </button>
              </div>
            ))}
          </div>

          {/* WCAG 2.1 Contrast & AI Harmonies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ marginBottom: '20px' }}>
            <div
              style={{
                backgroundColor: 'var(--bg-page)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '14px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  marginBottom: '10px',
                }}
              >
                <Eye size={14} style={{ color: '#60a5fa' }} />
                {tUI('wcagTitle')}
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <div
                  style={{
                    flex: 1,
                    backgroundColor: currentHex,
                    color: '#ffffff',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                  }}
                >
                  {tUI('onWhiteText')}: {contrast.white.toFixed(2)}:1 (
                  {contrast.white >= 7 ? 'AAA' : contrast.white >= 4.5 ? 'AA' : 'Fail'})
                </div>
                <div
                  style={{
                    flex: 1,
                    backgroundColor: currentHex,
                    color: '#000000',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                  }}
                >
                  {tUI('onBlackText')}: {contrast.black.toFixed(2)}:1 (
                  {contrast.black >= 7 ? 'AAA' : contrast.black >= 4.5 ? 'AA' : 'Fail'})
                </div>
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'var(--bg-page)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '14px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#a78bfa',
                  marginBottom: '10px',
                }}
              >
                <Sparkles size={14} />
                {tUI('aiHarmonyTitle')}
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {harmonies.map((h, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleHexChange(h.hex)}
                    title={h.label}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-card)',
                      color: 'var(--text-main)',
                      fontSize: '0.72rem',
                      fontFamily: 'monospace',
                      cursor: 'pointer',
                    }}
                  >
                    <span
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '3px',
                        backgroundColor: h.hex,
                        display: 'inline-block',
                      }}
                    />
                    {h.hex}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* AI Image Color Extractor */}
          <div
            style={{
              backgroundColor: 'rgba(139, 92, 246, 0.07)',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              borderRadius: '10px',
              padding: '14px 16px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  color: '#a78bfa',
                }}
              >
                <Sparkles size={15} />
                {tUI('imageExtractTitle')}
              </span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#8b5cf6',
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Upload size={14} />
                {tUI('uploadImageBtn')}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleImageExtract(f);
                }}
              />
            </div>

            {extractedPalette.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                {extractedPalette.map((hx, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleHexChange(hx)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-page)',
                      color: 'var(--text-main)',
                      fontFamily: 'monospace',
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                    }}
                  >
                    <span
                      style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '4px',
                        backgroundColor: hx,
                      }}
                    />
                    {hx}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <ToolSeoContent
          toolSlug="color-converter"
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
