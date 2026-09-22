import type { TransformerFn } from '../types';
import { formatterManager } from '../formatters';
import { parserManager } from '../parsers';
import { asText } from '../utils';

export const encodeBase64: TransformerFn = (input) => {
  const text = asText(input);
  if (typeof btoa === 'function') return btoa(unescape(encodeURIComponent(text)));
  return Buffer.from(text, 'utf8').toString('base64');
};

export const decodeBase64: TransformerFn = (input) => {
  const text = asText(input);
  try {
    if (typeof atob === 'function') return decodeURIComponent(escape(atob(text)));
    return Buffer.from(text, 'base64').toString('utf8');
  } catch (e) {
    throw new Error(e instanceof Error ? e.message : 'Base64 decode failed');
  }
};

export const encodeUrl: TransformerFn = (input) => encodeURIComponent(asText(input));
export const decodeUrl: TransformerFn = (input) => decodeURIComponent(asText(input));

export const beautifyJson: TransformerFn = (input) => formatterManager.beautify(asText(input), 'json');
export const minifyJson: TransformerFn = (input) => formatterManager.minify(asText(input), 'json');

export const parseJson: TransformerFn = (input) => {
  const r = parserManager.parse(asText(input), 'json');
  if (!r.ok) throw new Error(r.error);
  return r.data;
};

export const cleanText: TransformerFn = (input) =>
  asText(input).replace(/\r\n/g, '\n').replace(/[ \t]+\n/g, '\n').trim();

export const builtinTransformers: Record<string, TransformerFn> = {
  'encode:base64': encodeBase64,
  'decode:base64': decodeBase64,
  'encode:url': encodeUrl,
  'decode:url': decodeUrl,
  'beautify:json': beautifyJson,
  'minify:json': minifyJson,
  'parse:json': parseJson,
  'clean:text': cleanText,
};
