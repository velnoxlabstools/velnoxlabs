'use client';

import React from 'react';
import { useUAParser } from '../../context/UAParserContext';
import {
  Zap,
  CheckCircle,
  AlertCircle,
  Code2,
  Box,
  Wifi,
  Radio,
  Fingerprint,
  Cookie,
  SmartphoneNfc,
} from 'lucide-react';

export const BrowserCapabilities: React.FC = () => {
  const { parsedResult } = useUAParser();

  if (!parsedResult || !parsedResult.rawUA) {
    return null;
  }

  const { capabilities } = parsedResult;

  const capList: Array<{
    key: string;
    label: string;
    desc: string;
    val: boolean | 'Likely';
    icon: React.ReactNode;
  }> = [
    {
      key: 'webgl',
      label: 'WebGL 2.0',
      desc: '3D Graphics Acceleration Engine',
      val: capabilities.webgl,
      icon: <Box className="w-4 h-4 text-cyan-400" />,
    },
    {
      key: 'webgpu',
      label: 'WebGPU',
      desc: 'Next-Gen GPU Compute & Rendering',
      val: capabilities.webgpu,
      icon: <Zap className="w-4 h-4 text-amber-400" />,
    },
    {
      key: 'webassembly',
      label: 'WebAssembly (Wasm)',
      desc: 'High-Performance Bytecode Execution',
      val: capabilities.webassembly,
      icon: <Code2 className="w-4 h-4 text-purple-400" />,
    },
    {
      key: 'webrtc',
      label: 'WebRTC',
      desc: 'Real-time Peer-to-Peer Video/Audio',
      val: capabilities.webrtc,
      icon: <Radio className="w-4 h-4 text-emerald-400" />,
    },
    {
      key: 'serviceWorker',
      label: 'Service Workers',
      desc: 'Background Scripts & Offline Caching',
      val: capabilities.serviceWorker,
      icon: <Wifi className="w-4 h-4 text-blue-400" />,
    },
    {
      key: 'touchEvents',
      label: 'Touch Events API',
      desc: 'Multi-touch gesture input',
      val: capabilities.touchEvents,
      icon: <Fingerprint className="w-4 h-4 text-rose-400" />,
    },
    {
      key: 'es2023',
      label: 'ES2023 Standard',
      desc: 'Modern Modern JavaScript Features',
      val: capabilities.es2023,
      icon: <Code2 className="w-4 h-4 text-indigo-400" />,
    },
    {
      key: 'pwa',
      label: 'PWA Installation',
      desc: 'Progressive Web App installation',
      val: capabilities.pwa,
      icon: <SmartphoneNfc className="w-4 h-4 text-teal-400" />,
    },
    {
      key: 'cookieSupport',
      label: 'Cookie Support',
      desc: 'HTTP Session Cookies',
      val: capabilities.cookieSupport,
      icon: <Cookie className="w-4 h-4 text-amber-300" />,
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Inferred Browser Capabilities
          </h3>
        </div>
        <span className="text-[11px] text-slate-600 dark:text-slate-400">Based on Engine & Version matrix</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {capList.map((cap) => {
          const isSupported = cap.val === true;
          const isLikely = cap.val === 'Likely';

          return (
            <div
              key={cap.key}
              className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3 flex items-start gap-3 hover:border-slate-700/80 transition-colors"
            >
              <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 shrink-0">
                {cap.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{cap.label}</h4>
                  {isSupported ? (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-1.5 py-0.2 rounded flex items-center gap-1 shrink-0">
                      <CheckCircle className="w-2.5 h-2.5" /> Yes
                    </span>
                  ) : isLikely ? (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-950/80 border border-amber-800/60 px-1.5 py-0.2 rounded flex items-center gap-1 shrink-0">
                      <AlertCircle className="w-2.5 h-2.5" /> Likely
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-900 border border-slate-800 px-1.5 py-0.2 rounded shrink-0">
                      No
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate mt-0.5">{cap.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};