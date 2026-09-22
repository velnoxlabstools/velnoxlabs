'use client';

import { useTool } from '../ToolProvider';

export function ToolFeaturesSection() {
  const { tool } = useTool();

  if (tool?.slug === 'user-agent-parser') {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'var(--space-4)',
          gridColumn: '1 / -1',
        }}
      >
        <div style={{ backgroundColor: '#090d16', padding: '20px', borderRadius: '12px', border: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', marginBottom: '8px' }}>
            <strong style={{ fontSize: '14px', color: '#f8fafc' }}>Browser &amp; OS Detection</strong>
          </div>
          <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
            Identifies browser family, exact version numbers, operating system builds, and rendering engines (Blink, Gecko, WebKit).
          </p>
        </div>

        <div style={{ backgroundColor: '#090d16', padding: '20px', borderRadius: '12px', border: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#818cf8', marginBottom: '8px' }}>
            <strong style={{ fontSize: '14px', color: '#f8fafc' }}>Bot &amp; AI Scraper Detection</strong>
          </div>
          <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
            Recognizes crawlers (Googlebot, Bingbot) and modern AI scrapers (GPTBot, ClaudeBot, PerplexityBot, ByteSpider).
          </p>
        </div>

        <div style={{ backgroundColor: '#090d16', padding: '20px', borderRadius: '12px', border: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', marginBottom: '8px' }}>
            <strong style={{ fontSize: '14px', color: '#f8fafc' }}>Hardware &amp; CPU Architecture</strong>
          </div>
          <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
            Determines device form factor (Desktop, Mobile, Tablet) alongside CPU architecture (x86_64, ARM64, Apple Silicon).
          </p>
        </div>

        <div style={{ backgroundColor: '#090d16', padding: '20px', borderRadius: '12px', border: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c084fc', marginBottom: '8px' }}>
            <strong style={{ fontSize: '14px', color: '#f8fafc' }}>Zero-Knowledge Privacy</strong>
          </div>
          <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
            Runs 100% inside your browser memory. User-Agent strings and audit inspection tokens are never sent across the network.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#090d16', padding: '20px', borderRadius: '10px', border: '1px solid #1e293b' }}>
      <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc', marginBottom: '10px' }}>Features</h3>
      <ul style={{ fontSize: '13px', color: '#94a3b8', paddingLeft: '18px', margin: 0 }}>
        <li>100% Client-side local execution</li>
        <li>Instant real-time output</li>
        <li>Zero data transmission</li>
      </ul>
    </div>
  );
}