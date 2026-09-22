import type { ToolManifest } from '../types/registration';
import { APP_NAME } from '@/constants';

export interface ResolvedToolMetadata {
  title: string;
  description: string;
  keywords: string[];
  noIndex: boolean;
}

export class ToolMetadataResolver {
  resolve(manifest: ToolManifest): ResolvedToolMetadata {
    return {
      title: manifest.metadata?.title ?? `${manifest.name} | ${APP_NAME}`,
      description: manifest.metadata?.description ?? manifest.description,
      keywords: manifest.metadata?.keywords ?? [
        manifest.name,
        ...(manifest.tags ?? []),
        manifest.kind,
        APP_NAME,
      ],
      noIndex:
        manifest.metadata?.noIndex ??
        !['public', 'featured', 'popular'].includes(manifest.visibility ?? 'public'),
    };
  }
}

export const toolMetadataResolver = new ToolMetadataResolver();
