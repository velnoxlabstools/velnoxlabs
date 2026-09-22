import type { ToolManifest } from '../types/registration';
import { isPubliclyVisible } from '../utils';

export class ToolRouteResolver {
  pathFor(manifest: ToolManifest): string {
    return `/tools/${manifest.slug}`;
  }

  shouldIndex(manifest: ToolManifest): boolean {
    return isPubliclyVisible(manifest.visibility ?? 'public');
  }

  listPublicPaths(manifests: ToolManifest[]): string[] {
    return manifests.filter((m) => this.shouldIndex(m)).map((m) => this.pathFor(m));
  }
}

export const toolRouteResolver = new ToolRouteResolver();
