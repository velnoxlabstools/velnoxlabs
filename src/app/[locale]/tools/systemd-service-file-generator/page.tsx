'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import {
  Server,
  Terminal,
  Shield,
  Copy,
  Check,
  Download,
  Sliders,
  FileCode2,
  BookOpen,
} from 'lucide-react';

type BuilderMode = 'visual' | 'quick';

interface ServicePreset {
  id: string;
  labelKey: 'presetNode' | 'presetPython' | 'presetGo' | 'presetDocker' | 'presetWorker';
  serviceName: string;
  description: string;
  execStart: string;
  workDir: string;
  user: string;
  group: string;
  type: string;
  after: string;
  restart: string;
  restartSec: string;
  env: string;
  privateTmp: boolean;
  noNewPrivs: boolean;
  protectSys: boolean;
  protectHome: boolean;
}

const PRESETS: ServicePreset[] = [
  {
    id: 'node',
    labelKey: 'presetNode',
    serviceName: 'nextjs-app',
    description: 'Next.js Production Server',
    execStart: '/usr/bin/npm run start',
    workDir: '/var/www/myapp',
    user: 'www-data',
    group: 'www-data',
    type: 'simple',
    after: 'network.target',
    restart: 'on-failure',
    restartSec: '10',
    env: 'NODE_ENV=production\nPORT=3000',
    privateTmp: true,
    noNewPrivs: true,
    protectSys: true,
    protectHome: false,
  },
  {
    id: 'python',
    labelKey: 'presetPython',
    serviceName: 'fastapi-api',
    description: 'Python FastAPI Uvicorn Service',
    execStart: '/opt/fastapi/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000',
    workDir: '/opt/fastapi',
    user: 'ubuntu',
    group: 'ubuntu',
    type: 'simple',
    after: 'network.target postgresql.service',
    restart: 'on-failure',
    restartSec: '5',
    env: 'PYTHONUNBUFFERED=1',
    privateTmp: true,
    noNewPrivs: true,
    protectSys: true,
    protectHome: false,
  },
  {
    id: 'go',
    labelKey: 'presetGo',
    serviceName: 'go-microservice',
    description: 'Compiled Go / Rust Backend Binary',
    execStart: '/usr/local/bin/myservice',
    workDir: '/opt/myservice',
    user: 'svcuser',
    group: 'svcuser',
    type: 'simple',
    after: 'network.target',
    restart: 'always',
    restartSec: '5',
    env: 'APP_ENV=production',
    privateTmp: true,
    noNewPrivs: true,
    protectSys: true,
    protectHome: true,
  },
  {
    id: 'docker',
    labelKey: 'presetDocker',
    serviceName: 'docker-stack',
    description: 'Docker Compose Application Stack',
    execStart: '/usr/bin/docker compose up',
    workDir: '/opt/docker-app',
    user: 'root',
    group: 'docker',
    type: 'simple',
    after: 'docker.service network-online.target',
    restart: 'on-failure',
    restartSec: '15',
    env: '',
    privateTmp: false,
    noNewPrivs: false,
    protectSys: false,
    protectHome: false,
  },
  {
    id: 'worker',
    labelKey: 'presetWorker',
    serviceName: 'queue-worker',
    description: 'Background Job Queue Worker',
    execStart: '/usr/bin/python3 /opt/worker/run.py',
    workDir: '/opt/worker',
    user: 'www-data',
    group: 'www-data',
    type: 'simple',
    after: 'network.target redis-server.service',
    restart: 'always',
    restartSec: '10',
    env: 'WORKER_CONCURRENCY=4',
    privateTmp: true,
    noNewPrivs: true,
    protectSys: true,
    protectHome: true,
  },
];

const SUPPORTED_QUICK_KEYS = [
  { key: 'name', descKey: 'keyDescName' as const },
  { key: 'description', descKey: 'keyDescDesc' as const },
  { key: 'exec', descKey: 'keyDescExec' as const },
  { key: 'user', descKey: 'keyDescUser' as const },
  { key: 'workdir', descKey: 'keyDescWorkdir' as const },
  { key: 'restart', descKey: 'keyDescRestart' as const },
];

