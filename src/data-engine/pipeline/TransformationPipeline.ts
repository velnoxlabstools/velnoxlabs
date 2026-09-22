import type { TransformRequest, TransformResult } from '../types';
import { inputNormalizer } from '../normalizers';
import { outputNormalizer } from '../normalizers';
import { validatorManager } from '../validators';
import { formatterManager } from '../formatters';
import { parserManager } from '../parsers';
import { transformationRegistry } from '../transformers';

export class TransformationPipeline {
  async run(req: TransformRequest): Promise<TransformResult> {
    const stages: string[] = [];
    const started = Date.now();

    try {
      stages.push('input');
      const text = inputNormalizer.normalize(req.input);

      stages.push('validation');
      const vErr = validatorManager.validate(text, req.format ?? 'text');
      if (vErr) throw new Error(vErr);

      stages.push('normalization');

      stages.push('transformation');
      let data: unknown = text;
      const op = req.operation;
      const format = req.format ?? 'text';
      const key = `${op}:${req.targetFormat ?? format}`;

      const custom = transformationRegistry.get(key) ?? transformationRegistry.get(`${op}:${format}`);

      if (custom) {
        data = await custom(text, req.options);
      } else if (op === 'parse') {
        const parsed = parserManager.parse(text, format);
        if (!parsed.ok) throw new Error(parsed.error);
        data = parsed.data;
      } else if (op === 'beautify' || op === 'format') {
        data = formatterManager.beautify(text, format);
      } else if (op === 'minify') {
        data = formatterManager.minify(text, format);
      } else if (op === 'validate') {
        data = { valid: true };
      } else if (op === 'clean') {
        data = await (transformationRegistry.get('clean:text')?.(text) ?? text);
      } else if (op === 'encode' && (req.targetFormat === 'base64' || format === 'base64')) {
        data = await transformationRegistry.get('encode:base64')!(text);
      } else if (op === 'decode' && (req.targetFormat === 'base64' || format === 'base64')) {
        data = await transformationRegistry.get('decode:base64')!(text);
      } else if (op === 'encode' && (req.targetFormat === 'url' || format === 'url')) {
        data = await transformationRegistry.get('encode:url')!(text);
      } else if (op === 'decode' && (req.targetFormat === 'url' || format === 'url')) {
        data = await transformationRegistry.get('decode:url')!(text);
      } else {
        data = text;
      }

      stages.push('formatting');
      const output = outputNormalizer.normalize(data);

      stages.push('output-validation');
      stages.push('result');

      return {
        ok: true,
        output,
        data,
        format: req.targetFormat ?? format,
        stages,
        durationMs: Date.now() - started,
      };
    } catch (e) {
      return {
        ok: false,
        error: e instanceof Error ? e.message : 'Transformation failed',
        stages,
        durationMs: Date.now() - started,
      };
    }
  }
}

export const transformationPipeline = new TransformationPipeline();
