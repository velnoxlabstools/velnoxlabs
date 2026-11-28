'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import {
  Sparkles,
  Copy,
  Check,
  Terminal,
  Layers,
  ArrowRightLeft,
  Download,
  Code2,
  Info,
} from 'lucide-react';

type Mode = 'curl-to-code' | 'http-to-curl' | 'python-to-curl';
type OutputTab = 'requests' | 'httpx' | 'postman' | 'http' | 'java';

interface ParsedCurl {
  rawUrl: string;
  baseUrl: string;
  queryParams: Record<string, string>;
  method: string;
  headers: Record<string, string>;
  body: string;
  auth: { user: string; pass: string } | null;
  cookies: Record<string, string>;
  userAgent?: string;
}

// Quote-aware tokenizer supporting Unix '\' and Windows CMD '^' line continuations
function tokenizeCurl(str: string): string[] {
  const normalized = str
    .replace(/\\[\r\n]+\s*/g, ' ')
    .replace(/\^[\r\n]+\s*/g, ' ')
    .trim();

  const tokens: string[] = [];
  let current = '';
  let quote: string | null = null;
  let i = 0;

  while (i < normalized.length) {
    const ch = normalized[i];

    if (quote) {
      if (ch === '\\' && i + 1 < normalized.length) {
        current += normalized[i + 1];
        i += 2;
        continue;
      }
      if (ch === quote) {
        quote = null;
        tokens.push(current);
        current = '';
        i++;
        continue;
      }
      current += ch;
      i++;
      continue;
    }

    if (ch === '"' || ch === "'") {
      quote = ch;
      i++;
      continue;
    }

    if (/\s/.test(ch)) {
      if (current) {
        tokens.push(current);
        current = '';
      }
      i++;
      continue;
    }

    current += ch;
    i++;
  }

  if (current) tokens.push(current);
  return tokens;
}

function parseCurl(str: string): ParsedCurl {
  const tokens = tokenizeCurl(str);
  let rawUrl = '';
  let method = 'GET';
  const headers: Record<string, string> = {};
  let body = '';
  let auth: { user: string; pass: string } | null = null;
  const cookies: Record<string, string> = {};
  let userAgent = '';
  let isGetFlag = false;

  let i = 0;
  if (tokens[0] === 'curl') i = 1;

  while (i < tokens.length) {
    const tok = tokens[i];

    // Method
    if (tok === '-X' || tok === '--request') {
      method = (tokens[i + 1] || 'GET').toUpperCase();
      i += 2;
      continue;
    }

    // Force GET
    if (tok === '-G' || tok === '--get') {
      isGetFlag = true;
      method = 'GET';
      i += 1;
      continue;
    }

    // Header
    if (tok === '-H' || tok === '--header') {
      const h = tokens[i + 1] || '';
      const idx = h.indexOf(':');
      if (idx !== -1) {
        const key = h.slice(0, idx).trim();
        const val = h.slice(idx + 1).trim();
        headers[key] = val;
      }
      i += 2;
      continue;
    }

    // Data / Body
    if (
      tok === '-d' ||
      tok === '--data' ||
      tok === '--data-raw' ||
      tok === '--data-binary' ||
      tok === '--data-urlencode' ||
      tok === '--data-ascii'
    ) {
      const val = tokens[i + 1] || '';
      body = body ? `${body}&${val}` : val;
      if (!isGetFlag && method === 'GET') {
        method = 'POST';
      }
      i += 2;
      continue;
    }

    // Multipart Form
    if (tok === '-F' || tok === '--form') {
      const formVal = tokens[i + 1] || '';
      body = body ? `${body}\n${formVal}` : formVal;
      if (!headers['Content-Type']) {
        headers['Content-Type'] = 'multipart/form-data';
      }
      if (method === 'GET') method = 'POST';
      i += 2;
      continue;
    }

    // URL flag
    if (tok === '--url') {
      rawUrl = tokens[i + 1] || '';
      i += 2;
      continue;
    }

    // Basic auth
    if (tok === '-u' || tok === '--user') {
      const creds = tokens[i + 1] || '';
      const cIdx = creds.indexOf(':');
      if (cIdx !== -1) {
        auth = {
          user: creds.slice(0, cIdx),
          pass: creds.slice(cIdx + 1),
        };
      } else {
        auth = { user: creds, pass: '' };
      }
      i += 2;
      continue;
    }

    // User Agent
    if (tok === '-A' || tok === '--user-agent') {
      userAgent = tokens[i + 1] || '';
      headers['User-Agent'] = userAgent;
      i += 2;
      continue;
    }

    // Cookie
    if (tok === '-b' || tok === '--cookie') {
      const cookieStr = tokens[i + 1] || '';
      cookieStr.split(';').forEach((pair) => {
        const eqIdx = pair.indexOf('=');
        if (eqIdx !== -1) {
          cookies[pair.slice(0, eqIdx).trim()] = pair.slice(eqIdx + 1).trim();
        }
      });
      headers['Cookie'] = cookieStr;
      i += 2;
      continue;
    }

    // Known boolean flags
    if (
      tok === '-s' ||
      tok === '--silent' ||
      tok === '-L' ||
      tok === '--location' ||
      tok === '-k' ||
      tok === '--insecure' ||
      tok === '--compressed' ||
      tok === '-v' ||
      tok === '--verbose' ||
      tok === '-i' ||
      tok === '--include' ||
      tok === '-f' ||
      tok === '--fail'
    ) {
      i += 1;
      continue;
    }

    // Short flag with value
    if (tok.startsWith('-') && !tok.startsWith('--') && tok.length === 2) {
      i += 2;
      continue;
    }

    // Long flag
    if (tok.startsWith('--')) {
      i += 1;
      continue;
    }

    // First bare URL
    if (!rawUrl && (tok.startsWith('http://') || tok.startsWith('https://') || tok.includes('.'))) {
      rawUrl = tok;
      i += 1;
      continue;
    }

    i += 1;
  }

  // Extract query parameters from URL
  let baseUrl = rawUrl;
  const queryParams: Record<string, string> = {};

  if (rawUrl) {
    try {
      const fullUrl =
        rawUrl.startsWith('http://') || rawUrl.startsWith('https://')
          ? rawUrl
          : `https://${rawUrl}`;
      const urlObj = new URL(fullUrl);
      baseUrl = `${urlObj.origin}${urlObj.pathname}`;
      urlObj.searchParams.forEach((val, key) => {
        queryParams[key] = val;
      });
    } catch {
      const qIdx = rawUrl.indexOf('?');
      if (qIdx !== -1) {
        baseUrl = rawUrl.slice(0, qIdx);
        const search = rawUrl.slice(qIdx + 1);
        const params = new URLSearchParams(search);
        params.forEach((val, key) => {
          queryParams[key] = val;
        });
      }
    }
  }

  return {
    rawUrl,
    baseUrl: baseUrl || rawUrl,
    queryParams,
    method,
    headers,
    body,
    auth,
    cookies,
    userAgent,
  };
}

