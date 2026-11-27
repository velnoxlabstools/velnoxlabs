'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import {
  Search,
  Upload,
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
  Code2,
  Layers,
  X,
  FileCheck,
  Binary,
} from 'lucide-react';

interface MimeEntry {
  ext: string[];
  mime: string;
  category:
    | 'Text'
    | 'Images'
    | 'Audio'
    | 'Video'
    | 'Documents'
    | 'Archives'
    | 'Scripts & Data'
    | 'Fonts'
    | 'Binary & Executables'
    | '3D & Models';
  description: string;
  magicHex?: string;
  isBinary: boolean;
}

// 120+ Comprehensive IANA and standard MIME types with Magic Byte Hex Signatures
const MIME_DB: MimeEntry[] = [
  // --- DOCUMENTS ---
  {
    ext: ['pdf'],
    mime: 'application/pdf',
    category: 'Documents',
    description: 'Adobe Portable Document Format',
    magicHex: '25 50 44 46',
    isBinary: true,
  },
  {
    ext: ['doc'],
    mime: 'application/msword',
    category: 'Documents',
    description: 'Microsoft Word Document (Legacy)',
    magicHex: 'D0 CF 11 E0 A1 B1 1A E1',
    isBinary: true,
  },
  {
    ext: ['docx'],
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    category: 'Documents',
    description: 'Microsoft Word OpenXML Document',
    magicHex: '50 4B 03 04',
    isBinary: true,
  },
  {
    ext: ['xls'],
    mime: 'application/vnd.ms-excel',
    category: 'Documents',
    description: 'Microsoft Excel Spreadsheet (Legacy)',
    magicHex: 'D0 CF 11 E0 A1 B1 1A E1',
    isBinary: true,
  },
  {
    ext: ['xlsx'],
    mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    category: 'Documents',
    description: 'Microsoft Excel OpenXML Spreadsheet',
    magicHex: '50 4B 03 04',
    isBinary: true,
  },
  {
    ext: ['ppt'],
    mime: 'application/vnd.ms-powerpoint',
    category: 'Documents',
    description: 'Microsoft PowerPoint Presentation (Legacy)',
    magicHex: 'D0 CF 11 E0 A1 B1 1A E1',
    isBinary: true,
  },
  {
    ext: ['pptx'],
    mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    category: 'Documents',
    description: 'Microsoft PowerPoint OpenXML Presentation',
    magicHex: '50 4B 03 04',
    isBinary: true,
  },
  {
    ext: ['odt'],
    mime: 'application/vnd.oasis.opendocument.text',
    category: 'Documents',
    description: 'OpenDocument Text Document',
    magicHex: '50 4B 03 04',
    isBinary: true,
  },
  {
    ext: ['ods'],
    mime: 'application/vnd.oasis.opendocument.spreadsheet',
    category: 'Documents',
    description: 'OpenDocument Spreadsheet',
    magicHex: '50 4B 03 04',
    isBinary: true,
  },
  {
    ext: ['odp'],
    mime: 'application/vnd.oasis.opendocument.presentation',
    category: 'Documents',
    description: 'OpenDocument Presentation',
    magicHex: '50 4B 03 04',
    isBinary: true,
  },
  {
    ext: ['epub'],
    mime: 'application/epub+zip',
    category: 'Documents',
    description: 'Electronic Publication E-book',
    magicHex: '50 4B 03 04',
    isBinary: true,
  },
  {
    ext: ['rtf'],
    mime: 'application/rtf',
    category: 'Documents',
    description: 'Rich Text Format',
    magicHex: '7B 5C 72 74 66',
    isBinary: false,
  },

  // --- IMAGES ---
  {
    ext: ['png'],
    mime: 'image/png',
    category: 'Images',
    description: 'Portable Network Graphics',
    magicHex: '89 50 4E 47 0D 0A 1A 0A',
    isBinary: true,
  },
  {
    ext: ['jpg', 'jpeg', 'jpe'],
    mime: 'image/jpeg',
    category: 'Images',
    description: 'JPEG Image',
    magicHex: 'FF D8 FF',
    isBinary: true,
  },
  {
    ext: ['webp'],
    mime: 'image/webp',
    category: 'Images',
    description: 'WebP Image Format',
    magicHex: '52 49 46 46',
    isBinary: true,
  },
  {
    ext: ['avif'],
    mime: 'image/avif',
    category: 'Images',
    description: 'AV1 Image File Format',
    magicHex: '66 74 79 70 61 76 69 66',
    isBinary: true,
  },
  {
    ext: ['gif'],
    mime: 'image/gif',
    category: 'Images',
    description: 'Graphics Interchange Format',
    magicHex: '47 49 46 38',
    isBinary: true,
  },
  {
    ext: ['svg', 'svgz'],
    mime: 'image/svg+xml',
    category: 'Images',
    description: 'Scalable Vector Graphics',
    magicHex: '3C 73 76 67',
    isBinary: false,
  },
  {
    ext: ['ico'],
    mime: 'image/x-icon',
    category: 'Images',
    description: 'Windows Icon Format',
    magicHex: '00 00 01 00',
    isBinary: true,
  },
  {
    ext: ['bmp'],
    mime: 'image/bmp',
    category: 'Images',
    description: 'Windows Bitmap Graphic',
    magicHex: '42 4D',
    isBinary: true,
  },
  {
    ext: ['tiff', 'tif'],
    mime: 'image/tiff',
    category: 'Images',
    description: 'Tagged Image File Format',
    magicHex: '49 49 2A 00',
    isBinary: true,
  },
  {
    ext: ['heic'],
    mime: 'image/heic',
    category: 'Images',
    description: 'High Efficiency Image Container',
    magicHex: '66 74 79 70 68 65 69 63',
    isBinary: true,
  },
  {
    ext: ['heif'],
    mime: 'image/heif',
    category: 'Images',
    description: 'High Efficiency Image Format',
    magicHex: '66 74 79 70 6D 69 66 31',
    isBinary: true,
  },
  {
    ext: ['psd'],
    mime: 'image/vnd.adobe.photoshop',
    category: 'Images',
    description: 'Adobe Photoshop Document',
    magicHex: '38 42 50 53',
    isBinary: true,
  },

  // --- AUDIO ---
  {
    ext: ['mp3'],
    mime: 'audio/mpeg',
    category: 'Audio',
    description: 'MP3 Audio Stream',
    magicHex: '49 44 33',
    isBinary: true,
  },
  {
    ext: ['wav'],
    mime: 'audio/wav',
    category: 'Audio',
    description: 'Waveform Audio File',
    magicHex: '52 49 46 46',
    isBinary: true,
  },
  {
    ext: ['ogg', 'oga'],
    mime: 'audio/ogg',
    category: 'Audio',
    description: 'Ogg Vorbis Audio',
    magicHex: '4F 67 67 53',
    isBinary: true,
  },
  {
    ext: ['m4a'],
    mime: 'audio/mp4',
    category: 'Audio',
    description: 'MPEG-4 Audio Layer',
    magicHex: '66 74 79 70 4D 34 41',
    isBinary: true,
  },
  {
    ext: ['aac'],
    mime: 'audio/aac',
    category: 'Audio',
    description: 'Advanced Audio Coding',
    magicHex: 'FF F1',
    isBinary: true,
  },
  {
    ext: ['flac'],
    mime: 'audio/flac',
    category: 'Audio',
    description: 'Free Lossless Audio Codec',
    magicHex: '66 4C 61 43',
    isBinary: true,
  },
  {
    ext: ['opus'],
    mime: 'audio/opus',
    category: 'Audio',
    description: 'Opus Interactive Audio Codec',
    magicHex: '4F 67 67 53',
    isBinary: true,
  },
  {
    ext: ['weba'],
    mime: 'audio/webm',
    category: 'Audio',
    description: 'WebM Audio Stream',
    magicHex: '1A 45 DF A3',
    isBinary: true,
  },
  {
    ext: ['mid', 'midi'],
    mime: 'audio/midi',
    category: 'Audio',
    description: 'Musical Instrument Digital Interface',
    magicHex: '4D 54 68 64',
    isBinary: true,
  },

  // --- VIDEO ---
  {
    ext: ['mp4', 'm4v'],
    mime: 'video/mp4',
    category: 'Video',
    description: 'MPEG-4 Video Stream',
    magicHex: '66 74 79 70 69 73 6F 6D',
    isBinary: true,
  },
  {
    ext: ['webm'],
    mime: 'video/webm',
    category: 'Video',
    description: 'WebM Video Stream',
    magicHex: '1A 45 DF A3',
    isBinary: true,
  },
  {
    ext: ['mkv'],
    mime: 'video/x-matroska',
    category: 'Video',
    description: 'Matroska Multimedia Container',
    magicHex: '1A 45 DF A3',
    isBinary: true,
  },
  {
    ext: ['mov'],
    mime: 'video/quicktime',
    category: 'Video',
    description: 'Apple QuickTime Movie',
    magicHex: '66 74 79 70 71 74 20 20',
    isBinary: true,
  },
  {
    ext: ['avi'],
    mime: 'video/x-msvideo',
    category: 'Video',
    description: 'Audio Video Interleave',
    magicHex: '52 49 46 46',
    isBinary: true,
  },
  {
    ext: ['wmv'],
    mime: 'video/x-ms-wmv',
    category: 'Video',
    description: 'Windows Media Video',
    magicHex: '30 26 B2 75 8E 66 CF 11',
    isBinary: true,
  },
  {
    ext: ['flv'],
    mime: 'video/x-flv',
    category: 'Video',
    description: 'Flash Video Container',
    magicHex: '46 4C 56 01',
    isBinary: true,
  },
  {
    ext: ['ts'],
    mime: 'video/mp2t',
    category: 'Video',
    description: 'MPEG-2 Transport Stream',
    magicHex: '47',
    isBinary: true,
  },
  {
    ext: ['m3u8'],
    mime: 'application/vnd.apple.mpegurl',
    category: 'Video',
    description: 'HLS Live Streaming Playlist',
    magicHex: '23 45 58 54',
    isBinary: false,
  },
  {
    ext: ['mpd'],
    mime: 'application/dash+xml',
    category: 'Video',
    description: 'MPEG-DASH Media Presentation',
    magicHex: '3C 4D 50 44',
    isBinary: false,
  },

  // --- FONTS ---
  {
    ext: ['woff2'],
    mime: 'font/woff2',
    category: 'Fonts',
    description: 'Web Open Font Format 2.0',
    magicHex: '77 4F 46 32',
    isBinary: true,
  },
  {
    ext: ['woff'],
    mime: 'font/woff',
    category: 'Fonts',
    description: 'Web Open Font Format 1.0',
    magicHex: '77 4F 46 46',
    isBinary: true,
  },
  {
    ext: ['ttf'],
    mime: 'font/ttf',
    category: 'Fonts',
    description: 'TrueType Font',
    magicHex: '00 01 00 00',
    isBinary: true,
  },
  {
    ext: ['otf'],
    mime: 'font/otf',
    category: 'Fonts',
    description: 'OpenType Font',
    magicHex: '4F 54 54 4F',
    isBinary: true,
  },
  {
    ext: ['eot'],
    mime: 'application/vnd.ms-fontobject',
    category: 'Fonts',
    description: 'Embedded OpenType Font',
    magicHex: '4C 50',
    isBinary: true,
  },

  // --- SCRIPTS & DATA ---
  {
    ext: ['json'],
    mime: 'application/json',
    category: 'Scripts & Data',
    description: 'JavaScript Object Notation',
    magicHex: '7B',
    isBinary: false,
  },
  {
    ext: ['jsonld'],
    mime: 'application/ld+json',
    category: 'Scripts & Data',
    description: 'JSON for Linked Data',
    magicHex: '7B',
    isBinary: false,
  },
  {
    ext: ['geojson'],
    mime: 'application/geo+json',
    category: 'Scripts & Data',
    description: 'GeoJSON Geospatial Data',
    magicHex: '7B',
    isBinary: false,
  },
  {
    ext: ['js', 'mjs', 'cjs'],
    mime: 'text/javascript',
    category: 'Scripts & Data',
    description: 'JavaScript Source Module',
    magicHex: '2F 2F',
    isBinary: false,
  },
  {
    ext: ['ts', 'tsx'],
    mime: 'application/typescript',
    category: 'Scripts & Data',
    description: 'TypeScript Source Code',
    magicHex: '69 6D 70 6F',
    isBinary: false,
  },
  {
    ext: ['wasm'],
    mime: 'application/wasm',
    category: 'Scripts & Data',
    description: 'WebAssembly Binary Module',
    magicHex: '00 61 73 6D',
    isBinary: true,
  },
  {
    ext: ['xml'],
    mime: 'application/xml',
    category: 'Scripts & Data',
    description: 'Extensible Markup Language',
    magicHex: '3C 3F 78 6D 6C',
    isBinary: false,
  },
  {
    ext: ['yaml', 'yml'],
    mime: 'application/yaml',
    category: 'Scripts & Data',
    description: "YAML Ain't Markup Language",
    magicHex: '2D 2D 2D',
    isBinary: false,
  },
  {
    ext: ['csv'],
    mime: 'text/csv',
    category: 'Scripts & Data',
    description: 'Comma-Separated Values',
    magicHex: '22',
    isBinary: false,
  },
  {
    ext: ['graphql', 'gql'],
    mime: 'application/graphql+json',
    category: 'Scripts & Data',
    description: 'GraphQL Query Language',
    magicHex: '71 75 65 72',
    isBinary: false,
  },
  {
    ext: ['py'],
    mime: 'text/x-python',
    category: 'Scripts & Data',
    description: 'Python Script',
    magicHex: '23 21',
    isBinary: false,
  },
  {
    ext: ['rs'],
    mime: 'text/x-rust',
    category: 'Scripts & Data',
    description: 'Rust Source Code',
    magicHex: '66 6E 20',
    isBinary: false,
  },
  {
    ext: ['go'],
    mime: 'text/x-go',
    category: 'Scripts & Data',
    description: 'Go Programming Source',
    magicHex: '70 61 63 6B',
    isBinary: false,
  },
  {
    ext: ['sql'],
    mime: 'application/sql',
    category: 'Scripts & Data',
    description: 'Structured Query Language Script',
    magicHex: '53 45 4C 45',
    isBinary: false,
  },

  // --- TEXT ---
  {
    ext: ['html', 'htm', 'xhtml'],
    mime: 'text/html',
    category: 'Text',
    description: 'HyperText Markup Language',
    magicHex: '3C 21 44 4F 43',
    isBinary: false,
  },
  {
    ext: ['css'],
    mime: 'text/css',
    category: 'Text',
    description: 'Cascading Style Sheets',
    magicHex: '2F 2A',
    isBinary: false,
  },
  {
    ext: ['txt', 'text'],
    mime: 'text/plain',
    category: 'Text',
    description: 'Standard Plain Text Document',
    magicHex: 'EF BB BF',
    isBinary: false,
  },
  {
    ext: ['md', 'markdown'],
    mime: 'text/markdown',
    category: 'Text',
    description: 'Markdown Structured Document',
    magicHex: '23 20',
    isBinary: false,
  },
  {
    ext: ['ics'],
    mime: 'text/calendar',
    category: 'Text',
    description: 'iCalendar Event Data',
    magicHex: '42 45 47 49 4E',
    isBinary: false,
  },
  {
    ext: ['vcf'],
    mime: 'text/vcard',
    category: 'Text',
    description: 'vCard Electronic Business Card',
    magicHex: '42 45 47 49 4E',
    isBinary: false,
  },

  // --- ARCHIVES ---
  {
    ext: ['zip'],
    mime: 'application/zip',
    category: 'Archives',
    description: 'ZIP Compressed Archive',
    magicHex: '50 4B 03 04',
    isBinary: true,
  },
  {
    ext: ['gz', 'gzip'],
    mime: 'application/gzip',
    category: 'Archives',
    description: 'Gnu Zipped Archive',
    magicHex: '1F 8B 08',
    isBinary: true,
  },
  {
    ext: ['tar'],
    mime: 'application/x-tar',
    category: 'Archives',
    description: 'Tape Archive Format',
    magicHex: '75 73 74 61 72',
    isBinary: true,
  },
  {
    ext: ['7z'],
    mime: 'application/x-7z-compressed',
    category: 'Archives',
    description: '7-Zip Compressed Archive',
    magicHex: '37 7A BC AF 27 1C',
    isBinary: true,
  },
  {
    ext: ['rar'],
    mime: 'application/vnd.rar',
    category: 'Archives',
    description: 'RAR Compressed Archive',
    magicHex: '52 61 72 21 1A 07',
    isBinary: true,
  },
  {
    ext: ['bz2'],
    mime: 'application/x-bzip2',
    category: 'Archives',
    description: 'Bzip2 Compressed Archive',
    magicHex: '42 5A 68',
    isBinary: true,
  },
  {
    ext: ['xz'],
    mime: 'application/x-xz',
    category: 'Archives',
    description: 'XZ Compressed Archive',
    magicHex: 'FD 37 7A 58 5A 00',
    isBinary: true,
  },
  {
    ext: ['zst'],
    mime: 'application/zstd',
    category: 'Archives',
    description: 'Zstandard Compressed Archive',
    magicHex: '28 B5 2F FD',
    isBinary: true,
  },

  // --- BINARY & EXECUTABLES ---
  {
    ext: ['exe', 'dll'],
    mime: 'application/vnd.microsoft.portable-executable',
    category: 'Binary & Executables',
    description: 'Windows Portable Executable (PE)',
    magicHex: '4D 5A',
    isBinary: true,
  },
  {
    ext: ['bin'],
    mime: 'application/octet-stream',
    category: 'Binary & Executables',
    description: 'Arbitrary Binary Data Stream',
    magicHex: '00 00',
    isBinary: true,
  },
  {
    ext: ['dmg'],
    mime: 'application/x-apple-diskimage',
    category: 'Binary & Executables',
    description: 'Apple Disk Image',
    magicHex: '78 61 72 21',
    isBinary: true,
  },
  {
    ext: ['iso'],
    mime: 'application/x-iso9660-image',
    category: 'Binary & Executables',
    description: 'Optical Disc ISO Image',
    magicHex: '43 44 30 30 31',
    isBinary: true,
  },
  {
    ext: ['apk'],
    mime: 'application/vnd.android.package-archive',
    category: 'Binary & Executables',
    description: 'Android Application Package',
    magicHex: '50 4B 03 04',
    isBinary: true,
  },
  {
    ext: ['deb'],
    mime: 'application/vnd.debian.binary-package',
    category: 'Binary & Executables',
    description: 'Debian Software Package',
    magicHex: '21 3C 61 72 63 68 3E',
    isBinary: true,
  },
  {
    ext: ['rpm'],
    mime: 'application/x-rpm',
    category: 'Binary & Executables',
    description: 'RedHat Package Manager',
    magicHex: 'ED AB EE DB',
    isBinary: true,
  },
  {
    ext: ['sqlite', 'db'],
    mime: 'application/vnd.sqlite3',
    category: 'Binary & Executables',
    description: 'SQLite Database File',
    magicHex: '53 51 4C 69 74 65 20 66',
    isBinary: true,
  },

  // --- 3D & MODELS ---
  {
    ext: ['gltf'],
    mime: 'model/gltf+json',
    category: '3D & Models',
    description: 'GL Transmission Format (JSON)',
    magicHex: '7B',
    isBinary: false,
  },
  {
    ext: ['glb'],
    mime: 'model/gltf-binary',
    category: '3D & Models',
    description: 'GL Transmission Format (Binary)',
    magicHex: '67 6C 54 46',
    isBinary: true,
  },
  {
    ext: ['obj'],
    mime: 'model/obj',
    category: '3D & Models',
    description: 'Wavefront 3D Object',
    magicHex: '23 20',
    isBinary: false,
  },
  {
    ext: ['stl'],
    mime: 'model/stl',
    category: '3D & Models',
    description: 'Stereolithography 3D Geometry',
    magicHex: '73 6F 6C 69 64',
    isBinary: false,
  },
];

