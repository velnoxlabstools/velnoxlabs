'use client';

import React, { useState, useRef } from 'react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';

export default function ImageResizerPage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [outputFormat, setOutputFormat] = useState('image/jpeg');
  const [quality, setQuality] = useState(0.9);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setOriginalWidth(img.width);
        setOriginalHeight(img.height);
        setWidth(img.width);
        setHeight(img.height);
        setImageSrc(event.target?.result as string);
        setProcessedImage(null);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (maintainAspect && originalWidth > 0) {
      const ratio = originalHeight / originalWidth;
      setHeight(Math.round(val * ratio));
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (maintainAspect && originalHeight > 0) {
      const ratio = originalWidth / originalHeight;
      setWidth(Math.round(val * ratio));
    }
  };

  const handleResize = () => {
    if (!imageSrc) return;
    setLoading(true);

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL(outputFormat, quality);
        setProcessedImage(dataUrl);
      }
      setLoading(false);
    };
    img.src = imageSrc;
  };

  const handleDownload = () => {
    if (!processedImage) return;
    const link = document.createElement('a');
    link.href = processedImage;
    const ext = outputFormat.split('/')[1];
    link.download = `resized-${fileName.replace(/\.[^/.]+$/, '')}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    setFeedbackSent(true);
    setFeedback('');
    setTimeout(() => setFeedbackSent(false), 3000);
  };

  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        'name': 'VelnoxLabs Image Resizer & Compressor',
        'operatingSystem': 'All',
        'applicationCategory': 'MultimediaApplication',
        'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
        'description': 'Resize, compress, and convert images instantly in your browser with hardware-accelerated HTML5 Canvas and zero data storage.'
      },
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'How to resize and compress images online?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'Upload your image, specify your target dimensions in pixels, maintain aspect ratio if required, and instantly download your optimized image.' }
          },
          {
            '@type': 'Question',
            'name': 'Are my images uploaded to a server?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'No! All processing occurs entirely inside your local browser memory using HTML5 Canvas, ensuring absolute privacy.' }
          }
        ]
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />

      <GlobalContainer maxWidth="2xl">
        <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          <SectionHeading
            title="Online Image Resizer & Compressor"
            subtitle="Resize, compress, and convert your images instantly in your browser with absolute client-side privacy."
          />

          {!imageSrc ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                marginTop: 'var(--space-6)',
                border: '2px dashed rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                padding: '60px 40px',
                textAlign: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.01)',
                cursor: 'pointer'
              }}
            >
              <p style={{ color: '#ffffff', fontSize: '1.1rem', marginBottom: '12px', fontWeight: 500 }}>
                Click to upload an image
              </p>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                PNG, JPG, WEBP supported
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </div>
          ) : (
            <div style={{ marginTop: 'var(--space-6)' }}>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                  <div>
                    <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Original Image:</label>
                    <img src={imageSrc} alt="Original" style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.3)' }} />
                    <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '8px' }}>{originalWidth} × {originalHeight} px</p>
                  </div>
                  <div>
                    <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Resized Image:</label>
                    {processedImage ? (
                      <img src={processedImage} alt="Resized" style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.3)' }} />
                    ) : (
                      <div style={{ width: '100%', height: '200px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                        Click "Resize Image" to process
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '24px' }}>
                  <div>
                    <label style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Width (px):</label>
                    <input
                      type="number"
                      value={width}
                      onChange={(e) => handleWidthChange(Number(e.target.value))}
                      style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '10px', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Height (px):</label>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => handleHeightChange(Number(e.target.value))}
                      style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '10px', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Format:</label>
                    <select
                      value={outputFormat}
                      onChange={(e) => setOutputFormat(e.target.value)}
                      style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '10px', fontSize: '0.9rem', outline: 'none' }}
                    >
                      <option value="image/jpeg">JPEG</option>
                      <option value="image/png">PNG</option>
                      <option value="image/webp">WEBP</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: '16px' }}>
                  <label style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Quality: {Math.round(quality * 100)}%</label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
                  <label style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={maintainAspect} onChange={(e) => setMaintainAspect(e.target.checked)} />
                    Maintain Aspect Ratio
                  </label>
                </div>

                {/* 👇 BUTTONS AB YAHAN HAIN (SEO KE UPAR) 👇 */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
                  <button
                    onClick={handleResize}
                    disabled={loading}
                    style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    {loading ? 'Processing...' : 'Resize Image'}
                  </button>
                  {processedImage && (
                    <button
                      onClick={handleDownload}
                      style={{ backgroundColor: '#059669', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Download
                    </button>
                  )}
                  <button
                    onClick={() => { setImageSrc(null); setProcessedImage(null); setFileName(''); }}
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px 24px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Upload New
                  </button>
                </div>
                {/* 👆 BUTTONS YAHAN KHATAM 👆 */}

                {/* Visible SEO Content (Ab buttons ke neeche hai) */}
                <div style={{ marginTop: '48px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '32px' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>What is a Image Resizer & Compressor?</h2>
                  <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: '24px' }}>
                    The Image Resizer lets you resize, compress, and convert images directly in your browser without uploading them anywhere. It supports PNG, JPG, and WEBP formats and uses HTML5 Canvas for hardware-accelerated processing.
                  </p>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px', marginTop: '24px' }}>How to Use This Tool</h3>
                  <ul style={{ color: '#94a3b8', lineHeight: 1.9, paddingLeft: '20px', marginBottom: '24px' }}>
                    <li>Enter or paste your data into the input field above.</li>
                    <li>The tool processes your input instantly in real-time.</li>
                    <li>View the result in the output panel on the right.</li>
                    <li>Click the <strong style={{ color: '#34d399' }}>Copy</strong> button to copy the result to your clipboard.</li>
                  </ul>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px', marginTop: '24px' }}>Frequently Asked Questions</h3>

                  <div style={{ marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>Is this tool free to use?</h4>
                    <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Yes, VelnoxLabs Image Resizer & Compressor is 100% free with no sign-up required.</p>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>Is my data secure?</h4>
                    <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Absolutely. All processing happens entirely in your browser using client-side JavaScript. Your data never leaves your device and is never sent to any server.</p>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>Does it work on mobile devices?</h4>
                    <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Yes, this tool is fully responsive and works on desktop, tablet, and mobile browsers.</p>
                  </div>
                </div>

              </div>
            </div>
          )}

          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {/* Single Feedback Section at the Bottom */}
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-2xl mt-12">
            <h3 className="text-xl font-bold text-white mb-2">Got Feedback or Feature Requests?</h3>
            <p className="text-slate-400 mb-6 text-sm">Help us enhance VelnoxLabs developer utility standards. Share your feedback below!</p>
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <textarea
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Write your suggestions or feature requests here..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 focus:outline-none focus:border-slate-600 text-sm resize-none"
              ></textarea>
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-2.5 rounded-xl transition text-sm">
                {feedbackSent ? 'Sent!' : 'Submit Suggestion'}
              </button>
            </form>
          </div>

        </div>
      </GlobalContainer>
    </>
  );
}