export default function SystemdServiceGeneratorPage() {
  const tUI = useTranslations('ToolUI.systemdServiceGenerator');

  const [mode, setMode] = useState<BuilderMode>('visual');

  // Visual Builder State
  const [serviceName, setServiceName] = useState('nextjs-app');
  const [description, setDescription] = useState('Next.js Production Server');
  const [execStart, setExecStart] = useState('/usr/bin/npm run start');
  const [workDir, setWorkDir] = useState('/var/www/myapp');
  const [user, setUser] = useState('www-data');
  const [group, setGroup] = useState('www-data');
  const [serviceType, setServiceType] = useState('simple');
  const [after, setAfter] = useState('network.target');
  const [restart, setRestart] = useState('on-failure');
  const [restartSec, setRestartSec] = useState('10');
  const [envVars, setEnvVars] = useState('NODE_ENV=production\nPORT=3000');

  // Security Hardening
  const [privateTmp, setPrivateTmp] = useState(true);
  const [noNewPrivs, setNoNewPrivs] = useState(true);
  const [protectSys, setProtectSys] = useState(true);
  const [protectHome, setProtectHome] = useState(false);

  // Quick Key=Value State
  const [quickInput, setQuickInput] = useState(
    'name=myapp\ndescription=My Node Application\nexec=/usr/bin/node /opt/myapp/index.js\nuser=www-data\nworkdir=/opt/myapp\nrestart=on-failure'
  );

  // Copy states
  const [copiedUnit, setCopiedUnit] = useState(false);
  const [copiedCliInstall, setCopiedCliInstall] = useState(false);
  const [copiedCliStart, setCopiedCliStart] = useState(false);

  const applyPreset = (p: ServicePreset) => {
    setMode('visual');
    setServiceName(p.serviceName);
    setDescription(p.description);
    setExecStart(p.execStart);
    setWorkDir(p.workDir);
    setUser(p.user);
    setGroup(p.group);
    setServiceType(p.type);
    setAfter(p.after);
    setRestart(p.restart);
    setRestartSec(p.restartSec);
    setEnvVars(p.env);
    setPrivateTmp(p.privateTmp);
    setNoNewPrivs(p.noNewPrivs);
    setProtectSys(p.protectSys);
    setProtectHome(p.protectHome);
  };

  // Compute service file output, effective name, errors, and warnings
  const { unitText, effectiveName, quickError, quickWarnings } = useMemo(() => {
    if (mode === 'visual') {
      const cleanName =
        serviceName
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9@._-]/g, '-') || 'my-service';
      const cleanExec = execStart.trim();
      if (!cleanExec) {
        return {
          unitText: '',
          effectiveName: cleanName,
          quickError: tUI('errorMissingExec'),
          quickWarnings: [] as string[],
        };
      }

      const lines: string[] = [];
      lines.push('[Unit]');
      lines.push(`Description=${description.trim() || cleanName}`);
      if (after.trim()) lines.push(`After=${after.trim()}`);
      lines.push('');
      lines.push('[Service]');
      lines.push(`Type=${serviceType}`);
      if (user.trim()) lines.push(`User=${user.trim()}`);
      if (group.trim()) lines.push(`Group=${group.trim()}`);
      if (workDir.trim()) lines.push(`WorkingDirectory=${workDir.trim()}`);
      lines.push(`ExecStart=${cleanExec}`);
      lines.push(`Restart=${restart}`);
      if (restart !== 'no' && restartSec.trim()) {
        lines.push(`RestartSec=${restartSec.trim()}`);
      }

      const envLines = envVars
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.includes('='));
      envLines.forEach((ev) => {
        lines.push(`Environment="${ev.replace(/"/g, '\\"')}"`);
      });

      if (privateTmp || noNewPrivs || protectSys || protectHome) {
        lines.push('');
        lines.push('# Security Hardening');
        if (privateTmp) lines.push('PrivateTmp=true');
        if (noNewPrivs) lines.push('NoNewPrivileges=true');
        if (protectSys) lines.push('ProtectSystem=full');
        if (protectHome) lines.push('ProtectHome=true');
      }

      lines.push('');
      lines.push('[Install]');
      lines.push('WantedBy=multi-user.target');

      return {
        unitText: lines.join('\n'),
        effectiveName: cleanName,
        quickError: '',
        quickWarnings: [] as string[],
      };
    }

    // Quick Key=Value Parsing Mode
    if (!quickInput.trim()) {
      return {
        unitText: '',
        effectiveName: 'my-service',
        quickError: '',
        quickWarnings: [] as string[],
      };
    }

    const lines = quickInput
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    const cfg: Record<string, string> = {};
    let hasMissingEq = false;
    let hasUnknown = false;

    lines.forEach((line) => {
      const idx = line.indexOf('=');
      if (idx === -1) {
        hasMissingEq = true;
        return;
      }
      const k = line.slice(0, idx).trim().toLowerCase();
      const v = line.slice(idx + 1).trim();
      if (!k) {
        hasMissingEq = true;
        return;
      }
      cfg[k] = v;
      if (!SUPPORTED_QUICK_KEYS.some((sk) => sk.key === k)) {
        hasUnknown = true;
      }
    });

    const warns: string[] = [];
    if (hasMissingEq) warns.push(tUI('warnMissingEq'));
    if (hasUnknown) warns.push(tUI('warnUnknownKeys'));

    if (Object.keys(cfg).length === 0) {
      return {
        unitText: '',
        effectiveName: 'my-service',
        quickError: tUI('errorNoValidPairs'),
        quickWarnings: warns,
      };
    }

    if (!cfg.exec) {
      return {
        unitText: '',
        effectiveName: cfg.name || 'my-service',
        quickError: tUI('errorMissingExec'),
        quickWarnings: warns,
      };
    }

    const validRestart = [
      'no',
      'on-success',
      'on-failure',
      'on-abnormal',
      'on-watchdog',
      'on-abort',
      'always',
    ];
    const qName = (cfg.name || 'my-service').replace(/[^a-zA-Z0-9@._-]/g, '-');
    const qDesc = cfg.description || qName;
    const qUser = cfg.user || 'www-data';
    const qWorkdir = cfg.workdir || `/opt/${qName}`;
    const qRestart = cfg.restart || 'on-failure';

    if (!validRestart.includes(qRestart)) {
      warns.push(tUI('warnInvalidRestart'));
    }

    const quickUnit = `[Unit]
Description=${qDesc}
After=network.target

[Service]
Type=simple
User=${qUser}
WorkingDirectory=${qWorkdir}
ExecStart=${cfg.exec}
Restart=${qRestart}
RestartSec=10

[Install]
WantedBy=multi-user.target`;

    return {
      unitText: quickUnit,
      effectiveName: qName,
      quickError: '',
      quickWarnings: warns,
    };
  }, [
    mode,
    serviceName,
    description,
    execStart,
    workDir,
    user,
    group,
    serviceType,
    after,
    restart,
    restartSec,
    envVars,
    privateTmp,
    noNewPrivs,
    protectSys,
    protectHome,
    quickInput,
    tUI,
  ]);

  // CLI Commands
  const cliInstallCommand = useMemo(() => {
    if (!unitText) return '';
    return `cat << 'EOF' | sudo tee /etc/systemd/system/${effectiveName}.service > /dev/null\n${unitText}\nEOF`;
  }, [unitText, effectiveName]);

  const cliStartCommands = useMemo(() => {
    return `sudo systemctl daemon-reload\nsudo systemctl enable --now ${effectiveName}\nsudo systemctl status ${effectiveName}\nsudo journalctl -u ${effectiveName} -f`;
  }, [effectiveName]);

  const handleCopyText = (val: string, setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    if (!val) return;
    navigator.clipboard.writeText(val);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const handleDownload = () => {
    if (!unitText) return;
    const blob = new Blob([unitText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${effectiveName || 'my-service'}.service`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <GlobalContainer maxWidth="2xl">
      <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
        <SectionHeading title={tUI('title')} subtitle={tUI('subtitle')} />

        {/* ================= PRESETS BAR & MODE SWITCHER ================= */}
        <div
          style={{
            marginTop: 'var(--space-6)',
            marginBottom: 'var(--space-4)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {/* Mode Tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setMode('visual')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: '1px solid',
                borderColor: mode === 'visual' ? '#3b82f6' : 'var(--border-color)',
                backgroundColor: mode === 'visual' ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-card)',
                color: mode === 'visual' ? '#60a5fa' : 'var(--text-muted)',
              }}
            >
              <Sliders size={16} />
              {tUI('modeVisual')}
            </button>
            <button
              onClick={() => setMode('quick')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: '1px solid',
                borderColor: mode === 'quick' ? '#3b82f6' : 'var(--border-color)',
                backgroundColor: mode === 'quick' ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-card)',
                color: mode === 'quick' ? '#60a5fa' : 'var(--text-muted)',
              }}
            >
              <FileCode2 size={16} />
              {tUI('modeQuick')}
            </button>
          </div>

          {/* Ubuntu/Debian Presets */}
          <div>
            <span
              style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                marginBottom: '8px',
              }}
            >
              {tUI('presetsLabel')}
            </span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => applyPreset(p)}
                  style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    color: '#60a5fa',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '20px',
                    padding: '6px 14px',
                    fontSize: '0.775rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {tUI(p.labelKey)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ================= MAIN BUILDER + LIVE OUTPUT CARD ================= */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: 'var(--space-6)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px',
            }}
          >
            {/* LEFT PANEL: VISUAL OR QUICK INPUT */}
            <div>
              {mode === 'visual' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <label
                        style={{
                          color: 'var(--text-main)',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          display: 'block',
                          marginBottom: '5px',
                        }}
                      >
                        {tUI('fieldServiceName')}
                      </label>
                      <input
                        type="text"
                        value={serviceName}
                        onChange={(e) => setServiceName(e.target.value)}
                        style={{
                          width: '100%',
                          backgroundColor: 'var(--bg-page)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          color: 'var(--text-main)',
                          padding: '8px 10px',
                          fontFamily: 'monospace',
                          fontSize: '0.85rem',
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          color: 'var(--text-main)',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          display: 'block',
                          marginBottom: '5px',
                        }}
                      >
                        {tUI('fieldDescription')}
                      </label>
                      <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        style={{
                          width: '100%',
                          backgroundColor: 'var(--bg-page)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          color: 'var(--text-main)',
                          padding: '8px 10px',
                          fontSize: '0.85rem',
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      style={{
                        color: 'var(--text-main)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        display: 'block',
                        marginBottom: '5px',
                      }}
                    >
                      {tUI('fieldExecStart')}
                    </label>
                    <input
                      type="text"
                      value={execStart}
                      onChange={(e) => setExecStart(e.target.value)}
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        color: 'var(--text-main)',
                        padding: '8px 10px',
                        fontFamily: 'monospace',
                        fontSize: '0.85rem',
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        color: 'var(--text-main)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        display: 'block',
                        marginBottom: '5px',
                      }}
                    >
                      {tUI('fieldWorkDir')}
                    </label>
                    <input
                      type="text"
                      value={workDir}
                      onChange={(e) => setWorkDir(e.target.value)}
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        color: 'var(--text-main)',
                        padding: '8px 10px',
                        fontFamily: 'monospace',
                        fontSize: '0.85rem',
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                      gap: '10px',
                    }}
                  >
                    <div>
                      <label
                        style={{
                          color: 'var(--text-main)',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          display: 'block',
                          marginBottom: '5px',
                        }}
                      >
                        {tUI('fieldUser')}
                      </label>
                      <input
                        type="text"
                        value={user}
                        onChange={(e) => setUser(e.target.value)}
                        style={{
                          width: '100%',
                          backgroundColor: 'var(--bg-page)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          color: 'var(--text-main)',
                          padding: '8px 10px',
                          fontFamily: 'monospace',
                          fontSize: '0.85rem',
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          color: 'var(--text-main)',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          display: 'block',
                          marginBottom: '5px',
                        }}
                      >
                        {tUI('fieldGroup')}
                      </label>
                      <input
                        type="text"
                        value={group}
                        onChange={(e) => setGroup(e.target.value)}
                        style={{
                          width: '100%',
                          backgroundColor: 'var(--bg-page)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          color: 'var(--text-main)',
                          padding: '8px 10px',
                          fontFamily: 'monospace',
                          fontSize: '0.85rem',
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          color: 'var(--text-main)',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          display: 'block',
                          marginBottom: '5px',
                        }}
                      >
                        {tUI('fieldType')}
                      </label>
                      <select
                        value={serviceType}
                        onChange={(e) => setServiceType(e.target.value)}
                        style={{
                          width: '100%',
                          backgroundColor: 'var(--bg-page)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          color: 'var(--text-main)',
                          padding: '8px 10px',
                          fontFamily: 'monospace',
                          fontSize: '0.85rem',
                        }}
                      >
                        <option value="simple">simple</option>
                        <option value="forking">forking</option>
                        <option value="oneshot">oneshot</option>
                        <option value="notify">notify</option>
                      </select>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                      gap: '10px',
                    }}
                  >
                    <div>
                      <label
                        style={{
                          color: 'var(--text-main)',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          display: 'block',
                          marginBottom: '5px',
                        }}
                      >
                        {tUI('fieldAfter')}
                      </label>
                      <input
                        type="text"
                        value={after}
                        onChange={(e) => setAfter(e.target.value)}
                        style={{
                          width: '100%',
                          backgroundColor: 'var(--bg-page)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          color: 'var(--text-main)',
                          padding: '8px 10px',
                          fontFamily: 'monospace',
                          fontSize: '0.8rem',
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          color: 'var(--text-main)',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          display: 'block',
                          marginBottom: '5px',
                        }}
                      >
                        {tUI('fieldRestart')}
                      </label>
                      <select
                        value={restart}
                        onChange={(e) => setRestart(e.target.value)}
                        style={{
                          width: '100%',
                          backgroundColor: 'var(--bg-page)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          color: 'var(--text-main)',
                          padding: '8px 10px',
                          fontFamily: 'monospace',
                          fontSize: '0.85rem',
                        }}
                      >
                        <option value="on-failure">on-failure</option>
                        <option value="always">always</option>
                        <option value="on-abnormal">on-abnormal</option>
                        <option value="no">no</option>
                      </select>
                    </div>
                    <div>
                      <label
                        style={{
                          color: 'var(--text-main)',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          display: 'block',
                          marginBottom: '5px',
                        }}
                      >
                        {tUI('fieldRestartSec')}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={restartSec}
                        onChange={(e) => setRestartSec(e.target.value)}
                        style={{
                          width: '100%',
                          backgroundColor: 'var(--bg-page)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          color: 'var(--text-main)',
                          padding: '8px 10px',
                          fontFamily: 'monospace',
                          fontSize: '0.85rem',
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      style={{
                        color: 'var(--text-main)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        display: 'block',
                        marginBottom: '5px',
                      }}
                    >
                      {tUI('fieldEnv')}
                    </label>
                    <textarea
                      value={envVars}
                      onChange={(e) => setEnvVars(e.target.value)}
                      rows={2}
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        color: 'var(--text-main)',
                        padding: '8px 10px',
                        fontFamily: 'monospace',
                        fontSize: '0.8rem',
                        resize: 'vertical',
                      }}
                    />
                  </div>

                  {/* Security Hardening Switches */}
                  <div
                    style={{
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '12px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: 'var(--text-main)',
                        marginBottom: '10px',
                      }}
                    >
                      <Shield size={14} style={{ color: '#10b981' }} />
                      {tUI('hardeningTitle')}
                    </div>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: '8px',
                      }}
                    >
                      {[
                        { val: privateTmp, set: setPrivateTmp, key: 'flagPrivateTmp' as const },
                        { val: noNewPrivs, set: setNoNewPrivs, key: 'flagNoNewPrivs' as const },
                        { val: protectSys, set: setProtectSys, key: 'flagProtectSys' as const },
                        { val: protectHome, set: setProtectHome, key: 'flagProtectHome' as const },
                      ].map((f) => (
                        <label
                          key={f.key}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '0.78rem',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={f.val}
                            onChange={(e) => f.set(e.target.checked)}
                            style={{ width: '15px', height: '15px', accentColor: '#10b981' }}
                          />
                          {tUI(f.key)}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* QUICK KEY=VALUE MODE */
                <div>
                  <label
                    style={{
                      color: 'var(--text-main)',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      display: 'block',
                      marginBottom: '8px',
                    }}
                  >
                    {tUI('serviceConfig')}
                  </label>
                  <textarea
                    value={quickInput}
                    onChange={(e) => setQuickInput(e.target.value)}
                    rows={12}
                    placeholder={tUI('placeholder')}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      padding: '12px',
                      fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                      fontSize: '0.85rem',
                      outline: 'none',
                      resize: 'vertical',
                    }}
                  />

                  <div
                    style={{
                      marginTop: '12px',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '12px',
                    }}
                  >
                    <p
                      style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        marginBottom: '6px',
                      }}
                    >
                      {tUI('supportedKeys')}
                    </p>
                    {SUPPORTED_QUICK_KEYS.map((k) => (
                      <p
                        key={k.key}
                        style={{
                          color: 'var(--text-muted)',
                          fontSize: '0.75rem',
                          marginBottom: '2px',
                        }}
                      >
                        <span style={{ color: '#60a5fa', fontFamily: 'monospace' }}>{k.key}</span> —{' '}
                        {tUI(k.descKey)}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Validation Error / Warnings */}
              {quickError && (
                <div
                  style={{
                    marginTop: '12px',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                  }}
                >
                  <p style={{ color: '#f87171', fontSize: '0.8rem', fontWeight: 600, margin: 0 }}>
                    {quickError}
                  </p>
                </div>
              )}

              {quickWarnings.length > 0 && !quickError && (
                <div
                  style={{
                    marginTop: '12px',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                  }}
                >
                  <p
                    style={{
                      color: '#fbbf24',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      marginBottom: '4px',
                    }}
                  >
                    {tUI('warnings')}
                  </p>
                  {quickWarnings.map((w, i) => (
                    <p
                      key={i}
                      style={{ color: '#fcd34d', fontSize: '0.75rem', marginBottom: '2px' }}
                    >
                      • {w}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT PANEL: GENERATED .SERVICE FILE */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px',
                  gap: '8px',
                  flexWrap: 'wrap',
                }}
              >
                <label
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Server size={15} style={{ color: '#3b82f6' }} />
                  {effectiveName ? `${effectiveName}.service` : tUI('defaultFileName')}
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleDownload}
                    disabled={!unitText}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      backgroundColor: unitText ? '#059669' : 'rgba(255,255,255,0.05)',
                      color: unitText ? '#ffffff' : '#64748b',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '5px 12px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: unitText ? 'pointer' : 'not-allowed',
                    }}
                  >
                    <Download size={13} />
                    {tUI('download')}
                  </button>
                  <button
                    onClick={() => handleCopyText(unitText, setCopiedUnit)}
                    disabled={!unitText}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      backgroundColor: copiedUnit ? '#059669' : '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '5px 12px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: unitText ? 'pointer' : 'not-allowed',
                      opacity: unitText ? 1 : 0.5,
                    }}
                  >
                    {copiedUnit ? <Check size={13} /> : <Copy size={13} />}
                    {copiedUnit ? tUI('copied') : tUI('copy')}
                  </button>
                </div>
              </div>

              <textarea
                value={unitText}
                readOnly
                rows={18}
                placeholder={tUI('outputPlaceholder')}
                style={{
                  width: '100%',
                  flex: 1,
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: '#34d399',
                  padding: '14px',
                  fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                  fontSize: '0.85rem',
                  lineHeight: 1.55,
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>
          </div>
        </div>

        {/* ================= UBUNTU & DEBIAN COMMAND LINE INSTALL + SYSTEMCTL START ================= */}
        {unitText && (
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: 'var(--space-6)',
            }}
          >
            <div style={{ marginBottom: '16px' }}>
              <h3
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  marginBottom: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Terminal size={18} style={{ color: '#3b82f6' }} />
                {tUI('cliTitle')}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {tUI('cliSubtitle')}
              </p>
            </div>

            {/* 1. One-Liner Install */}
            <div style={{ marginBottom: '16px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '6px',
                  gap: '8px',
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  {tUI('cliOneLinerLabel')}
                </span>
                <button
                  onClick={() => handleCopyText(cliInstallCommand, setCopiedCliInstall)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    backgroundColor: copiedCliInstall ? '#059669' : 'rgba(59, 130, 246, 0.15)',
                    color: copiedCliInstall ? '#ffffff' : '#60a5fa',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    cursor: 'pointer',
                  }}
                >
                  {copiedCliInstall ? <Check size={12} /> : <Copy size={12} />}
                  {copiedCliInstall ? tUI('copied') : tUI('copy')}
                </button>
              </div>
              <pre
                style={{
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '12px',
                  fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                  fontSize: '0.8rem',
                  color: '#93c5fd',
                  overflowX: 'auto',
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}
              >
                {cliInstallCommand}
              </pre>
            </div>

            {/* 2. Systemctl Start & Logs */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '6px',
                  gap: '8px',
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  {tUI('cliManageLabel')}
                </span>
                <button
                  onClick={() => handleCopyText(cliStartCommands, setCopiedCliStart)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    backgroundColor: copiedCliStart ? '#059669' : 'rgba(59, 130, 246, 0.15)',
                    color: copiedCliStart ? '#ffffff' : '#60a5fa',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    cursor: 'pointer',
                  }}
                >
                  {copiedCliStart ? <Check size={12} /> : <Copy size={12} />}
                  {copiedCliStart ? tUI('copied') : tUI('copy')}
                </button>
              </div>
              <pre
                style={{
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '12px',
                  fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                  fontSize: '0.825rem',
                  color: '#34d399',
                  overflowX: 'auto',
                  margin: 0,
                }}
              >
                {cliStartCommands}
              </pre>
            </div>
          </div>
        )}

        {/* ================= SYSTEMD SERVICE TUTORIAL: SECTION BREAKDOWN ================= */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: 'var(--space-8)',
          }}
        >
          <div style={{ marginBottom: '16px' }}>
            <h3
              style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <BookOpen size={18} style={{ color: '#3b82f6' }} />
              {tUI('tutorialTitle')}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {tUI('tutorialSubtitle')}
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
              gap: '12px',
            }}
          >
            {[
              { title: tUI('tutUnitTitle'), desc: tUI('tutUnitDesc') },
              { title: tUI('tutServiceTitle'), desc: tUI('tutServiceDesc') },
              { title: tUI('tutInstallTitle'), desc: tUI('tutInstallDesc') },
            ].map((card, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '14px',
                }}
              >
                <div
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: '#60a5fa',
                    fontFamily: 'monospace',
                    marginBottom: '6px',
                  }}
                >
                  {card.title}
                </div>
                <p
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ================= CENTRALIZED SEO & FAQ CONTENT ================= */}
        <ToolSeoContent
          toolSlug="systemd-service-file-generator"
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
