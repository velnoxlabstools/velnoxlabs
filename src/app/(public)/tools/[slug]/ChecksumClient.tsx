'use client';
import React, { useState, useEffect } from 'react';

export default function ChecksumClient() {
  const [mounted, setMounted] = useState(false);
  const [text, setText] = useState('');
  const [algorithm, setAlgorithm] = useState('sha256');
  const [hash, setHash] = useState('');
  const [copied, setCopied] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const calculateHash = async (val, algo) => {
    setText(val);
    if (!val) { setHash(''); return; }
    if (algo === 'simple') {
      let h = 0;
      for (let i = 0; i < val.length; i++) { h = (h * 31 + val.charCodeAt(i)) % 4294967296; }
      setHash(Math.abs(h).toString(16));
      return;
    }
    try {
      const msgUint8 = new TextEncoder().encode(val);
      const hashBuffer = await crypto.subtle.digest(algo.toUpperCase(), msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      setHash(hashHex);
    } catch (e) { setHash('Error calculating hash'); }
  };
  const handleCopy = () => {
    if (!hash) return;
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  if (!mounted) return null;
  return (
    <div className='min-h-screen bg-gray-950 text-white py-12 px-4'>
      <div className='max-w-3xl mx-auto space-y-10'>
        <div className='space-y-4'>
          <h1 className='text-4xl font-bold text-blue-400'>Checksum Calculator</h1>
          <p className='text-gray-400'>Calculate instant cryptographic hashes (SHA-256, SHA-512, SHA-1, Simple Checksum) for your text inputs securely in your browser.</p>
          <div className='bg-gray-900 border border-gray-800 p-6 rounded-xl space-y-4'>
            <div className='flex gap-4 items-center'>
              <label className='text-sm text-gray-400'>Algorithm:</label>
              <select className='bg-gray-950 border border-gray-700 text-white px-3 py-1.5 rounded-lg outline-none cursor-pointer' value={algorithm} onChange={(e) => { setAlgorithm(e.target.value); calculateHash(text, e.target.value); }}>
                <option value='sha256'>SHA-256</option>
                <option value='sha512'>SHA-512</option>
                <option value='sha-1'>SHA-1</option>
                <option value='simple'>Simple Checksum</option>
              </select>
            </div>
            <textarea className='w-full p-4 bg-gray-950 border border-gray-700 rounded-lg text-white outline-none focus:border-blue-500' rows='5' placeholder='Enter text here...' value={text} onChange={(e) => calculateHash(e.target.value, algorithm)} />
            <div className='relative'>
              <div className='p-4 bg-gray-950 border border-gray-700 rounded-lg font-mono text-green-400 break-all pr-24 min-h-[60px] flex items-center'>{hash || 'Hash output will appear here...'}</div>
              {hash && (<button onClick={handleCopy} className='absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors'>{copied ? 'Copied!' : 'Copy'}</button>)}
            </div>
          </div>
        </div>
        <div className='bg-gray-900/50 border border-gray-800/80 p-8 rounded-2xl space-y-6 text-gray-300 leading-relaxed'>
          <h2 className='text-2xl font-semibold text-white'>What is a Checksum Calculator?</h2>
          <p>A Checksum Calculator is an essential cryptographic utility designed to generate unique hash strings for any given text or data string. By applying standard hashing algorithms like SHA-256, SHA-512, and SHA-1, it converts input data into a fixed-size cryptographic signature. This ensures data integrity, verification, and secure transmission across networks.</p>
          <h3 className='text-xl font-semibold text-white'>Supported Hashing Algorithms</h3>
          <ul className='list-disc pl-5 space-y-2 text-gray-400'>
            <li><strong className='text-white'>SHA-256:</strong> Part of the SHA-2 family, producing a 256-bit (32-byte) hash value. Widely used in blockchain technology and digital signatures.</li>
            <li><strong className='text-white'>SHA-512:</strong> A robust cryptographic hash function generating a 512-bit output for enhanced security requirements.</li>
            <li><strong className='text-white'>SHA-1:</strong> A legacy 160-bit hash function commonly utilized in version control systems and historical data validation.</li>
            <li><strong className='text-white'>Simple Checksum:</strong> A fast, lightweight custom numerical checksum algorithm useful for basic error detection.</li>
          </ul>
          <h3 className='text-xl font-semibold text-white'>Why Use Our Online Checksum Tool?</h3>
          <p>Our tool executes all cryptographic computations entirely client-side using the native Web Crypto API. This guarantees absolute privacy, lightning-fast execution speed, and zero server-side data exposure.</p>
        </div>
      </div>
    </div>
  );
}
