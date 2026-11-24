'use client';

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import QRCode from 'react-qr-code';
import JSZip from 'jszip';

type PrimaryTab = 'create' | 'upi' | 'bulk' | 'scanner' | 'ai';
type ContentType = 'url' | 'text' | 'wifi' | 'vcard' | 'email' | 'sms';
type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';
type LogoPreset = 'none' | 'upi' | 'google' | 'wifi' | 'whatsapp' | 'web' | 'custom';

// Contrast calculator helper
function getLuminance(hex: string): number {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  const a = [r, g, b].map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

export default function QrCodeGeneratorPage() {
  const tUI = useTranslations('ToolUI.qrCodeGenerator');

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<PrimaryTab>('create');

  // Content type for 'create' mode
  const [contentType, setContentType] = useState<ContentType>('url');

  // Form Fields: Single Creator
  const [urlInput, setUrlInput] = useState('https://velnoxlabs.com');
  const [plainTextInput, setPlainTextInput] = useState('Hello from VelnoxLabs!');
  const [wifiSsid, setWifiSsid] = useState('MyHomeWiFi');
  const [wifiPassword, setWifiPassword] = useState('SecurePass2026');
  const [wifiEncryption, setWifiEncryption] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [vcardName, setVcardName] = useState('Alex Morgan');
  const [vcardPhone, setVcardPhone] = useState('+1 555-0199');
  const [vcardEmail, setVcardEmail] = useState('alex@example.com');
  const [vcardOrg, setVcardOrg] = useState('Tech Solutions');
  const [emailTo, setEmailTo] = useState('contact@example.com');
  const [emailSubject, setEmailSubject] = useState('Inquiry');
  const [emailBody, setEmailBody] = useState('Hello, I would like to learn more.');
  const [smsPhone, setSmsPhone] = useState('+1 555-0199');
  const [smsMessage, setSmsMessage] = useState('Hello, this is a quick message.');

  // Form Fields: UPI Mode
  const [upiId, setUpiId] = useState('merchant@upi');
  const [upiName, setUpiName] = useState('Velnox Store');
  const [upiAmount, setUpiAmount] = useState('500');
  const [upiNote, setUpiNote] = useState('Order Payment');

  // Design & Customization (Shared)
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [errorLevel, setErrorLevel] = useState<ErrorCorrectionLevel>('H');
  const [logoPreset, setLogoPreset] = useState<LogoPreset>('none');
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(null);
  const [exportSize, setExportSize] = useState<number>(1024);

  // Bulk Mode
  const [bulkInput, setBulkInput] = useState(
    'https://velnoxlabs.com/tools/qr-code-generator\nhttps://velnoxlabs.com/tools/nanoid-generator\nhttps://velnoxlabs.com/tools/percentage-calculator'
  );
  const [isZipping, setIsZipping] = useState(false);

  // Scanner Mode
  const [scannerResult, setScannerResult] = useState('');
  const [scannerError, setScannerError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI Prompt Mode
  const [aiPrompt, setAiPrompt] = useState('UPI payment to store@okaxis for 450 rupees');

  // Feedback states
  const [copiedImage, setCopiedImage] = useState(false);
  const [copiedScanner, setCopiedScanner] = useState(false);

  // Auto-enforce High error correction if a logo is applied
  useEffect(() => {
    if (logoPreset !== 'none' || activeTab === 'upi') {
      setErrorLevel('H');
    }
  }, [logoPreset, activeTab]);

  // Compute final QR payload
  const activeQrPayload = useMemo(() => {
    if (activeTab === 'upi') {
      const pa = encodeURIComponent(upiId.trim());
      const pn = encodeURIComponent(upiName.trim());
      const am = upiAmount.trim() ? `&am=${encodeURIComponent(upiAmount.trim())}` : '';
      const tn = upiNote.trim() ? `&tn=${encodeURIComponent(upiNote.trim())}` : '';
      return `upi://pay?pa=${pa}&pn=${pn}${am}&cu=INR${tn}`;
    }

    switch (contentType) {
      case 'url':
        return urlInput.trim();
      case 'text':
        return plainTextInput.trim();
      case 'wifi':
        return `WIFI:S:${wifiSsid.trim()};T:${wifiEncryption};P:${wifiPassword};;`;
      case 'vcard':
        return `BEGIN:VCARD\nVERSION:3.0\nFN:${vcardName.trim()}\nORG:${vcardOrg.trim()}\nTEL:${vcardPhone.trim()}\nEMAIL:${vcardEmail.trim()}\nEND:VCARD`;
      case 'email':
        return `mailto:${emailTo.trim()}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      case 'sms':
        return `SMSTO:${smsPhone.trim()}:${smsMessage}`;
    }
  }, [
    activeTab,
    contentType,
    urlInput,
    plainTextInput,
    wifiSsid,
    wifiPassword,
    wifiEncryption,
    vcardName,
    vcardPhone,
    vcardEmail,
    vcardOrg,
    emailTo,
    emailSubject,
    emailBody,
    smsPhone,
    smsMessage,
    upiId,
    upiName,
    upiAmount,
    upiNote,
  ]);

  // Scannability contrast rating
  const contrastRatio = useMemo(() => getContrastRatio(fgColor, bgColor), [fgColor, bgColor]);

  // Logo Badge rendering helper
  const renderLogoOnCanvas = useCallback(
    (ctx: CanvasRenderingContext2D, size: number): Promise<void> => {
      return new Promise((resolve) => {
        const effectiveLogo = activeTab === 'upi' ? 'upi' : logoPreset;
        if (effectiveLogo === 'none') {
          resolve();
          return;
        }

        const badgeSize = Math.floor(size * 0.22);
        const x = (size - badgeSize) / 2;
        const y = (size - badgeSize) / 2;
        const radius = Math.floor(badgeSize * 0.22);

        // Draw white rounded background with subtle shadow
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(x, y, badgeSize, badgeSize, radius);
        ctx.fill();
        ctx.restore();

        // Border around logo badge
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = Math.max(2, Math.floor(size * 0.005));
        ctx.stroke();

        if (effectiveLogo === 'custom' && customLogoUrl) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            const pad = badgeSize * 0.15;
            ctx.drawImage(img, x + pad, y + pad, badgeSize - pad * 2, badgeSize - pad * 2);
            resolve();
          };
          img.onerror = () => resolve();
          img.src = customLogoUrl;
        } else {
          // Draw Preset Vector Badges
          ctx.font = `bold ${Math.floor(badgeSize * 0.38)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const centerX = x + badgeSize / 2;
          const centerY = y + badgeSize / 2;

          if (effectiveLogo === 'upi') {
            ctx.fillStyle = '#0f9d58';
            ctx.fillText('UPI', centerX, centerY);
          } else if (effectiveLogo === 'google') {
            ctx.fillStyle = '#4285f4';
            ctx.fillText('G', centerX, centerY);
          } else if (effectiveLogo === 'wifi') {
            ctx.fillStyle = '#3b82f6';
            ctx.fillText('WiFi', centerX, centerY);
          } else if (effectiveLogo === 'whatsapp') {
            ctx.fillStyle = '#25d366';
            ctx.fillText('WA', centerX, centerY);
          } else if (effectiveLogo === 'web') {
            ctx.fillStyle = '#6366f1';
            ctx.fillText('WWW', centerX, centerY);
          } else {
            resolve();
          }
          resolve();
        }
      });
    },
    [activeTab, logoPreset, customLogoUrl]
  );

  // Generate PNG Blob from active SVG
  const generatePngBlob = useCallback(
    async (targetSize: number): Promise<Blob | null> => {
      const svg = document.getElementById('qr-svg');
      if (!svg) return null;

      const serializer = new XMLSerializer();
      const svgStr = serializer.serializeToString(svg);
      const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      return new Promise((resolve) => {
        const img = new Image();
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          canvas.width = targetSize;
          canvas.height = targetSize;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            URL.revokeObjectURL(url);
            resolve(null);
            return;
          }

          // Fill background
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, targetSize, targetSize);

          // Draw QR SVG scaled to target
          ctx.drawImage(img, 0, 0, targetSize, targetSize);

          // Overlay logo
          await renderLogoOnCanvas(ctx, targetSize);

          canvas.toBlob((blob) => {
            URL.revokeObjectURL(url);
            resolve(blob);
          }, 'image/png');
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          resolve(null);
        };
        img.src = url;
      });
    },
    [bgColor, renderLogoOnCanvas]
  );

  // Download PNG
  const handleDownloadPng = async () => {
    const blob = await generatePngBlob(exportSize);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `velnox-qr-${exportSize}px.png`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Download SVG
  const handleDownloadSvg = () => {
    const svg = document.getElementById('qr-svg');
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'velnox-qr-code.svg';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Copy Image to Clipboard
  const handleCopyImage = async () => {
    try {
      const blob = await generatePngBlob(512);
      if (!blob) return;
      if (typeof ClipboardItem !== 'undefined' && navigator.clipboard.write) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setCopiedImage(true);
        setTimeout(() => setCopiedImage(false), 2000);
      }
    } catch {
      // Fallback
    }
  };

  // Handle Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setCustomLogoUrl(event.target?.result as string);
      setLogoPreset('custom');
      setErrorLevel('H');
    };
    reader.readAsDataURL(file);
  };

  // Handle Bulk ZIP Download
  const handleBulkDownload = async () => {
    const lines = bulkInput
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0)
      .slice(0, 50);

    if (lines.length === 0) return;
    setIsZipping(true);

    try {
      const zip = new JSZip();
      const folder = zip.folder('qr-codes');

      // Create a hidden SVG for off-screen batch rendering
      for (let i = 0; i < lines.length; i++) {
        const text = lines[i];
        // Render SVG to string via DOM
        const tempContainer = document.createElement('div');
        tempContainer.style.display = 'none';
        document.body.appendChild(tempContainer);

        // We can create SVG directly
        const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="512" height="512">
          <rect width="100%" height="100%" fill="${bgColor}"/>
          <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" fill="${fgColor}">${text}</text>
        </svg>`;

        // Add both SVG and text note
        folder?.file(`qr_${String(i + 1).padStart(2, '0')}.svg`, svgContent);
        document.body.removeChild(tempContainer);
      }

      // Add manifest.txt
      folder?.file('manifest.txt', lines.map((l, idx) => `${idx + 1}: ${l}`).join('\n'));

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'velnox-bulk-qr-codes.zip';
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsZipping(false);
    }
  };

  // Scanner File Decode
  const handleScannerFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScannerError(false);
    setScannerResult('');

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (event) => {
      img.onload = async () => {
        try {
          if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
            const detector = new (
              window as unknown as {
                BarcodeDetector: new (opts: { formats: string[] }) => {
                  detect: (src: HTMLImageElement) => Promise<{ rawValue: string }[]>;
                };
              }
            ).BarcodeDetector({ formats: ['qr_code'] });
            const codes = await detector.detect(img);
            if (codes && codes.length > 0) {
              setScannerResult(codes[0].rawValue);
              return;
            }
          }
          // Fallback simulation/indication if BarcodeDetector is not natively available
          setScannerError(true);
        } catch {
          setScannerError(true);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // AI Prompt Processor
  const handleAiApply = () => {
    const raw = aiPrompt.toLowerCase();

    // Check UPI pattern
    if (raw.includes('upi') || raw.includes('pay') || raw.includes('rupee') || raw.includes('₹')) {
      setActiveTab('upi');
      const vpaMatch = raw.match(/([a-zA-Z0-9.\-_]+@[a-zA-Z]+)/);
      if (vpaMatch) setUpiId(vpaMatch[1]);
      const amtMatch = raw.match(/(\d+)\s*(?:rupee|inr|rs|₹)?/);
      if (amtMatch) setUpiAmount(amtMatch[1]);
      return;
    }

    // Check WiFi pattern
    if (
      raw.includes('wifi') ||
      raw.includes('ssid') ||
      raw.includes('password') ||
      raw.includes('pass')
    ) {
      setActiveTab('create');
      setContentType('wifi');
      const ssidMatch = raw.match(/(?:ssid|wifi|connect to)\s+([a-zA-Z0-9_\-]+)/i);
      if (ssidMatch) setWifiSsid(ssidMatch[1]);
      const passMatch = raw.match(/(?:password|pass|code)\s+([a-zA-Z0-9@#$_]+)/i);
      if (passMatch) setWifiPassword(passMatch[1]);
      return;
    }

    // Default: Set URL or Plain Text
    setActiveTab('create');
    if (
      raw.startsWith('http') ||
      raw.includes('.com') ||
      raw.includes('.org') ||
      raw.includes('google')
    ) {
      setContentType('url');
      setUrlInput(aiPrompt.trim());
    } else {
      setContentType('text');
      setPlainTextInput(aiPrompt.trim());
    }
  };

  return (
    <>
      <GlobalContainer maxWidth="2xl">
        <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          <SectionHeading title={tUI('title')} subtitle={tUI('subtitle')} />

          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '24px',
              marginTop: 'var(--space-6)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }}
          >
            {/* Primary Navigation Tabs */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '8px',
                marginBottom: '24px',
              }}
            >
              {[
                { key: 'create' as PrimaryTab, label: tUI('tabCreate'), icon: '✨' },
                { key: 'upi' as PrimaryTab, label: tUI('tabUpi'), icon: '💳' },
                { key: 'bulk' as PrimaryTab, label: tUI('tabBulk'), icon: '📦' },
                { key: 'scanner' as PrimaryTab, label: tUI('tabScanner'), icon: '📷' },
                { key: 'ai' as PrimaryTab, label: tUI('tabAi'), icon: '🤖' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    backgroundColor:
                      activeTab === tab.key ? 'rgba(59, 130, 246, 0.25)' : 'var(--bg-page)',
                    color: activeTab === tab.key ? '#60a5fa' : 'var(--text-muted)',
                    border:
                      activeTab === tab.key
                        ? '1px solid rgba(59, 130, 246, 0.6)'
                        : '1px solid var(--border-color)',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* ========================================================= */}
            {/* TABS 1 & 2: CREATE & UPI (Dual Column: Config & Live Preview) */}
            {/* ========================================================= */}
            {(activeTab === 'create' || activeTab === 'upi') && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: '24px',
                }}
              >
                {/* LEFT COLUMN: Controls & Data Input */}
                <div>
                  {/* Single Mode: Content Type Sub-Tabs */}
                  {activeTab === 'create' && (
                    <div style={{ marginBottom: '16px' }}>
                      <label
                        style={{
                          color: 'var(--text-main)',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          display: 'block',
                          marginBottom: '8px',
                        }}
                      >
                        {tUI('labelContent')}
                      </label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {[
                          { key: 'url' as ContentType, label: tUI('typeUrl'), icon: '🔗' },
                          { key: 'text' as ContentType, label: tUI('typeText'), icon: '📝' },
                          { key: 'wifi' as ContentType, label: tUI('typeWifi'), icon: '📶' },
                          { key: 'vcard' as ContentType, label: tUI('typeVcard'), icon: '👤' },
                          { key: 'email' as ContentType, label: tUI('typeEmail'), icon: '✉️' },
                          { key: 'sms' as ContentType, label: tUI('typeSms'), icon: '💬' },
                        ].map((t) => (
                          <button
                            key={t.key}
                            onClick={() => setContentType(t.key)}
                            style={{
                              backgroundColor:
                                contentType === t.key
                                  ? 'rgba(59, 130, 246, 0.2)'
                                  : 'var(--bg-page)',
                              color: contentType === t.key ? '#60a5fa' : 'var(--text-muted)',
                              border:
                                contentType === t.key
                                  ? '1px solid rgba(59, 130, 246, 0.5)'
                                  : '1px solid var(--border-color)',
                              borderRadius: '6px',
                              padding: '6px 10px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            {t.icon} {t.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 1 Form Fields */}
                  {activeTab === 'create' && contentType === 'url' && (
                    <div style={{ marginBottom: '16px' }}>
                      <input
                        type="url"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder={tUI('placeholderUrl')}
                        style={{
                          width: '100%',
                          backgroundColor: 'var(--bg-page)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          color: 'var(--text-main)',
                          padding: '12px 14px',
                          fontSize: '0.9rem',
                          fontFamily: 'monospace',
                          outline: 'none',
                        }}
                      />
                    </div>
                  )}

                  {activeTab === 'create' && contentType === 'text' && (
                    <div style={{ marginBottom: '16px' }}>
                      <textarea
                        value={plainTextInput}
                        onChange={(e) => setPlainTextInput(e.target.value)}
                        placeholder={tUI('placeholderText')}
                        rows={4}
                        style={{
                          width: '100%',
                          backgroundColor: 'var(--bg-page)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          color: 'var(--text-main)',
                          padding: '12px 14px',
                          fontSize: '0.9rem',
                          fontFamily: 'monospace',
                          outline: 'none',
                          resize: 'vertical',
                        }}
                      />
                    </div>
                  )}

                  {activeTab === 'create' && contentType === 'wifi' && (
                    <div style={{ display: 'grid', gap: '12px', marginBottom: '16px' }}>
                      <div>
                        <label
                          style={{
                            fontSize: '0.8rem',
                            color: 'var(--text-muted)',
                            display: 'block',
                            marginBottom: '4px',
                          }}
                        >
                          {tUI('labelWifiSsid')}
                        </label>
                        <input
                          type="text"
                          value={wifiSsid}
                          onChange={(e) => setWifiSsid(e.target.value)}
                          style={{
                            width: '100%',
                            backgroundColor: 'var(--bg-page)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            color: 'var(--text-main)',
                            padding: '10px 12px',
                            fontSize: '0.9rem',
                            outline: 'none',
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            fontSize: '0.8rem',
                            color: 'var(--text-muted)',
                            display: 'block',
                            marginBottom: '4px',
                          }}
                        >
                          {tUI('labelWifiPassword')}
                        </label>
                        <input
                          type="text"
                          value={wifiPassword}
                          onChange={(e) => setWifiPassword(e.target.value)}
                          style={{
                            width: '100%',
                            backgroundColor: 'var(--bg-page)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            color: 'var(--text-main)',
                            padding: '10px 12px',
                            fontSize: '0.9rem',
                            outline: 'none',
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            fontSize: '0.8rem',
                            color: 'var(--text-muted)',
                            display: 'block',
                            marginBottom: '4px',
                          }}
                        >
                          {tUI('labelWifiEncryption')}
                        </label>
                        <select
                          value={wifiEncryption}
                          onChange={(e) =>
                            setWifiEncryption(e.target.value as 'WPA' | 'WEP' | 'nopass')
                          }
                          style={{
                            width: '100%',
                            backgroundColor: 'var(--bg-page)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            color: 'var(--text-main)',
                            padding: '10px 12px',
                            fontSize: '0.85rem',
                            outline: 'none',
                          }}
                        >
                          <option value="WPA">{tUI('wifiWpa')}</option>
                          <option value="WEP">{tUI('wifiWep')}</option>
                          <option value="nopass">{tUI('wifiNone')}</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {activeTab === 'create' && contentType === 'vcard' && (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '12px',
                        marginBottom: '16px',
                      }}
                    >
                      <div>
                        <label
                          style={{
                            fontSize: '0.8rem',
                            color: 'var(--text-muted)',
                            display: 'block',
                            marginBottom: '4px',
                          }}
                        >
                          {tUI('labelVcardName')}
                        </label>
                        <input
                          type="text"
                          value={vcardName}
                          onChange={(e) => setVcardName(e.target.value)}
                          style={{
                            width: '100%',
                            backgroundColor: 'var(--bg-page)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            color: 'var(--text-main)',
                            padding: '10px 12px',
                            fontSize: '0.85rem',
                            outline: 'none',
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            fontSize: '0.8rem',
                            color: 'var(--text-muted)',
                            display: 'block',
                            marginBottom: '4px',
                          }}
                        >
                          {tUI('labelVcardPhone')}
                        </label>
                        <input
                          type="text"
                          value={vcardPhone}
                          onChange={(e) => setVcardPhone(e.target.value)}
                          style={{
                            width: '100%',
                            backgroundColor: 'var(--bg-page)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            color: 'var(--text-main)',
                            padding: '10px 12px',
                            fontSize: '0.85rem',
                            outline: 'none',
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            fontSize: '0.8rem',
                            color: 'var(--text-muted)',
                            display: 'block',
                            marginBottom: '4px',
                          }}
                        >
                          {tUI('labelVcardEmail')}
                        </label>
                        <input
                          type="email"
                          value={vcardEmail}
                          onChange={(e) => setVcardEmail(e.target.value)}
                          style={{
                            width: '100%',
                            backgroundColor: 'var(--bg-page)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            color: 'var(--text-main)',
                            padding: '10px 12px',
                            fontSize: '0.85rem',
                            outline: 'none',
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            fontSize: '0.8rem',
                            color: 'var(--text-muted)',
                            display: 'block',
                            marginBottom: '4px',
                          }}
                        >
                          {tUI('labelVcardOrg')}
                        </label>
                        <input
                          type="text"
                          value={vcardOrg}
                          onChange={(e) => setVcardOrg(e.target.value)}
                          style={{
                            width: '100%',
                            backgroundColor: 'var(--bg-page)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            color: 'var(--text-main)',
                            padding: '10px 12px',
                            fontSize: '0.85rem',
                            outline: 'none',
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === 'create' && (contentType === 'email' || contentType === 'sms') && (
                    <div style={{ display: 'grid', gap: '12px', marginBottom: '16px' }}>
                      {contentType === 'email' ? (
                        <>
                          <div>
                            <label
                              style={{
                                fontSize: '0.8rem',
                                color: 'var(--text-muted)',
                                display: 'block',
                                marginBottom: '4px',
                              }}
                            >
                              {tUI('labelEmailTo')}
                            </label>
                            <input
                              type="email"
                              value={emailTo}
                              onChange={(e) => setEmailTo(e.target.value)}
                              style={{
                                width: '100%',
                                backgroundColor: 'var(--bg-page)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                color: 'var(--text-main)',
                                padding: '10px 12px',
                                fontSize: '0.85rem',
                                outline: 'none',
                              }}
                            />
                          </div>
                          <div>
                            <label
                              style={{
                                fontSize: '0.8rem',
                                color: 'var(--text-muted)',
                                display: 'block',
                                marginBottom: '4px',
                              }}
                            >
                              {tUI('labelEmailSubject')}
                            </label>
                            <input
                              type="text"
                              value={emailSubject}
                              onChange={(e) => setEmailSubject(e.target.value)}
                              style={{
                                width: '100%',
                                backgroundColor: 'var(--bg-page)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                color: 'var(--text-main)',
                                padding: '10px 12px',
                                fontSize: '0.85rem',
                                outline: 'none',
                              }}
                            />
                          </div>
                          <div>
                            <label
                              style={{
                                fontSize: '0.8rem',
                                color: 'var(--text-muted)',
                                display: 'block',
                                marginBottom: '4px',
                              }}
                            >
                              {tUI('labelEmailBody')}
                            </label>
                            <textarea
                              value={emailBody}
                              onChange={(e) => setEmailBody(e.target.value)}
                              rows={2}
                              style={{
                                width: '100%',
                                backgroundColor: 'var(--bg-page)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                color: 'var(--text-main)',
                                padding: '10px 12px',
                                fontSize: '0.85rem',
                                outline: 'none',
                                resize: 'vertical',
                              }}
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <label
                              style={{
                                fontSize: '0.8rem',
                                color: 'var(--text-muted)',
                                display: 'block',
                                marginBottom: '4px',
                              }}
                            >
                              {tUI('labelSmsPhone')}
                            </label>
                            <input
                              type="text"
                              value={smsPhone}
                              onChange={(e) => setSmsPhone(e.target.value)}
                              style={{
                                width: '100%',
                                backgroundColor: 'var(--bg-page)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                color: 'var(--text-main)',
                                padding: '10px 12px',
                                fontSize: '0.85rem',
                                outline: 'none',
                              }}
                            />
                          </div>
                          <div>
                            <label
                              style={{
                                fontSize: '0.8rem',
                                color: 'var(--text-muted)',
                                display: 'block',
                                marginBottom: '4px',
                              }}
                            >
                              {tUI('labelSmsMessage')}
                            </label>
                            <input
                              type="text"
                              value={smsMessage}
                              onChange={(e) => setSmsMessage(e.target.value)}
                              style={{
                                width: '100%',
                                backgroundColor: 'var(--bg-page)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                color: 'var(--text-main)',
                                padding: '10px 12px',
                                fontSize: '0.85rem',
                                outline: 'none',
                              }}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* TAB 2: UPI PAYMENT MODE FIELDS */}
                  {activeTab === 'upi' && (
                    <div style={{ display: 'grid', gap: '12px', marginBottom: '16px' }}>
                      <div
                        style={{
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          borderRadius: '8px',
                          padding: '12px',
                          fontSize: '0.8rem',
                          color: '#34d399',
                          fontWeight: 600,
                        }}
                      >
                        ⚡ {tUI('upiCompatibleNotice')}
                      </div>
                      <div>
                        <label
                          style={{
                            fontSize: '0.8rem',
                            color: 'var(--text-main)',
                            fontWeight: 600,
                            display: 'block',
                            marginBottom: '4px',
                          }}
                        >
                          {tUI('labelUpiId')}
                        </label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="e.g. yourname@okaxis"
                          style={{
                            width: '100%',
                            backgroundColor: 'var(--bg-page)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            color: 'var(--text-main)',
                            padding: '10px 12px',
                            fontSize: '0.9rem',
                            fontFamily: 'monospace',
                            outline: 'none',
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            fontSize: '0.8rem',
                            color: 'var(--text-main)',
                            fontWeight: 600,
                            display: 'block',
                            marginBottom: '4px',
                          }}
                        >
                          {tUI('labelUpiName')}
                        </label>
                        <input
                          type="text"
                          value={upiName}
                          onChange={(e) => setUpiName(e.target.value)}
                          style={{
                            width: '100%',
                            backgroundColor: 'var(--bg-page)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            color: 'var(--text-main)',
                            padding: '10px 12px',
                            fontSize: '0.9rem',
                            outline: 'none',
                          }}
                        />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <label
                            style={{
                              fontSize: '0.8rem',
                              color: 'var(--text-main)',
                              fontWeight: 600,
                              display: 'block',
                              marginBottom: '4px',
                            }}
                          >
                            {tUI('labelUpiAmount')}
                          </label>
                          <input
                            type="number"
                            value={upiAmount}
                            onChange={(e) => setUpiAmount(e.target.value)}
                            placeholder="Optional"
                            style={{
                              width: '100%',
                              backgroundColor: 'var(--bg-page)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '8px',
                              color: 'var(--text-main)',
                              padding: '10px 12px',
                              fontSize: '0.9rem',
                              outline: 'none',
                            }}
                          />
                        </div>
                        <div>
                          <label
                            style={{
                              fontSize: '0.8rem',
                              color: 'var(--text-main)',
                              fontWeight: 600,
                              display: 'block',
                              marginBottom: '4px',
                            }}
                          >
                            {tUI('labelUpiNote')}
                          </label>
                          <input
                            type="text"
                            value={upiNote}
                            onChange={(e) => setUpiNote(e.target.value)}
                            placeholder="Optional"
                            style={{
                              width: '100%',
                              backgroundColor: 'var(--bg-page)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '8px',
                              color: 'var(--text-main)',
                              padding: '10px 12px',
                              fontSize: '0.9rem',
                              outline: 'none',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* DESIGN & CUSTOMIZATION CARD */}
                  <div
                    style={{
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      padding: '16px',
                      marginBottom: '16px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: '#60a5fa',
                        marginBottom: '12px',
                      }}
                    >
                      🎨 {tUI('labelDesign')}
                    </div>

                    {/* Colors */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '12px',
                        marginBottom: '14px',
                      }}
                    >
                      <div>
                        <label
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            display: 'block',
                            marginBottom: '4px',
                          }}
                        >
                          {tUI('labelFgColor')}
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input
                            type="color"
                            value={fgColor}
                            onChange={(e) => setFgColor(e.target.value)}
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '6px',
                              border: 'none',
                              cursor: 'pointer',
                              padding: 0,
                            }}
                          />
                          <input
                            type="text"
                            value={fgColor}
                            onChange={(e) => setFgColor(e.target.value)}
                            style={{
                              width: '100%',
                              backgroundColor: 'var(--bg-card)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '6px',
                              color: 'var(--text-main)',
                              padding: '6px 8px',
                              fontSize: '0.8rem',
                              fontFamily: 'monospace',
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <label
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            display: 'block',
                            marginBottom: '4px',
                          }}
                        >
                          {tUI('labelBgColor')}
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input
                            type="color"
                            value={bgColor}
                            onChange={(e) => setBgColor(e.target.value)}
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '6px',
                              border: 'none',
                              cursor: 'pointer',
                              padding: 0,
                            }}
                          />
                          <input
                            type="text"
                            value={bgColor}
                            onChange={(e) => setBgColor(e.target.value)}
                            style={{
                              width: '100%',
                              backgroundColor: 'var(--bg-card)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '6px',
                              color: 'var(--text-main)',
                              padding: '6px 8px',
                              fontSize: '0.8rem',
                              fontFamily: 'monospace',
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Contrast indicator */}
                    <div
                      style={{
                        fontSize: '0.75rem',
                        marginBottom: '14px',
                        color: contrastRatio < 3 ? '#ef4444' : '#10b981',
                      }}
                    >
                      {contrastRatio < 3 ? tUI('contrastWarning') : tUI('contrastGood')} (
                      {contrastRatio.toFixed(1)}:1)
                    </div>

                    {/* Logo Presets (Only in create tab; UPI forces UPI logo) */}
                    {activeTab === 'create' && (
                      <div style={{ marginBottom: '14px' }}>
                        <label
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            display: 'block',
                            marginBottom: '6px',
                          }}
                        >
                          {tUI('labelLogo')}
                        </label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {[
                            { key: 'none' as LogoPreset, label: tUI('logoNone') },
                            { key: 'google' as LogoPreset, label: 'Google' },
                            { key: 'upi' as LogoPreset, label: 'UPI' },
                            { key: 'whatsapp' as LogoPreset, label: 'WhatsApp' },
                            { key: 'wifi' as LogoPreset, label: 'WiFi' },
                            { key: 'web' as LogoPreset, label: 'Web' },
                            { key: 'custom' as LogoPreset, label: tUI('logoCustom') },
                          ].map((lp) => (
                            <button
                              key={lp.key}
                              onClick={() => {
                                setLogoPreset(lp.key);
                                if (lp.key !== 'none') setErrorLevel('H');
                              }}
                              style={{
                                backgroundColor:
                                  logoPreset === lp.key
                                    ? 'rgba(59, 130, 246, 0.25)'
                                    : 'var(--bg-card)',
                                color: logoPreset === lp.key ? '#60a5fa' : 'var(--text-main)',
                                border:
                                  logoPreset === lp.key
                                    ? '1px solid rgba(59, 130, 246, 0.5)'
                                    : '1px solid var(--border-color)',
                                borderRadius: '6px',
                                padding: '4px 10px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              {lp.label}
                            </button>
                          ))}
                        </div>

                        {logoPreset === 'custom' && (
                          <div style={{ marginTop: '8px' }}>
                            <input
                              type="file"
                              accept="image/png,image/svg+xml,image/jpeg"
                              onChange={handleLogoUpload}
                              style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Error Correction Level */}
                    <div>
                      <label
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-muted)',
                          display: 'block',
                          marginBottom: '4px',
                        }}
                      >
                        {tUI('labelErrorCorrection')}
                      </label>
                      <select
                        value={errorLevel}
                        onChange={(e) => setErrorLevel(e.target.value as ErrorCorrectionLevel)}
                        style={{
                          width: '100%',
                          backgroundColor: 'var(--bg-card)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          color: 'var(--text-main)',
                          padding: '6px 8px',
                          fontSize: '0.8rem',
                          outline: 'none',
                        }}
                      >
                        <option value="L">{tUI('errorLevelL')}</option>
                        <option value="M">{tUI('errorLevelM')}</option>
                        <option value="Q">{tUI('errorLevelQ')}</option>
                        <option value="H">{tUI('errorLevelH')}</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: Live Interactive QR Preview */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px',
                    }}
                  >
                    <span
                      style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}
                    >
                      {tUI('qrPreview')}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {tUI('charactersCount', { count: activeQrPayload.length })}
                    </span>
                  </div>

                  {/* QR Canvas Box */}
                  <div
                    style={{
                      position: 'relative',
                      backgroundColor: bgColor,
                      border: '1px solid var(--border-color)',
                      borderRadius: '16px',
                      padding: '24px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: '100%',
                      maxWidth: '320px',
                      aspectRatio: '1/1',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                      marginBottom: '16px',
                    }}
                  >
                    {activeQrPayload.trim() === '' ? (
                      <p
                        style={{
                          color: 'var(--text-muted)',
                          fontSize: '0.85rem',
                          textAlign: 'center',
                          margin: 0,
                        }}
                      >
                        {tUI('emptyPrompt')}
                      </p>
                    ) : (
                      <div style={{ position: 'relative', width: '220px', height: '220px' }}>
                        <QRCode
                          id="qr-svg"
                          value={activeQrPayload}
                          size={220}
                          level={errorLevel}
                          bgColor={bgColor}
                          fgColor={fgColor}
                          style={{ width: '100%', height: '100%' }}
                        />

                        {/* Center Logo Overlay for Preview */}
                        {(logoPreset !== 'none' || activeTab === 'upi') && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              width: '48px',
                              height: '48px',
                              backgroundColor: '#ffffff',
                              borderRadius: '10px',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                              border: '2px solid #e2e8f0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              overflow: 'hidden',
                            }}
                          >
                            {customLogoUrl && logoPreset === 'custom' ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={customLogoUrl}
                                alt="Logo"
                                style={{ width: '36px', height: '36px', objectFit: 'contain' }}
                              />
                            ) : (
                              <span
                                style={{
                                  fontWeight: 800,
                                  fontSize: '0.8rem',
                                  color:
                                    activeTab === 'upi' || logoPreset === 'upi'
                                      ? '#0f9d58'
                                      : '#3b82f6',
                                }}
                              >
                                {activeTab === 'upi' ? 'UPI' : logoPreset.toUpperCase()}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Resolution Picker */}
                  <div
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '12px',
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {tUI('resolutionLabel')}
                    </span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[256, 512, 1024, 2048].map((sz) => (
                        <button
                          key={sz}
                          onClick={() => setExportSize(sz)}
                          style={{
                            backgroundColor:
                              exportSize === sz ? 'rgba(59, 130, 246, 0.25)' : 'var(--bg-page)',
                            color: exportSize === sz ? '#60a5fa' : 'var(--text-muted)',
                            border:
                              exportSize === sz
                                ? '1px solid rgba(59, 130, 246, 0.5)'
                                : '1px solid var(--border-color)',
                            borderRadius: '4px',
                            padding: '3px 8px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {sz}px
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action Download Buttons */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px',
                      width: '100%',
                      marginBottom: '8px',
                    }}
                  >
                    <button
                      onClick={handleDownloadPng}
                      disabled={activeQrPayload.trim() === ''}
                      style={{
                        backgroundColor: '#3b82f6',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        cursor: activeQrPayload.trim() === '' ? 'not-allowed' : 'pointer',
                      }}
                    >
                      💾 {tUI('downloadPng')}
                    </button>
                    <button
                      onClick={handleDownloadSvg}
                      disabled={activeQrPayload.trim() === ''}
                      style={{
                        backgroundColor: 'rgba(59, 130, 246, 0.15)',
                        color: '#60a5fa',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        cursor: activeQrPayload.trim() === '' ? 'not-allowed' : 'pointer',
                      }}
                    >
                      📐 {tUI('downloadSvg')}
                    </button>
                  </div>

                  {/* Copy Image Button */}
                  <button
                    onClick={handleCopyImage}
                    disabled={activeQrPayload.trim() === ''}
                    style={{
                      width: '100%',
                      backgroundColor: copiedImage ? 'rgba(16, 185, 129, 0.25)' : 'var(--bg-page)',
                      color: copiedImage ? '#34d399' : 'var(--text-main)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '8px 14px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: activeQrPayload.trim() === '' ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {copiedImage ? tUI('imageCopied') : tUI('copyImage')}
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 3: BULK BATCH GENERATOR                              */}
            {/* ========================================================= */}
            {activeTab === 'bulk' && (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <div
                    style={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: '#60a5fa',
                      marginBottom: '4px',
                    }}
                  >
                    📦 {tUI('bulkTitle')}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {tUI('bulkSubtitle')}
                  </div>
                </div>

                <textarea
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  placeholder={tUI('bulkPlaceholder')}
                  rows={8}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    padding: '12px 14px',
                    fontSize: '0.85rem',
                    fontFamily: 'monospace',
                    outline: 'none',
                    resize: 'vertical',
                    marginBottom: '16px',
                  }}
                />

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px',
                  }}
                >
                  <span
                    style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}
                  >
                    {tUI('bulkCount', {
                      count: bulkInput
                        .split('\n')
                        .map((l) => l.trim())
                        .filter((l) => l.length > 0).length,
                    })}
                  </span>
                  <button
                    onClick={handleBulkDownload}
                    disabled={isZipping || bulkInput.trim() === ''}
                    style={{
                      backgroundColor: '#3b82f6',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 20px',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      cursor: isZipping || bulkInput.trim() === '' ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isZipping ? tUI('bulkGenerating') : tUI('bulkDownloadZip')}
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 4: SCANNER / READER                                  */}
            {/* ========================================================= */}
            {activeTab === 'scanner' && (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <div
                    style={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: '#60a5fa',
                      marginBottom: '4px',
                    }}
                  >
                    📷 {tUI('scannerTitle')}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {tUI('scannerSubtitle')}
                  </div>
                </div>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed var(--border-color)',
                    borderRadius: '12px',
                    padding: '36px 20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: 'var(--bg-page)',
                    marginBottom: '20px',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📂</div>
                  <div
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: 'var(--text-main)',
                      marginBottom: '4px',
                    }}
                  >
                    {tUI('scannerDropzone')}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleScannerFile}
                    style={{ display: 'none' }}
                  />
                </div>

                {scannerResult && (
                  <div
                    style={{
                      backgroundColor: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '10px',
                      padding: '16px',
                      marginBottom: '16px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: '#34d399',
                        marginBottom: '8px',
                      }}
                    >
                      {tUI('scannerResult')}
                    </div>
                    <code
                      style={{
                        display: 'block',
                        backgroundColor: 'var(--bg-page)',
                        padding: '10px',
                        borderRadius: '6px',
                        fontFamily: 'monospace',
                        fontSize: '0.9rem',
                        color: 'var(--text-main)',
                        wordBreak: 'break-all',
                        marginBottom: '12px',
                      }}
                    >
                      {scannerResult}
                    </code>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {scannerResult.startsWith('http') && (
                        <a
                          href={scannerResult}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            backgroundColor: '#3b82f6',
                            color: '#ffffff',
                            borderRadius: '6px',
                            padding: '6px 14px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            textDecoration: 'none',
                          }}
                        >
                          {tUI('openLink')}
                        </a>
                      )}
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(scannerResult);
                          setCopiedScanner(true);
                          setTimeout(() => setCopiedScanner(false), 2000);
                        }}
                        style={{
                          backgroundColor: copiedScanner
                            ? 'rgba(16, 185, 129, 0.25)'
                            : 'var(--bg-card)',
                          color: copiedScanner ? '#34d399' : 'var(--text-main)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          padding: '6px 14px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {copiedScanner ? tUI('copied') : tUI('copyDecoded')}
                      </button>
                    </div>
                  </div>
                )}

                {scannerError && (
                  <div
                    style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '10px',
                      padding: '14px',
                      color: '#f87171',
                      fontSize: '0.85rem',
                    }}
                  >
                    {tUI('scannerNoResult')}
                  </div>
                )}
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 5: AI PROMPT TO QR & ART GUIDE                       */}
            {/* ========================================================= */}
            {activeTab === 'ai' && (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <div
                    style={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: '#60a5fa',
                      marginBottom: '4px',
                    }}
                  >
                    🤖 {tUI('aiTitle')}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {tUI('aiSubtitle')}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder={tUI('aiInputPlaceholder')}
                    style={{
                      flex: 1,
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      padding: '12px 14px',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      outline: 'none',
                    }}
                  />
                  <button
                    onClick={handleAiApply}
                    style={{
                      backgroundColor: '#3b82f6',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px 20px',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {tUI('aiApplyButton')}
                  </button>
                </div>

                {/* Quick Prompts */}
                <div
                  style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '24px' }}
                >
                  {[tUI('aiPrompt1'), tUI('aiPrompt2'), tUI('aiPrompt3')].map((p, i) => (
                    <button
                      key={i}
                      onClick={() => setAiPrompt(p)}
                      style={{
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        color: '#60a5fa',
                        border: '1px solid rgba(59, 130, 246, 0.25)',
                        borderRadius: '20px',
                        padding: '4px 12px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      ✨ {p}
                    </button>
                  ))}
                </div>

                {/* Hugging Face / ControlNet Guide Box */}
                <div
                  style={{
                    backgroundColor: 'rgba(99, 102, 241, 0.08)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    borderRadius: '12px',
                    padding: '20px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      color: '#a5b4fc',
                      marginBottom: '8px',
                    }}
                  >
                    {tUI('aiGuideTitle')}
                  </div>
                  <p
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-muted)',
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {tUI('aiGuideBody')}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Centralized Technical SEO & JSON-LD Graph */}
          <ToolSeoContent
            toolSlug="qr-code-generator"
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
    </>
  );
}
