'use client';

import { useCallback, useEffect, useState } from 'react';
import type { FileConstraints, FileProcessorFn, ManagedFile, ProcessResult } from '../types';
import { FileEngine } from '../services/FileEngine';

export function useFileEngine(options?: {
  constraints?: FileConstraints;
  processor?: FileProcessorFn;
}) {
  const [engine] = useState(() => new FileEngine());
  const [files, setFiles] = useState<ManagedFile[]>([]);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    engine.configure({
      constraints: options?.constraints,
      processor: options?.processor,
    });
  }, [engine, options?.constraints, options?.processor]);

  useEffect(() => {
    return () => engine.cleanup();
  }, [engine]);

  const sync = useCallback(
    (res: ProcessResult) => {
      setResult(res);
      setFiles(res.files);
    },
    []
  );

  const upload = useCallback(
    async (list: FileList | File[]) => {
      setLoading(true);
      const res = await engine.upload(list);
      sync(res);
      setLoading(false);
      return res;
    },
    [engine, sync]
  );

  const fromDrop = useCallback(
    async (dt: DataTransfer | null) => {
      setLoading(true);
      const res = await engine.fromDrop(dt);
      sync(res);
      setLoading(false);
      return res;
    },
    [engine, sync]
  );

  const remove = useCallback(
    (id: string) => {
      engine.remove(id);
      setFiles(engine.getFiles());
    },
    [engine]
  );

  return {
    files,
    result,
    loading,
    upload,
    fromDrop,
    fromPaste: engine.fromPaste.bind(engine),
    remove,
    replace: engine.replace.bind(engine),
    downloadOutput: engine.downloadOutput.bind(engine),
    copyText: engine.copyText.bind(engine),
    toLogicInput: engine.toLogicInput.bind(engine),
    cleanup: engine.cleanup.bind(engine),
  };
}