function parseJsonSafe(str: string): Record<string, unknown> | unknown[] | null {
  if (!str.trim()) return null;
  try {
    const parsed = JSON.parse(str);
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

// Convert parsed cURL to idiomatic Python requests
function generatePythonRequests(parsed: ParsedCurl): string {
  const { baseUrl, queryParams, method, headers, body, auth, cookies } = parsed;
  if (!baseUrl && !parsed.rawUrl) {
    return '# ⚠️ Could not detect a valid URL in the cURL command.';
  }

  const targetUrl = baseUrl || parsed.rawUrl;
  const bodyObj = parseJsonSafe(body);
  const paramEntries = Object.entries(queryParams);
  const headerEntries = Object.entries(headers).filter(
    ([k]) => !auth || k.toLowerCase() !== 'authorization'
  );
  const cookieEntries = Object.entries(cookies);

  let code = 'import requests\n\n';
  code += `url = "${targetUrl}"\n`;

  // Query Params
  if (paramEntries.length > 0) {
    code += '\nparams = {\n';
    paramEntries.forEach(([k, v]) => {
      code += `    "${k}": "${v.replace(/"/g, '\\"')}",\n`;
    });
    code += '}\n';
  }

  // Headers
  if (headerEntries.length > 0) {
    code += '\nheaders = {\n';
    headerEntries.forEach(([k, v]) => {
      code += `    "${k}": "${v.replace(/"/g, '\\"')}",\n`;
    });
    code += '}\n';
  }

  // Cookies
  if (cookieEntries.length > 0) {
    code += '\ncookies = {\n';
    cookieEntries.forEach(([k, v]) => {
      code += `    "${k}": "${v.replace(/"/g, '\\"')}",\n`;
    });
    code += '}\n';
  }

  // Auth
  if (auth) {
    code += `\nauth = ("${auth.user.replace(/"/g, '\\"')}", "${auth.pass.replace(/"/g, '\\"')}")\n`;
  }

  // Payload
  if (bodyObj !== null) {
    const pyJson = JSON.stringify(bodyObj, null, 4)
      .replace(/\btrue\b/g, 'True')
      .replace(/\bfalse\b/g, 'False')
      .replace(/\bnull\b/g, 'None');
    code += `\npayload = ${pyJson}\n`;
  } else if (body) {
    code += `\npayload = ${JSON.stringify(body)}\n`;
  }

  code += '\n';

  // Request call construction
  const args: string[] = ['url'];
  if (paramEntries.length > 0) args.push('params=params');
  if (headerEntries.length > 0) args.push('headers=headers');
  if (cookieEntries.length > 0) args.push('cookies=cookies');
  if (auth) args.push('auth=auth');

  if (bodyObj !== null) {
    args.push('json=payload');
  } else if (body) {
    args.push('data=payload');
  }

  args.push('timeout=30');

  const methodLower = method.toLowerCase();
  code += `response = requests.${methodLower}(${args.join(', ')})\n\n`;
  code += 'print(f"Status: {response.status_code}")\n';
  code += 'try:\n';
  code += '    print(response.json())\n';
  code += 'except requests.exceptions.JSONDecodeError:\n';
  code += '    print(response.text)\n';

  return code;
}

// Convert parsed cURL to Python HTTPX (sync & async ready)
function generatePythonHttpx(parsed: ParsedCurl): string {
  const { baseUrl, queryParams, method, headers, body, auth } = parsed;
  const targetUrl = baseUrl || parsed.rawUrl;
  const bodyObj = parseJsonSafe(body);
  const paramEntries = Object.entries(queryParams);
  const headerEntries = Object.entries(headers).filter(
    ([k]) => !auth || k.toLowerCase() !== 'authorization'
  );

  let code = 'import httpx\n\n';
  code += `url = "${targetUrl}"\n`;

  if (paramEntries.length > 0) {
    code += '\nparams = {\n';
    paramEntries.forEach(([k, v]) => {
      code += `    "${k}": "${v.replace(/"/g, '\\"')}",\n`;
    });
    code += '}\n';
  }

  if (headerEntries.length > 0) {
    code += '\nheaders = {\n';
    headerEntries.forEach(([k, v]) => {
      code += `    "${k}": "${v.replace(/"/g, '\\"')}",\n`;
    });
    code += '}\n';
  }

  if (auth) {
    code += `\nauth = ("${auth.user.replace(/"/g, '\\"')}", "${auth.pass.replace(/"/g, '\\"')}")\n`;
  }

  if (bodyObj !== null) {
    const pyJson = JSON.stringify(bodyObj, null, 4)
      .replace(/\btrue\b/g, 'True')
      .replace(/\bfalse\b/g, 'False')
      .replace(/\bnull\b/g, 'None');
    code += `\npayload = ${pyJson}\n`;
  } else if (body) {
    code += `\npayload = ${JSON.stringify(body)}\n`;
  }

  code += '\n# Synchronous execution\n';
  code += 'with httpx.Client(timeout=30.0) as client:\n';
  const args: string[] = [`"${method}"`, 'url'];
  if (paramEntries.length > 0) args.push('params=params');
  if (headerEntries.length > 0) args.push('headers=headers');
  if (auth) args.push('auth=auth');
  if (bodyObj !== null) {
    args.push('json=payload');
  } else if (body) {
    args.push('content=payload');
  }

  code += `    response = client.request(${args.join(', ')})\n`;
  code += '    print(response.status_code)\n';
  code += '    print(response.text)\n\n';

  code += '# Async execution (for FastAPI / Asyncio):\n';
  code += '# async with httpx.AsyncClient(timeout=30.0) as client:\n';
  code += `#     response = await client.request(${args.join(', ')})\n`;

  return code;
}

// Convert parsed cURL to Postman Collection v2.1.0 JSON
function generatePostmanCollection(parsed: ParsedCurl): string {
  const targetUrl = parsed.rawUrl || parsed.baseUrl || 'https://api.example.com';
  let urlObj: URL | null = null;
  try {
    urlObj = new URL(targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`);
  } catch {
    urlObj = null;
  }

  const protocol = urlObj ? urlObj.protocol.replace(':', '') : 'https';
  const host = urlObj ? urlObj.hostname.split('.') : ['api', 'example', 'com'];
  const path = urlObj ? urlObj.pathname.split('/').filter(Boolean) : ['v1', 'endpoint'];

  const queryArray = Object.entries(parsed.queryParams).map(([key, value]) => ({
    key,
    value,
    description: '',
  }));

  const headersArray = Object.entries(parsed.headers).map(([key, value]) => ({
    key,
    value,
    type: 'text',
  }));

  const bodyObj = parseJsonSafe(parsed.body);
  let postmanBody: Record<string, unknown> | undefined = undefined;

  if (parsed.body) {
    if (bodyObj !== null) {
      postmanBody = {
        mode: 'raw',
        raw: JSON.stringify(bodyObj, null, 2),
        options: {
          raw: {
            language: 'json',
          },
        },
      };
    } else {
      postmanBody = {
        mode: 'raw',
        raw: parsed.body,
        options: {
          raw: {
            language: 'text',
          },
        },
      };
    }
  }

  const collection = {
    info: {
      _postman_id: `velnox-${Date.now()}`,
      name: `cURL Import - ${parsed.method} ${path[path.length - 1] || 'Request'}`,
      description: 'Exported from VelnoxLabs cURL to Postman & Python Requests Converter',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    item: [
      {
        name: `${parsed.method} ${urlObj ? urlObj.pathname : targetUrl}`,
        request: {
          method: parsed.method,
          header: headersArray,
          body: postmanBody,
          url: {
            raw: targetUrl,
            protocol,
            host,
            path,
            query: queryArray.length > 0 ? queryArray : undefined,
          },
          description: `Converted from cURL: ${parsed.method} ${targetUrl}`,
        },
        response: [],
      },
    ],
  };

  return JSON.stringify(collection, null, 2);
}

// Convert parsed cURL to RFC 7230 Raw HTTP Request format
function generateRawHttp(parsed: ParsedCurl): string {
  const targetUrl = parsed.rawUrl || parsed.baseUrl || 'https://api.example.com';
  let host = 'api.example.com';
  let path = '/';

  try {
    const u = new URL(targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`);
    host = u.host;
    path = `${u.pathname}${u.search}`;
  } catch {
    const slashIdx = targetUrl.indexOf('/');
    if (slashIdx !== -1) {
      host = targetUrl.slice(0, slashIdx);
      path = targetUrl.slice(slashIdx);
    }
  }

  let raw = `${parsed.method} ${path} HTTP/1.1\r\n`;
  raw += `Host: ${host}\r\n`;

  const headers = { ...parsed.headers };
  if (!headers['User-Agent'] && parsed.userAgent) {
    headers['User-Agent'] = parsed.userAgent;
  }
  if (!headers['Accept']) {
    headers['Accept'] = '*/*';
  }
  if (parsed.body && !headers['Content-Length']) {
    headers['Content-Length'] = String(new TextEncoder().encode(parsed.body).length);
  }

  Object.entries(headers).forEach(([k, v]) => {
    if (k.toLowerCase() !== 'host') {
      raw += `${k}: ${v}\r\n`;
    }
  });

  raw += '\r\n';
  if (parsed.body) {
    raw += parsed.body;
  }

  return raw;
}

// Convert parsed cURL to modern Java 11+ HttpClient
function generateJava(parsed: ParsedCurl): string {
  const targetUrl = parsed.rawUrl || parsed.baseUrl || 'https://api.example.com';
  const method = parsed.method;
  const isPostOrPut = ['POST', 'PUT', 'PATCH'].includes(method);

  let code = `import java.net.URI;\nimport java.net.http.HttpClient;\nimport java.net.http.HttpRequest;\nimport java.net.http.HttpResponse;\nimport java.time.Duration;\n\n`;
  code += `public class ApiClient {\n`;
  code += `    public static void main(String[] args) throws Exception {\n`;
  code += `        HttpClient client = HttpClient.newBuilder()\n`;
  code += `            .connectTimeout(Duration.ofSeconds(10))\n`;
  code += `            .build();\n\n`;

  code += `        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()\n`;
  code += `            .uri(URI.create("${targetUrl}"))\n`;
  code += `            .timeout(Duration.ofSeconds(30));\n\n`;

  Object.entries(parsed.headers).forEach(([k, v]) => {
    code += `        requestBuilder.header("${k}", "${v.replace(/"/g, '\\"')}");\n`;
  });

  if (isPostOrPut && parsed.body) {
    code += `\n        String payload = ${JSON.stringify(parsed.body)};\n`;
    code += `        requestBuilder.method("${method}", HttpRequest.BodyPublishers.ofString(payload));\n`;
  } else if (isPostOrPut) {
    code += `\n        requestBuilder.method("${method}", HttpRequest.BodyPublishers.noBody());\n`;
  } else {
    code += `\n        requestBuilder.method("${method}", HttpRequest.BodyPublishers.noBody());\n`;
  }

  code += `\n        HttpRequest request = requestBuilder.build();\n`;
  code += `        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());\n\n`;
  code += `        System.out.println("Status: " + response.statusCode());\n`;
  code += `        System.out.println(response.body());\n`;
  code += `    }\n`;
  code += `}\n`;

  return code;
}

// Reverse parser: Raw HTTP / JSON to clean cURL command
function parseHttpToCurl(rawHttp: string): string {
  const trimmed = rawHttp.trim();
  if (!trimmed) return '';

  const lines = trimmed.split(/\r?\n/);
  const firstLine = lines[0].trim();
  const requestLineMatch = firstLine.match(/^([A-Z]+)\s+([^\s]+)(?:\s+HTTP\/[0-9.]+)?$/i);

  let method = 'GET';
  let path = '/';

  if (requestLineMatch) {
    method = requestLineMatch[1].toUpperCase();
    path = requestLineMatch[2];
  }

  const headers: Record<string, string> = {};
  let bodyStartIndex = -1;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === '') {
      bodyStartIndex = i + 1;
      break;
    }
    const colonIdx = line.indexOf(':');
    if (colonIdx !== -1) {
      const key = line.slice(0, colonIdx).trim();
      const val = line.slice(colonIdx + 1).trim();
      headers[key] = val;
    }
  }

  const hostHeader = Object.keys(headers).find((k) => k.toLowerCase() === 'host');
  const host = hostHeader ? headers[hostHeader] : 'api.example.com';
  const protocol = host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https';

  const fullUrl =
    path.startsWith('http://') || path.startsWith('https://')
      ? path
      : `${protocol}://${host}${path.startsWith('/') ? path : `/${path}`}`;

  let body = '';
  if (bodyStartIndex !== -1 && bodyStartIndex < lines.length) {
    body = lines.slice(bodyStartIndex).join('\n').trim();
  }

  let curl = `curl -X ${method} "${fullUrl}"`;

  Object.entries(headers).forEach(([k, v]) => {
    if (k.toLowerCase() !== 'host' && k.toLowerCase() !== 'content-length') {
      curl += ` \\\n  -H "${k}: ${v.replace(/"/g, '\\"')}"`;
    }
  });

  if (body) {
    // If single line or json
    const escapedBody = body.replace(/'/g, "'\\''");
    curl += ` \\\n  -d '${escapedBody}'`;
  }

  return curl;
}

// Reverse parser: Python requests / HTTPX to executable cURL command
function parsePythonToCurl(pyCode: string): string {
  const trimmed = pyCode.trim();
  if (!trimmed) return '';

  const urlMatch = trimmed.match(/\burl\s*=\s*["']([^"']+)["']/i);
  let url = urlMatch ? urlMatch[1] : '';

  const methodMatch = trimmed.match(
    /(?:requests|client|httpx|session)\.(get|post|put|delete|patch|head|options)\s*\(\s*(?:url\s*,|["']([^"']+)["'])?/i
  );
  let method = 'GET';
  if (methodMatch) {
    method = methodMatch[1].toUpperCase();
    if (methodMatch[2] && !url) {
      url = methodMatch[2];
    }
  }

  if (!url) {
    const anyUrlMatch = trimmed.match(/["'](https?:\/\/[^"']+)["']/i);
    if (anyUrlMatch) {
      url = anyUrlMatch[1];
    }
  }

  const headers: Record<string, string> = {};
  const headersBlock = trimmed.match(/headers\s*=\s*\{([^}]+)\}/i);
  if (headersBlock) {
    const headerPairs = headersBlock[1].matchAll(/["']([^"']+)["']\s*:\s*["']([^"']*)["']/g);
    for (const match of headerPairs) {
      headers[match[1]] = match[2];
    }
  }

  const params: Record<string, string> = {};
  const paramsBlock = trimmed.match(/params\s*=\s*\{([^}]+)\}/i);
  if (paramsBlock) {
    const paramPairs = paramsBlock[1].matchAll(/["']([^"']+)["']\s*:\s*["']?([^"',}\s]+)["']?/g);
    for (const match of paramPairs) {
      params[match[1]] = match[2];
    }
  }

  let payload: unknown = null;
  const jsonBlock = trimmed.match(/(?:json|payload|data)\s*=\s*(\{[^}]+\}|\[[^\]]+\])/i);
  if (jsonBlock) {
    const rawJson = jsonBlock[1]
      .replace(/\bTrue\b/g, 'true')
      .replace(/\bFalse\b/g, 'false')
      .replace(/\bNone\b/g, 'null');
    try {
      const normalized = rawJson.replace(/'([^']*)'/g, '"$1"');
      payload = JSON.parse(normalized);
    } catch {
      payload = jsonBlock[1].trim();
    }
  }

  const authMatch = trimmed.match(/auth\s*=\s*\(\s*["']([^"']+)["']\s*,\s*["']([^"']*)["']\s*\)/i);
  const auth = authMatch ? `${authMatch[1]}:${authMatch[2]}` : '';

  if (!url) {
    return '# ⚠️ Could not find a valid target URL in the Python code.';
  }

  let finalUrl = url;
  const paramEntries = Object.entries(params);
  if (paramEntries.length > 0) {
    const queryStr = paramEntries
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
    finalUrl += (finalUrl.includes('?') ? '&' : '?') + queryStr;
  }

  const cmd: string[] = [`curl -X ${method} "${finalUrl}"`];

  if (auth) {
    cmd.push(`  -u "${auth}"`);
  }

  Object.entries(headers).forEach(([k, v]) => {
    cmd.push(`  -H "${k}: ${v.replace(/"/g, '\\"')}"`);
  });

  if (payload !== null) {
    if (typeof payload === 'object') {
      const hasContentType = Object.keys(headers).some((h) => h.toLowerCase() === 'content-type');
      if (!hasContentType) {
        cmd.push('  -H "Content-Type: application/json"');
      }
      cmd.push(`  -d '${JSON.stringify(payload)}'`);
    } else {
      cmd.push(`  -d '${String(payload)}'`);
    }
  }

  return cmd.join(' \\\n');
}

