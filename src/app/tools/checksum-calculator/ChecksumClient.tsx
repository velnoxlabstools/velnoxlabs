"use client";
import React, { useState, useEffect } from "react";

export default function ChecksumClient() {
  const [text, setText] = useState("Hello VelnoxLabs!");
  const [algorithm, setAlgorithm] = useState("sha-256");
  const [hash, setHash] = useState("");
  const [copied, setCopied] = useState(false);

  const [feedback, setFeedback] = useState("");
  const [feedbackEmail, setFeedbackEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const calculateHash = async (input: string, algo: string) => {
    setText(input);
    if (!input) { setHash(""); return; }
    try {
      if (algo === "simple") {
        let sum = 0;
        for (let i = 0; i < input.length; i++) sum += input.charCodeAt(i);
        setHash(sum.toString(16));
      } else {
        const data = new TextEncoder().encode(input);
        const buffer = await crypto.subtle.digest(algo.toUpperCase(), data);
        setHash(Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, "0")).join(""));
      }
    } catch (e) { setHash("Error calculating hash"); }
  };

  // Auto-run on mount
  useEffect(() => {
    if (text) calculateHash(text, algorithm);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFeedback("");
      setFeedbackEmail("");
    }, 3000);
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "SoftwareApplication",
            "name": "VelnoxLabs Checksum Calculator",
            "operatingSystem": "All",
            "applicationCategory": "DeveloperApplication",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
            "description": "Generate SHA-256, SHA-512, SHA-1, and simple checksums instantly in your browser."
          },
          {
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Is this Checksum Calculator free to use?",
                "acceptedAnswer": { "@type": "Answer", "text": "Yes, VelnoxLabs Checksum Calculator is 100% free with no sign-up required." }
              },
              {
                "@type": "Question",
                "name": "Is my data secure?",
                "acceptedAnswer": { "@type": "Answer", "text": "Absolutely. All hashing happens entirely in your browser using the Web Crypto API. Your data never leaves your device." }
              }
            ]
          }
        ]
      }) }} />

      <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>Checksum Calculator</h1>
            <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>Calculate instant cryptographic and simple hashes securely in your browser with absolute privacy.</p>
          </div>

          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '32px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <label style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Select Algorithm</label>
              <select
                value={algorithm}
                onChange={(e) => { setAlgorithm(e.target.value); calculateHash(text, e.target.value); }}
                style={{ backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', padding: '12px 20px', fontSize: '0.9rem', fontWeight: 600, outline: 'none', cursor: 'pointer' }}
              >
                <option value="sha-256">SHA-256</option>
                <option value="sha-512">SHA-512</option>
                <option value="sha-1">SHA-1</option>
                <option value="simple">Simple Checksum</option>
              </select>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Input Text</label>
              <textarea
                rows={5}
                placeholder="Type or paste your text here..."
                value={text}
                onChange={(e) => calculateHash(e.target.value, algorithm)}
                style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '16px', fontSize: '0.95rem', outline: 'none', resize: 'vertical', fontFamily: 'monospace' }}
              />
            </div>

            <div>
              <label style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Generated Hash Output</label>
              <div style={{ position: 'relative', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '16px', fontFamily: 'monospace', color: '#34d399', wordBreak: 'break-all', minHeight: '60px', display: 'flex', alignItems: 'center', paddingRight: '120px' }}>
                {hash || <span style={{ color: '#64748b', fontStyle: 'italic' }}>Hash output will appear here...</span>}
                {hash && (
                  <button
                    onClick={handleCopy}
                    style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '32px', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>What is a Checksum Calculator?</h2>
            <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: '20px' }}>A Checksum Calculator is an essential cryptographic utility designed to generate unique hash strings for any given text or data string. By applying standard hashing algorithms, it converts input data into a fixed-size cryptographic signature to ensure data integrity, verification, and secure transmission across networks.</p>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginTop: '24px', marginBottom: '16px' }}>Supported Hashing Algorithms</h3>
            <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', listStyle: 'none', padding: 0 }}>
              <li style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', padding: '20px', borderRadius: '12px', color: '#94a3b8' }}><strong style={{ color: '#fff', display: 'block', marginBottom: '6px' }}>SHA-256:</strong> Part of the SHA-2 family, producing a 256-bit (32-byte) hash value. Widely used in blockchain technology and digital signatures.</li>
              <li style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', padding: '20px', borderRadius: '12px', color: '#94a3b8' }}><strong style={{ color: '#fff', display: 'block', marginBottom: '6px' }}>SHA-512:</strong> A robust cryptographic hash function generating a 512-bit output for enhanced security requirements.</li>
              <li style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', padding: '20px', borderRadius: '12px', color: '#94a3b8' }}><strong style={{ color: '#fff', display: 'block', marginBottom: '6px' }}>SHA-1:</strong> A legacy 160-bit hash function commonly utilized in version control systems and historical data validation.</li>
              <li style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', padding: '20px', borderRadius: '12px', color: '#94a3b8' }}><strong style={{ color: '#fff', display: 'block', marginBottom: '6px' }}>Simple Checksum:</strong> A fast, lightweight custom numerical checksum algorithm useful for basic error detection.</li>
            </ul>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginTop: '32px', marginBottom: '12px' }}>How to Use This Tool</h3>
            <ul style={{ color: '#94a3b8', lineHeight: 1.9, paddingLeft: '20px', marginBottom: '24px' }}>
              <li>Select your desired hashing algorithm (SHA-256, SHA-512, SHA-1, or Simple Checksum) from the dropdown.</li>
              <li>Type or paste your text into the input field above.</li>
              <li>The hash is calculated instantly in real-time as you type.</li>
              <li>Click the <strong style={{ color: '#60a5fa' }}>Copy</strong> button to copy the generated hash to your clipboard.</li>
            </ul>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginTop: '24px', marginBottom: '12px' }}>Why Use Our Online Checksum Tool?</h3>
            <p style={{ color: '#94a3b8', lineHeight: 1.7 }}>Our tool executes all cryptographic computations entirely client-side using the native Web Crypto API. This guarantees absolute privacy, lightning-fast execution speed, and zero server-side data exposure.</p>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginTop: '32px', marginBottom: '16px' }}>Frequently Asked Questions</h3>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>Is this tool free to use?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Yes, VelnoxLabs Checksum Calculator is 100% free with no sign-up required.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>Is my data secure?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Absolutely. All hashing happens entirely in your browser using the Web Crypto API. Your data never leaves your device and is never sent to any server.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>What is the difference between a checksum and a cryptographic hash?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>A checksum is a simple error-detection value typically used to verify data integrity during transmission. A cryptographic hash (SHA-256, SHA-512) is a stronger one-way function designed to be collision-resistant and suitable for security-sensitive applications.</p>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-2xl">
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
                {submitted ? 'Sent!' : 'Submit Suggestion'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}