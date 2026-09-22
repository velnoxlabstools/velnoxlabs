import type { JsonLdGraph } from '../types';

interface JsonLdScriptProps {
  data: JsonLdGraph;
}

/**
 * Server-safe JSON-LD script tag.
 */
export function JsonLdScript({ data }: JsonLdScriptProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