export default function CurlToPythonPage() {
  const tUI = useTranslations('ToolUI.curlToPython');

  const [mode, setMode] = useState<Mode>('curl-to-code');
  const [activeTab, setActiveTab] = useState<OutputTab>('requests');

  // Mode 1: cURL Input
  const [curlInput, setCurlInput] = useState(
    `curl -X POST "https://api.velnoxlabs.com/v1/analyze?format=summary" \\\n  -H "Authorization: Bearer velnox_sec_892b1" \\\n  -H "Content-Type: application/json" \\\n  -d '{"query":"data_pipeline","active":true,"limit":10}'`
  );

  // Mode 2: Raw HTTP Input
  const [rawHttpInput, setRawHttpInput] = useState(
    `POST /v1/analyze?format=summary HTTP/1.1\r\nHost: api.velnoxlabs.com\r\nAuthorization: Bearer velnox_sec_892b1\r\nContent-Type: application/json\r\n\r\n{"query":"data_pipeline","active":true,"limit":10}`
  );

  // Mode 3: Python requests Input
  const [pythonInput, setPythonInput] = useState(
    `import requests\n\nurl = "https://api.velnoxlabs.com/v1/users"\nheaders = {\n    "Authorization": "Bearer secret_123",\n    "Content-Type": "application/json"\n}\nparams = {\n    "page": 2,\n    "active": "true"\n}\npayload = {\n    "name": "Jane Doe",\n    "role": "engineer",\n    "active": True\n}\n\nresponse = requests.post(url, headers=headers, params=params, json=payload)`
  );

  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [error, setError] = useState('');

  // Parsed cURL
  const parsedCurl = useMemo<ParsedCurl | null>(() => {
    if (!curlInput.trim()) return null;
    try {
      return parseCurl(curlInput);
    } catch {
      return null;
    }
  }, [curlInput]);

  // Generated code by tab
  const outputCode = useMemo<string>(() => {
    if (mode === 'http-to-curl') {
      return parseHttpToCurl(rawHttpInput);
    }
    if (mode === 'python-to-curl') {
      return parsePythonToCurl(pythonInput);
    }

    if (!parsedCurl) return '';
    if (!parsedCurl.rawUrl && !parsedCurl.baseUrl) {
      return '# ⚠️ Could not find a valid URL in the cURL command.';
    }

    switch (activeTab) {
      case 'requests':
        return generatePythonRequests(parsedCurl);
      case 'httpx':
        return generatePythonHttpx(parsedCurl);
      case 'postman':
        return generatePostmanCollection(parsedCurl);
      case 'http':
        return generateRawHttp(parsedCurl);
      case 'java':
        return generateJava(parsedCurl);
      default:
        return generatePythonRequests(parsedCurl);
    }
  }, [mode, rawHttpInput, pythonInput, parsedCurl, activeTab]);

  useEffect(() => {
    if (mode === 'curl-to-code') {
      if (curlInput.trim() && !parsedCurl?.rawUrl && !parsedCurl?.baseUrl) {
        setError(tUI('errNoUrl'));
      } else {
        setError('');
      }
    } else if (mode === 'http-to-curl') {
      if (rawHttpInput.trim() && !outputCode) {
        setError(tUI('errParseFailed'));
      } else {
        setError('');
      }
    } else {
      if (pythonInput.trim() && !outputCode) {
        setError(tUI('errParseFailed'));
      } else {
        setError('');
      }
    }
  }, [mode, curlInput, parsedCurl, rawHttpInput, pythonInput, outputCode, tUI]);

  const handleCopy = () => {
    if (!outputCode) return;
    navigator.clipboard.writeText(outputCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPostman = () => {
    if (!parsedCurl) return;
    const postmanJson = generatePostmanCollection(parsedCurl);
    const blob = new Blob([postmanJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `postman_collection_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  // Presets for Mode 1
  const loadPreset1 = () => {
    setCurlInput(
      `curl -X POST "https://api.velnoxlabs.com/v1/analyze?format=summary" \\\n  -H "Authorization: Bearer velnox_sec_892b1" \\\n  -H "Content-Type: application/json" \\\n  -d '{"query":"data_pipeline","active":true,"limit":10}'`
    );
  };

  const loadPreset2 = () => {
    setCurlInput(
      `curl -X GET "https://api.example.com/v2/reports?startDate=2026-01-01&endDate=2026-11-25&status=completed" \\\n  -H "Accept: application/json" \\\n  -H "X-API-Key: live_secret_9941a8"`
    );
  };

  const loadPreset3 = () => {
    setCurlInput(
      `curl -X POST "https://auth.example.com/oauth/token" \\\n  -u "client_id_440:super_secret_key" \\\n  -H "Content-Type: application/x-www-form-urlencoded" \\\n  -d "grant_type=client_credentials&scope=read%20write"`
    );
  };

  const loadPreset4 = () => {
    setCurlInput(
      `curl -X POST "https://api.service.io/forms/submit" \\\n  -H "Content-Type: application/x-www-form-urlencoded" \\\n  -d "username=alex_dev&email=alex%40velnoxlabs.com&agreement=yes"`
    );
  };

  // Presets for Mode 2
  const loadHttpPreset1 = () => {
    setRawHttpInput(
      `POST /v1/payments/charge HTTP/1.1\r\nHost: api.stripe.com\r\nAuthorization: Bearer sk_test_51Mz98723\r\nContent-Type: application/json\r\n\r\n{"amount": 2500, "currency": "usd"}`
    );
  };

  const loadHttpPreset2 = () => {
    setRawHttpInput(
      `GET /v1/users?role=admin&limit=25 HTTP/1.1\r\nHost: api.github.com\r\nUser-Agent: VelnoxApp/1.0\r\nAccept: application/vnd.github.v3+json`
    );
  };

  // Presets for Mode 3 (Python to cURL)
  const loadPythonPreset1 = () => {
    setPythonInput(
      `import requests\n\nurl = "https://api.velnoxlabs.com/v1/users"\nheaders = {\n    "Authorization": "Bearer secret_123",\n    "Content-Type": "application/json"\n}\nparams = {\n    "page": 2,\n    "active": "true"\n}\npayload = {\n    "name": "Jane Doe",\n    "role": "engineer",\n    "active": True\n}\n\nresponse = requests.post(url, headers=headers, params=params, json=payload)`
    );
  };

  const loadPythonPreset2 = () => {
    setPythonInput(
      `import requests\n\nurl = "https://api.github.com/user/repos"\nheaders = {\n    "Accept": "application/vnd.github.v3+json",\n    "User-Agent": "VelnoxApp"\n}\nauth = ("developer_user", "ghp_secretToken123")\nparams = {\n    "visibility": "public",\n    "sort": "created"\n}\n\nresponse = requests.get(url, headers=headers, params=params, auth=auth)`
    );
  };

  return (
    <>
      <GlobalContainer maxWidth="2xl">
        <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          <SectionHeading
            title={tUI('title')}
            subtitle={tUI('subtitle')}
            toolSlug="curl-to-python-requests-converter"
          />

          {/* Mode Selector Toggle */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              marginTop: 'var(--space-6)',
              marginBottom: '16px',
            }}
          >
            <button
              onClick={() => setMode('curl-to-code')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                backgroundColor:
                  mode === 'curl-to-code' ? 'var(--primary-color)' : 'var(--bg-card)',
                color: mode === 'curl-to-code' ? '#ffffff' : 'var(--text-main)',
                border:
                  mode === 'curl-to-code'
                    ? '1px solid var(--primary-color)'
                    : '1px solid var(--border-color)',
              }}
            >
              <Terminal size={16} />
              {tUI('modeCurlToCode')}
            </button>
            <button
              onClick={() => setMode('http-to-curl')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                backgroundColor:
                  mode === 'http-to-curl' ? 'var(--primary-color)' : 'var(--bg-card)',
                color: mode === 'http-to-curl' ? '#ffffff' : 'var(--text-main)',
                border:
                  mode === 'http-to-curl'
                    ? '1px solid var(--primary-color)'
                    : '1px solid var(--border-color)',
              }}
            >
              <ArrowRightLeft size={16} />
              {tUI('modeHttpToCurl')}
            </button>
            <button
              onClick={() => setMode('python-to-curl')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                backgroundColor:
                  mode === 'python-to-curl' ? 'var(--primary-color)' : 'var(--bg-card)',
                color: mode === 'python-to-curl' ? '#ffffff' : 'var(--text-main)',
                border:
                  mode === 'python-to-curl'
                    ? '1px solid var(--primary-color)'
                    : '1px solid var(--border-color)',
              }}
            >
              <Code2 size={16} />
              {tUI('modePythonToCurl')}
            </button>
          </div>

          {/* Example Presets Bar */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '10px 14px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                fontWeight: 600,
                marginRight: '4px',
              }}
            >
              <Sparkles size={14} color="#f59e0b" />
              <span>{tUI('examplePresets')}</span>
            </div>

            {mode === 'curl-to-code' ? (
              <>
                <button
                  onClick={loadPreset1}
                  style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    color: '#60a5fa',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  ⚡ {tUI('presetPostJson')}
                </button>
                <button
                  onClick={loadPreset2}
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    color: '#34d399',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  ⚡ {tUI('presetGetParams')}
                </button>
                <button
                  onClick={loadPreset3}
                  style={{
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    color: '#fbbf24',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  ⚡ {tUI('presetBasicAuth')}
                </button>
                <button
                  onClick={loadPreset4}
                  style={{
                    backgroundColor: 'rgba(168, 85, 247, 0.1)',
                    color: '#c084fc',
                    border: '1px solid rgba(168, 85, 247, 0.25)',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  ⚡ {tUI('presetFormUrlencoded')}
                </button>
                <button
                  onClick={() => setCurlInput('')}
                  style={{
                    marginLeft: 'auto',
                    backgroundColor: 'transparent',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                  }}
                >
                  {tUI('clear')}
                </button>
              </>
            ) : mode === 'http-to-curl' ? (
              <>
                <button
                  onClick={loadHttpPreset1}
                  style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    color: '#60a5fa',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  ⚡ {tUI('presetHttpRaw')}
                </button>
                <button
                  onClick={loadHttpPreset2}
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    color: '#34d399',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  ⚡ GET with Headers
                </button>
                <button
                  onClick={() => setRawHttpInput('')}
                  style={{
                    marginLeft: 'auto',
                    backgroundColor: 'transparent',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                  }}
                >
                  {tUI('clear')}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={loadPythonPreset1}
                  style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    color: '#60a5fa',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  ⚡ {tUI('presetPythonPost')}
                </button>
                <button
                  onClick={loadPythonPreset2}
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    color: '#34d399',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  ⚡ GET with Auth & Headers
                </button>
                <button
                  onClick={() => setPythonInput('')}
                  style={{
                    marginLeft: 'auto',
                    backgroundColor: 'transparent',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                  }}
                >
                  {tUI('clear')}
                </button>
              </>
            )}
          </div>

          {/* Request Inspector (Mode 1 only) */}
          {mode === 'curl-to-code' && parsedCurl && parsedCurl.rawUrl && (
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '12px 16px',
                marginBottom: '16px',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '12px',
                fontSize: '0.8rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                }}
              >
                <Layers size={15} color="var(--primary-color)" />
                <span>{tUI('requestInspector')}:</span>
              </div>

              {/* Method Badge */}
              <span
                style={{
                  backgroundColor:
                    parsedCurl.method === 'POST'
                      ? 'rgba(16, 185, 129, 0.2)'
                      : parsedCurl.method === 'GET'
                        ? 'rgba(59, 130, 246, 0.2)'
                        : 'rgba(245, 158, 11, 0.2)',
                  color:
                    parsedCurl.method === 'POST'
                      ? '#34d399'
                      : parsedCurl.method === 'GET'
                        ? '#60a5fa'
                        : '#fbbf24',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                }}
              >
                {parsedCurl.method}
              </span>

              {/* Host/URL Preview */}
              <span
                style={{
                  color: 'var(--text-main)',
                  fontFamily: 'monospace',
                  fontSize: '0.78rem',
                  maxWidth: '340px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={parsedCurl.rawUrl}
              >
                {parsedCurl.baseUrl || parsedCurl.rawUrl}
              </span>

              {/* Headers count badge */}
              <span
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-muted)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                }}
              >
                {tUI('headersCount', { count: Object.keys(parsedCurl.headers).length })}
              </span>

              {/* Params count badge */}
              {Object.keys(parsedCurl.queryParams).length > 0 && (
                <span
                  style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    color: '#60a5fa',
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}
                >
                  {tUI('queryParamsCount', {
                    count: Object.keys(parsedCurl.queryParams).length,
                  })}
                </span>
              )}

              {/* Payload indicator */}
              {parsedCurl.body && (
                <span
                  style={{
                    backgroundColor: 'rgba(168, 85, 247, 0.15)',
                    color: '#c084fc',
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}
                >
                  Payload: {parsedCurl.body.length} chars
                </span>
              )}
            </div>
          )}

          {/* MAIN TOOL WORKSPACE */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '24px',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '20px',
              }}
            >
              {/* LEFT COLUMN: Input */}
              <div>
                <label
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '8px',
                  }}
                >
                  <Terminal size={15} color="var(--primary-color)" />
                  {mode === 'curl-to-code'
                    ? tUI('curlCommand')
                    : mode === 'http-to-curl'
                      ? tUI('rawHttpLabel')
                      : tUI('pythonCodeLabel')}
                </label>
                <textarea
                  value={
                    mode === 'curl-to-code'
                      ? curlInput
                      : mode === 'http-to-curl'
                        ? rawHttpInput
                        : pythonInput
                  }
                  onChange={(e) => {
                    if (mode === 'curl-to-code') {
                      setCurlInput(e.target.value);
                    } else if (mode === 'http-to-curl') {
                      setRawHttpInput(e.target.value);
                    } else {
                      setPythonInput(e.target.value);
                    }
                  }}
                  rows={16}
                  placeholder={
                    mode === 'curl-to-code'
                      ? tUI('curlPlaceholder')
                      : mode === 'http-to-curl'
                        ? tUI('rawHttpPlaceholder')
                        : tUI('pythonPlaceholder')
                  }
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    padding: '12px',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    outline: 'none',
                    resize: 'vertical',
                    lineHeight: '1.5',
                  }}
                />
              </div>

              {/* RIGHT COLUMN: Output with Language Tabs */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                    gap: '8px',
                  }}
                >
                  {/* Language Tabs (Mode 1) */}
                  {mode === 'curl-to-code' ? (
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '4px',
                        backgroundColor: 'var(--bg-page)',
                        padding: '3px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <button
                        onClick={() => setActiveTab('requests')}
                        style={{
                          backgroundColor:
                            activeTab === 'requests' ? 'var(--primary-color)' : 'transparent',
                          color: activeTab === 'requests' ? '#ffffff' : 'var(--text-muted)',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 10px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {tUI('tabPython')}
                      </button>
                      <button
                        onClick={() => setActiveTab('httpx')}
                        style={{
                          backgroundColor:
                            activeTab === 'httpx' ? 'var(--primary-color)' : 'transparent',
                          color: activeTab === 'httpx' ? '#ffffff' : 'var(--text-muted)',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 10px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {tUI('tabHttpx')}
                      </button>
                      <button
                        onClick={() => setActiveTab('postman')}
                        style={{
                          backgroundColor: activeTab === 'postman' ? '#ef5b25' : 'transparent',
                          color: activeTab === 'postman' ? '#ffffff' : 'var(--text-muted)',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 10px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {tUI('tabPostman')}
                      </button>
                      <button
                        onClick={() => setActiveTab('http')}
                        style={{
                          backgroundColor:
                            activeTab === 'http' ? 'var(--primary-color)' : 'transparent',
                          color: activeTab === 'http' ? '#ffffff' : 'var(--text-muted)',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 10px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {tUI('tabHttp')}
                      </button>
                      <button
                        onClick={() => setActiveTab('java')}
                        style={{
                          backgroundColor:
                            activeTab === 'java' ? 'var(--primary-color)' : 'transparent',
                          color: activeTab === 'java' ? '#ffffff' : 'var(--text-muted)',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 10px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {tUI('tabJava')}
                      </button>
                    </div>
                  ) : (
                    <label
                      style={{
                        color: 'var(--text-main)',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Code2 size={15} color="var(--primary-color)" />
                      {tUI('generatedCurlLabel')}
                    </label>
                  )}

                  {/* Actions: Download Postman JSON / Copy Code */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {mode === 'curl-to-code' && activeTab === 'postman' && (
                      <button
                        onClick={handleDownloadPostman}
                        disabled={!outputCode}
                        style={{
                          backgroundColor: 'rgba(239, 91, 37, 0.15)',
                          color: '#fb923c',
                          border: '1px solid rgba(239, 91, 37, 0.35)',
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: outputCode ? 'pointer' : 'not-allowed',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Download size={13} />
                        {downloaded ? tUI('downloaded') : tUI('downloadPostman')}
                      </button>
                    )}

                    <button
                      onClick={handleCopy}
                      disabled={!outputCode}
                      style={{
                        backgroundColor: outputCode
                          ? 'rgba(59, 130, 246, 0.15)'
                          : 'rgba(255,255,255,0.05)',
                        color: outputCode ? '#60a5fa' : '#64748b',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '6px',
                        padding: '4px 12px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: outputCode ? 'pointer' : 'not-allowed',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {copied ? <Check size={13} /> : <Copy size={13} />}
                      {copied ? tUI('copied') : tUI('copyCode')}
                    </button>
                  </div>
                </div>

                <textarea
                  value={outputCode}
                  readOnly
                  rows={16}
                  placeholder={tUI('pythonPlaceholder')}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color:
                      activeTab === 'postman'
                        ? '#fb923c'
                        : activeTab === 'java'
                          ? '#f472b6'
                          : '#34d399',
                    padding: '12px',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    outline: 'none',
                    resize: 'vertical',
                    lineHeight: '1.5',
                  }}
                />

                {/* Postman Quick Import Tip */}
                {mode === 'curl-to-code' && activeTab === 'postman' && (
                  <div
                    style={{
                      marginTop: '8px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      backgroundColor: 'rgba(239, 91, 37, 0.08)',
                      border: '1px solid rgba(239, 91, 37, 0.2)',
                      padding: '8px 12px',
                      borderRadius: '6px',
                    }}
                  >
                    <Info size={14} color="#fb923c" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span>{tUI('postmanImportTip')}</span>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div
                style={{
                  marginTop: '12px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  padding: '12px',
                }}
              >
                <p style={{ color: '#f87171', fontSize: '0.85rem', margin: 0 }}>❌ {error}</p>
              </div>
            )}
          </div>

          <ToolSeoContent
            toolSlug="curl-to-python-requests-converter"
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