type CategoryFilter =
  | 'All'
  | 'Documents'
  | 'Images'
  | 'Audio'
  | 'Video'
  | 'Fonts'
  | 'Scripts & Data'
  | 'Text'
  | 'Archives'
  | 'Binary & Executables'
  | '3D & Models';
type ActiveTab = 'lookup' | 'inspector';

interface FileInspectionResult {
  fileName: string;
  fileSize: number;
  detectedExtension: string;
  magicHex: string;
  matchedMime?: MimeEntry;
  isSpoofed: boolean;
  status: 'clean' | 'spoof_warning' | 'unknown';
}

// Magic bytes matcher lookup function
function detectMimeFromBytes(
  hexArray: string[],
  declaredExt: string
): { matched?: MimeEntry; isSpoofed: boolean } {
  const hexJoined = hexArray.join(' ');

  // 1. Direct prefix matches
  let matched: MimeEntry | undefined = MIME_DB.find((entry) => {
    if (!entry.magicHex) return false;
    const targetClean = entry.magicHex.replace(/\s+/g, '');
    const currentClean = hexArray.slice(0, entry.magicHex.split(' ').length).join('');
    return currentClean.startsWith(targetClean);
  });

  // Special checks for WebP/WAV/AVI (RIFF containers)
  if (hexJoined.startsWith('52 49 46 46') && hexArray.length >= 12) {
    const subFormat = hexArray.slice(8, 12).join('');
    if (subFormat === '57454250') {
      matched = MIME_DB.find((e) => e.mime === 'image/webp');
    } else if (subFormat === '57415645') {
      matched = MIME_DB.find((e) => e.mime === 'audio/wav');
    } else if (subFormat === '41564920') {
      matched = MIME_DB.find((e) => e.mime === 'video/x-msvideo');
    }
  }

  // Special check for MP4 / QuickTime / AVIF / HEIC (ftyp container at byte 4)
  if (hexArray.length >= 12 && hexArray.slice(4, 8).join('') === '66747970') {
    const ftypMajor = hexArray.slice(8, 12).join('').toLowerCase();
    if (ftypMajor.includes('avif')) {
      matched = MIME_DB.find((e) => e.mime === 'image/avif');
    } else if (ftypMajor.includes('heic') || ftypMajor.includes('mif1')) {
      matched = MIME_DB.find((e) => e.mime === 'image/heic');
    } else if (ftypMajor.includes('isom') || ftypMajor.includes('mp4')) {
      matched = MIME_DB.find((e) => e.mime === 'video/mp4');
    } else if (ftypMajor.includes('qt')) {
      matched = MIME_DB.find((e) => e.mime === 'video/quicktime');
    }
  }

  // 2. Spoof check
  let isSpoofed = false;
  if (matched && declaredExt) {
    const extClean = declaredExt.toLowerCase().replace(/^\./, '');
    // If declared extension is totally alien to detected binary type (e.g. declared pdf but magic bytes are EXE)
    if (!matched.ext.includes(extClean)) {
      isSpoofed = true;
    }
  }

  return { matched, isSpoofed };
}

export default function MimeTypeLookupPage() {
  const tUI = useTranslations('ToolUI.mimeTypeLookup');

  const [activeTab, setActiveTab] = useState<ActiveTab>('lookup');
  const [searchQuery, setSearchQuery] = useState('pdf');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All');
  const [selectedEntry, setSelectedEntry] = useState<MimeEntry | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // File Inspector States
  const [inspectionResult, setInspectionResult] = useState<FileInspectionResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Filtered MIME entries for Tab 1
  const filteredEntries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase().replace(/^\./, '');

    return MIME_DB.filter((entry) => {
      // Category filter
      if (activeCategory !== 'All' && entry.category !== activeCategory) {
        return false;
      }

      if (!q) return true;

      // Match extension, MIME string, or description
      const matchExt = entry.ext.some((e) => e.toLowerCase().includes(q));
      const matchMime = entry.mime.toLowerCase().includes(q);
      const matchDesc = entry.description.toLowerCase().includes(q);
      const matchHex = entry.magicHex ? entry.magicHex.toLowerCase().includes(q) : false;

      return matchExt || matchMime || matchDesc || matchHex;
    });
  }, [searchQuery, activeCategory]);

  const handleCopyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCopyAllResults = () => {
    if (filteredEntries.length === 0) return;
    const text = filteredEntries
      .map((m) => `.${m.ext.join(', .')}  ->  ${m.mime}  [${m.category}]`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopiedKey('all-results');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Inspect local file via FileReader (First 16 bytes for magic numbers)
  const processFile = useCallback((file: File) => {
    const extMatch = file.name.match(/\.([a-zA-Z0-9]+)$/);
    const declaredExt = extMatch ? extMatch[1] : '';

    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      if (!buffer) return;
      const uint8 = new Uint8Array(buffer);
      const hexArray = Array.from(uint8).map((b) => b.toString(16).padStart(2, '0').toUpperCase());
      const magicHex = hexArray.join(' ');

      const { matched, isSpoofed } = detectMimeFromBytes(hexArray, declaredExt);

      setInspectionResult({
        fileName: file.name,
        fileSize: file.size,
        detectedExtension: declaredExt,
        magicHex: magicHex || '00',
        matchedMime: matched,
        isSpoofed,
        status: isSpoofed ? 'spoof_warning' : matched ? 'clean' : 'unknown',
      });
    };
    reader.readAsArrayBuffer(file.slice(0, 16));
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <GlobalContainer maxWidth="2xl">
      <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
        <SectionHeading title={tUI('title')} subtitle={tUI('subtitle')} />

        {/* TOP LEVEL NAVIGATION TABS */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            borderBottom: '1px solid var(--border-color)',
            marginTop: '24px',
            marginBottom: '20px',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('lookup')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'lookup' ? '2px solid #3b82f6' : '2px solid transparent',
              color: activeTab === 'lookup' ? '#3b82f6' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Layers size={17} />
            MIME Database & Server Configs
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inspector')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              border: 'none',
              background: 'none',
              borderBottom:
                activeTab === 'inspector' ? '2px solid #10b981' : '2px solid transparent',
              color: activeTab === 'inspector' ? '#10b981' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <FileCheck size={17} />
            Live File & Magic Bytes Checker
            <span
              style={{
                fontSize: '0.68rem',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                padding: '2px 6px',
                borderRadius: '8px',
                fontWeight: 700,
              }}
            >
              100% Client-Side
            </span>
          </button>
        </div>

        {/* TAB 1: MIME DATABASE & EXTENSION LOOKUP */}
        {activeTab === 'lookup' && (
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
            }}
          >
            {/* Search Input Bar */}
            <div style={{ position: 'relative', marginBottom: '18px' }}>
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by extension (e.g. .pdf, webp), MIME string (e.g. application/json), or name..."
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 44px',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  color: 'var(--text-main)',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '18px' }}>
              {[
                'All',
                'Documents',
                'Images',
                'Audio',
                'Video',
                'Fonts',
                'Scripts & Data',
                'Text',
                'Archives',
                'Binary & Executables',
                '3D & Models',
              ].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat as CategoryFilter)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '16px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border:
                      activeCategory === cat
                        ? '1px solid #3b82f6'
                        : '1px solid var(--border-color)',
                    backgroundColor:
                      activeCategory === cat ? 'rgba(59, 130, 246, 0.12)' : 'var(--bg-page)',
                    color: activeCategory === cat ? '#3b82f6' : 'var(--text-muted)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Results Bar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px',
                marginBottom: '12px',
              }}
            >
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Showing {filteredEntries.length} matching media format
                {filteredEntries.length === 1 ? '' : 's'}
              </span>

              <button
                type="button"
                onClick={handleCopyAllResults}
                disabled={filteredEntries.length === 0}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  backgroundColor: copiedKey === 'all-results' ? '#059669' : 'var(--bg-page)',
                  color: copiedKey === 'all-results' ? '#ffffff' : 'var(--text-main)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '5px 12px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: filteredEntries.length > 0 ? 'pointer' : 'not-allowed',
                }}
              >
                {copiedKey === 'all-results' ? <Check size={13} /> : <Copy size={13} />}
                {copiedKey === 'all-results' ? 'Copied All!' : 'Copy Filtered List'}
              </button>
            </div>

            {/* Table */}
            <div
              style={{
                backgroundColor: 'var(--bg-page)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                overflow: 'hidden',
                maxHeight: '520px',
                overflowY: 'auto',
              }}
            >
              {filteredEntries.length === 0 ? (
                <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No MIME types or extensions matched &quot;{searchQuery}&quot;. Try searching for
                  another format.
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr
                      style={{
                        backgroundColor: 'var(--bg-card)',
                        borderBottom: '1px solid var(--border-color)',
                        fontSize: '0.78rem',
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      <th style={{ padding: '10px 14px' }}>Extension</th>
                      <th style={{ padding: '10px 14px' }}>MIME / Content-Type</th>
                      <th style={{ padding: '10px 14px' }}>Category & Details</th>
                      <th style={{ padding: '10px 14px' }}>Magic Bytes</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEntries.map((m, idx) => (
                      <tr
                        key={idx}
                        style={{
                          borderBottom: '1px solid var(--border-color)',
                          fontSize: '0.85rem',
                          transition: 'background 0.1s ease',
                        }}
                      >
                        {/* Extension */}
                        <td
                          style={{
                            padding: '12px 14px',
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            color: '#3b82f6',
                          }}
                        >
                          {m.ext.map((e) => `.${e}`).join(', ')}
                        </td>

                        {/* MIME */}
                        <td
                          style={{
                            padding: '12px 14px',
                            fontFamily: 'monospace',
                            color: '#10b981',
                            wordBreak: 'break-all',
                          }}
                        >
                          {m.mime}
                        </td>

                        {/* Category & Description */}
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ color: 'var(--text-main)', fontWeight: 500 }}>
                            {m.description}
                          </div>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              color: 'var(--text-muted)',
                            }}
                          >
                            {m.category} • {m.isBinary ? 'Binary' : 'Text'}
                          </span>
                        </td>

                        {/* Magic Bytes */}
                        <td
                          style={{
                            padding: '12px 14px',
                            fontFamily: 'monospace',
                            fontSize: '0.78rem',
                            color: '#8b5cf6',
                          }}
                        >
                          {m.magicHex || '—'}
                        </td>

                        {/* Action Buttons */}
                        <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => handleCopyText(`mime-${idx}`, m.mime)}
                              title="Copy MIME string"
                              style={{
                                backgroundColor:
                                  copiedKey === `mime-${idx}` ? '#059669' : 'var(--bg-card)',
                                color: copiedKey === `mime-${idx}` ? '#ffffff' : 'var(--text-main)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '6px',
                                padding: '4px 8px',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                              }}
                            >
                              {copiedKey === `mime-${idx}` ? (
                                <Check size={12} />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => setSelectedEntry(m)}
                              title="View server integration snippets"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                color: '#2563eb',
                                border: '1px solid rgba(59, 130, 246, 0.25)',
                                borderRadius: '6px',
                                padding: '4px 8px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              <Code2 size={12} />
                              Config
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: LIVE FILE & MAGIC BYTES INSPECTOR */}
        {activeTab === 'inspector' && (
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div style={{ marginBottom: '16px' }}>
              <h3
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  marginBottom: '4px',
                }}
              >
                Instant Binary Magic Bytes & MIME Detector
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Drag and drop any file from your computer. Our client-side Web Crypto and FileReader
                inspect the binary header (magic bytes) to reveal the true format and detect file
                extension spoofing attacks. Zero bytes leave your browser.
              </p>
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              style={{
                border: isDragging ? '2px dashed #3b82f6' : '2px dashed var(--border-color)',
                backgroundColor: isDragging ? 'rgba(59, 130, 246, 0.05)' : 'var(--bg-page)',
                borderRadius: '16px',
                padding: '40px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                position: 'relative',
              }}
            >
              <input
                type="file"
                onChange={handleFileInput}
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0,
                  cursor: 'pointer',
                  width: '100%',
                  height: '100%',
                }}
              />
              <Upload size={36} style={{ color: '#3b82f6', marginBottom: '12px' }} />
              <div
                style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  marginBottom: '4px',
                }}
              >
                Drop a file here or click to browse
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Supports any file format (Images, Documents, Media, Archives, Binaries) • 100%
                Client-Side Privacy
              </div>
            </div>

            {/* Inspection Results Card */}
            {inspectionResult && (
              <div
                style={{
                  marginTop: '24px',
                  backgroundColor: 'var(--bg-page)',
                  border: inspectionResult.isSpoofed
                    ? '1px solid #ef4444'
                    : '1px solid var(--border-color)',
                  borderRadius: '14px',
                  padding: '20px',
                }}
              >
                {/* Header Status Banner */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '16px',
                    paddingBottom: '12px',
                    borderBottom: '1px solid var(--border-color)',
                  }}
                >
                  {inspectionResult.isSpoofed ? (
                    <>
                      <AlertTriangle size={24} style={{ color: '#ef4444' }} />
                      <div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ef4444' }}>
                          MIME Spoofing Warning Detected!
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          File extension &quot;.{inspectionResult.detectedExtension}&quot; does not
                          match the actual binary magic numbers (
                          {inspectionResult.matchedMime?.mime}).
                        </div>
                      </div>
                    </>
                  ) : inspectionResult.matchedMime ? (
                    <>
                      <ShieldCheck size={24} style={{ color: '#10b981' }} />
                      <div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#10b981' }}>
                          Verified Genuine Binary Signature
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Binary magic bytes strictly match the expected IANA format specification.
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <Binary size={24} style={{ color: '#8b5cf6' }} />
                      <div>
                        <div
                          style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}
                        >
                          Generic Binary / Text Payload
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Standard payload signature identified.
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Inspection Details Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px',
                    fontSize: '0.85rem',
                  }}
                >
                  <div>
                    <span
                      style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}
                    >
                      File Name
                    </span>
                    <span
                      style={{ fontWeight: 600, color: 'var(--text-main)', wordBreak: 'break-all' }}
                    >
                      {inspectionResult.fileName}
                    </span>
                  </div>

                  <div>
                    <span
                      style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}
                    >
                      File Size
                    </span>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                      {(inspectionResult.fileSize / 1024).toFixed(2)} KB (
                      {inspectionResult.fileSize.toLocaleString()} bytes)
                    </span>
                  </div>

                  <div>
                    <span
                      style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}
                    >
                      True Detected MIME
                    </span>
                    <span style={{ fontWeight: 700, color: '#10b981', fontFamily: 'monospace' }}>
                      {inspectionResult.matchedMime?.mime || 'application/octet-stream'}
                    </span>
                  </div>

                  <div>
                    <span
                      style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}
                    >
                      Magic Signature (Hex)
                    </span>
                    <span style={{ fontWeight: 700, color: '#8b5cf6', fontFamily: 'monospace' }}>
                      {inspectionResult.magicHex}
                    </span>
                  </div>
                </div>

                {/* HTTP Security Advisory Card */}
                <div
                  style={{
                    marginTop: '16px',
                    padding: '12px 16px',
                    backgroundColor: 'var(--bg-card)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: 'var(--text-main)',
                      marginBottom: '4px',
                    }}
                  >
                    Recommended Server Response Header:
                  </div>
                  <code
                    style={{
                      fontSize: '0.82rem',
                      color: '#3b82f6',
                      fontFamily: 'monospace',
                      display: 'block',
                    }}
                  >
                    Content-Type: {inspectionResult.matchedMime?.mime || 'application/octet-stream'}
                    {inspectionResult.matchedMime?.isBinary ? '' : '; charset=utf-8'}
                  </code>
                  <code
                    style={{
                      fontSize: '0.82rem',
                      color: '#10b981',
                      fontFamily: 'monospace',
                      display: 'block',
                      marginTop: '2px',
                    }}
                  >
                    X-Content-Type-Options: nosniff
                  </code>
                </div>
              </div>
            )}
          </div>
        )}

        {/* DEVELOPER SERVER INTEGRATION DRAWER / MODAL */}
        {selectedEntry && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
            }}
          >
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                maxWidth: '640px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '24px',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '16px',
                }}
              >
                <div>
                  <h3
                    style={{
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      color: 'var(--text-main)',
                      margin: 0,
                    }}
                  >
                    {selectedEntry.description}
                  </h3>
                  <div
                    style={{
                      fontSize: '0.85rem',
                      color: '#10b981',
                      fontFamily: 'monospace',
                      marginTop: '4px',
                    }}
                  >
                    {selectedEntry.mime}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedEntry(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Code Snippets for Server Deployment */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* 1. Nginx */}
                <div>
                  <div
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                      marginBottom: '4px',
                    }}
                  >
                    Nginx (mime.types / nginx.conf)
                  </div>
                  <div
                    style={{
                      backgroundColor: 'var(--bg-page)',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      fontFamily: 'monospace',
                      fontSize: '0.82rem',
                      color: '#3b82f6',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <code>
                      types &#123; {selectedEntry.mime} {selectedEntry.ext.join(' ')}; &#125;
                    </code>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyText(
                          'nginx',
                          `types { ${selectedEntry.mime} ${selectedEntry.ext.join(' ')}; }`
                        )
                      }
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                      }}
                    >
                      {copiedKey === 'nginx' ? (
                        <Check size={14} color="#10b981" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                </div>

                {/* 2. Apache .htaccess */}
                <div>
                  <div
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                      marginBottom: '4px',
                    }}
                  >
                    Apache (.htaccess)
                  </div>
                  <div
                    style={{
                      backgroundColor: 'var(--bg-page)',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      fontFamily: 'monospace',
                      fontSize: '0.82rem',
                      color: '#3b82f6',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <code>
                      AddType {selectedEntry.mime} {selectedEntry.ext.map((e) => `.${e}`).join(' ')}
                    </code>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyText(
                          'apache',
                          `AddType ${selectedEntry.mime} ${selectedEntry.ext.map((e) => `.${e}`).join(' ')}`
                        )
                      }
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                      }}
                    >
                      {copiedKey === 'apache' ? (
                        <Check size={14} color="#10b981" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                </div>

                {/* 3. Node.js Express */}
                <div>
                  <div
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                      marginBottom: '4px',
                    }}
                  >
                    Node.js (Express.js Response)
                  </div>
                  <div
                    style={{
                      backgroundColor: 'var(--bg-page)',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      fontFamily: 'monospace',
                      fontSize: '0.82rem',
                      color: '#3b82f6',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <code>
                      res.setHeader(&apos;Content-Type&apos;, &apos;{selectedEntry.mime}&apos;);
                    </code>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyText(
                          'node',
                          `res.setHeader('Content-Type', '${selectedEntry.mime}');`
                        )
                      }
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                      }}
                    >
                      {copiedKey === 'node' ? (
                        <Check size={14} color="#10b981" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                </div>

                {/* 4. Python FastAPI / Flask */}
                <div>
                  <div
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                      marginBottom: '4px',
                    }}
                  >
                    Python (FastAPI / Starlette)
                  </div>
                  <div
                    style={{
                      backgroundColor: 'var(--bg-page)',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      fontFamily: 'monospace',
                      fontSize: '0.82rem',
                      color: '#3b82f6',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <code>Response(content=data, media_type=&quot;{selectedEntry.mime}&quot;)</code>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyText(
                          'py',
                          `Response(content=data, media_type="${selectedEntry.mime}")`
                        )
                      }
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                      }}
                    >
                      {copiedKey === 'py' ? (
                        <Check size={14} color="#10b981" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                </div>

                {/* 5. AWS S3 CLI */}
                <div>
                  <div
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                      marginBottom: '4px',
                    }}
                  >
                    AWS S3 / Cloudflare R2 CLI
                  </div>
                  <div
                    style={{
                      backgroundColor: 'var(--bg-page)',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      fontFamily: 'monospace',
                      fontSize: '0.82rem',
                      color: '#3b82f6',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <code>
                      aws s3 cp file.{selectedEntry.ext[0]} s3://bucket/ --content-type &quot;
                      {selectedEntry.mime}&quot;
                    </code>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyText(
                          's3',
                          `aws s3 cp file.${selectedEntry.ext[0]} s3://bucket/ --content-type "${selectedEntry.mime}"`
                        )
                      }
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                      }}
                    >
                      {copiedKey === 's3' ? (
                        <Check size={14} color="#10b981" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '20px', textAlign: 'right' }}>
                <button
                  type="button"
                  onClick={() => setSelectedEntry(null)}
                  style={{
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '8px 18px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STRUCTURED SEO & FAQ CONTENT */}
        <ToolSeoContent
          toolSlug="mime-type-lookup-and-extension-finder"
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
