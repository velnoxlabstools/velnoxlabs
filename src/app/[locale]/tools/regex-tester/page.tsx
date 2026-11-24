'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import {
  Play,
  ArrowLeftRight,
  Sparkles,
  BookOpen,
  Code2,
  Library,
  Copy,
  Check,
  Download,
} from 'lucide-react';

type TabMode = 'tester' | 'replace' | 'aiGenerator' | 'explainer' | 'code' | 'cheatsheet';

interface MatchGroup {
  index: number;
  match: string;
  startIndex: number;
  endIndex: number;
  groups: string[];
  namedGroups?: Record<string, string>;
}

interface ExplainerToken {
  token: string;
  meaning: string;
}

const COMMON_PRESETS = [
  {
    id: 'email',
    name: 'Email Address',
    pattern: '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}',
    flags: 'gi',
    sample: 'Contact support@velnoxlabs.com or test.user@domain.co for assistance.',
    description: 'Matches standard RFC compliant email formats.',
  },
  {
    id: 'url',
    name: 'HTTP / HTTPS URL',
    pattern:
      'https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)',
    flags: 'gi',
    sample:
      'Visit https://www.velnoxlabs.com/tools or check http://example.org/path?query=1 for details.',
    description: 'Detects secure and unsecure web links with paths and query parameters.',
  },
  {
    id: 'ipv4',
    name: 'IPv4 Address',
    pattern:
      '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b',
    flags: 'g',
    sample: 'Local server 192.168.1.1 and gateway 10.0.0.254 are online. Gateway DNS is 8.8.8.8.',
    description: 'Validates four-octet IP addresses (0.0.0.0 to 255.255.255.255).',
  },
  {
    id: 'date',
    name: 'ISO Date (YYYY-MM-DD)',
    pattern: '\\b(\\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])\\b',
    flags: 'g',
    sample: 'Project started on 2026-01-15 and milestone scheduled for 2026-11-24.',
    description: 'Matches ISO-8601 calendar dates with year, month, and day capture groups.',
  },
  {
    id: 'phone',
    name: 'International Phone',
    pattern: '\\+?[1-9]\\d{1,14}(?:\\s?\\d{3,4}){2}',
    flags: 'g',
    sample: 'Call hotline at +1 555 123 4567 or direct line +44 7700 900821 today.',
    description: 'Captures E.164 formatted international telephone numbers.',
  },
  {
    id: 'password',
    name: 'Strong Password',
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
    flags: 'm',
    sample: 'WeakPass\nSuperS3cure!\n12345678\nMyP@ssw0rd2026',
    description:
      'Enforces min 8 chars with 1 uppercase, 1 lowercase, 1 digit, and 1 special character.',
  },
  {
    id: 'hex',
    name: 'Hex Color Code',
    pattern: '#(?:[0-9a-fA-F]{3}){1,2}\\b',
    flags: 'gi',
    sample: 'Palette: #3b82f6 (blue), #FFF (white), #10b981 (emerald), #ef4444 (red).',
    description: 'Matches 3-digit and 6-digit hex color representations.',
  },
  {
    id: 'slug',
    name: 'URL Slug',
    pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$',
    flags: 'm',
    sample: 'ai-regex-tester-online\nvalid-url-slug-2026\nInvalid_Slug!',
    description: 'Validates kebab-case URL slugs with lowercase letters, numbers, and hyphens.',
  },
];

export default function RegexTesterPage() {
  const tUI = useTranslations('ToolUI.regexTester');

  // Navigation state
  const [activeTab, setActiveTab] = useState<TabMode>('tester');

  // Primary RegEx state
  const [pattern, setPattern] = useState('[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}');
  const [flags, setFlags] = useState('g');
  const [testString, setTestString] = useState(
    'Contact support@velnoxlabs.com or test.user@domain.co for assistance. Invalid: user@.com'
  );

  // Results state
  const [matches, setMatches] = useState<MatchGroup[]>([]);
  const [error, setError] = useState('');
  const [copiedMatches, setCopiedMatches] = useState(false);

  // Replacement state
  const [replacement, setReplacement] = useState('[$&]');
  const [transformedText, setTransformedText] = useState('');
  const [copiedReplaced, setCopiedReplaced] = useState(false);

  // AI Generator state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiExplanation, setAiExplanation] = useState('');

  // Code snippets state
  const [copiedCodeLang, setCopiedCodeLang] = useState<string | null>(null);

  // Flags list
  const flagOptions = [
    { key: 'g', label: tUI('flagGlobal') },
    { key: 'i', label: tUI('flagIgnoreCase') },
    { key: 'm', label: tUI('flagMultiline') },
    { key: 's', label: tUI('flagDotAll') },
    { key: 'u', label: tUI('flagUnicode') },
  ];

  const toggleFlag = (flag: string) => {
    let newFlags = flags;
    if (newFlags.includes(flag)) {
      newFlags = newFlags.replace(flag, '');
    } else {
      newFlags += flag;
    }
    setFlags(newFlags);
  };

  // Compile and run matches
  const runEvaluation = useCallback(() => {
    setError('');
    setMatches([]);
    setTransformedText('');

    if (!pattern.trim() || !testString) return;

    try {
      const regex = new RegExp(pattern, flags);
      const isGlobal = flags.includes('g');
      const compiledForExec = new RegExp(pattern, isGlobal ? flags : flags + 'g');

      const found: MatchGroup[] = [];
      let matchExec: RegExpExecArray | null = null;
      let count = 0;
      const MAX_MATCHES = 1000;

      while ((matchExec = compiledForExec.exec(testString)) !== null) {
        count++;
        const groups = matchExec.slice(1).map((g) => (g !== undefined ? g : ''));
        const namedGroups = matchExec.groups
          ? Object.fromEntries(Object.entries(matchExec.groups).map(([k, v]) => [k, v ?? '']))
          : undefined;

        found.push({
          index: count,
          match: matchExec[0],
          startIndex: matchExec.index,
          endIndex: matchExec.index + matchExec[0].length,
          groups,
          namedGroups,
        });

        if (!isGlobal || count >= MAX_MATCHES) break;
        if (matchExec[0].length === 0) {
          compiledForExec.lastIndex++;
        }
      }

      setMatches(found);

      // Perform replacement preview
      try {
        const replaced = testString.replace(regex, replacement);
        setTransformedText(replaced);
      } catch {
        setTransformedText(testString);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || tUI('invalidRegex'));
      setMatches([]);
    }
  }, [pattern, flags, testString, replacement, tUI]);

  useEffect(() => {
    runEvaluation();
  }, [runEvaluation]);

  // Copy Matches Handler
  const handleCopyMatches = () => {
    if (matches.length === 0) return;
    const text = matches.map((m) => m.match).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedMatches(true);
    setTimeout(() => setCopiedMatches(false), 2000);
  };

  // Copy Transformed Text Handler
  const handleCopyReplaced = () => {
    if (!transformedText) return;
    navigator.clipboard.writeText(transformedText);
    setCopiedReplaced(true);
    setTimeout(() => setCopiedReplaced(false), 2000);
  };

  // Export JSON
  const handleExportJson = () => {
    const data = JSON.stringify(matches, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'regex-matches.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export CSV
  const handleExportCsv = () => {
    const header = 'Index,Match,StartIndex,EndIndex,Groups\n';
    const rows = matches
      .map((m) => {
        const cleanMatch = `"${m.match.replace(/"/g, '""')}"`;
        const cleanGroups = `"${m.groups.join(' | ').replace(/"/g, '""')}"`;
        return `${m.index},${cleanMatch},${m.startIndex},${m.endIndex},${cleanGroups}`;
      })
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'regex-matches.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Highlight matches inside test corpus
  const renderedHighlighted = useMemo(() => {
    if (!testString || matches.length === 0 || error) return null;

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    matches.forEach((m, idx) => {
      if (m.startIndex > lastIndex) {
        parts.push(<span key={`text-${idx}`}>{testString.slice(lastIndex, m.startIndex)}</span>);
      }
      parts.push(
        <mark
          key={`match-${idx}`}
          style={{
            backgroundColor: '#38bdf8',
            color: '#0f172a',
            padding: '2px 4px',
            borderRadius: '4px',
            fontWeight: 700,
          }}
        >
          {m.match}
        </mark>
      );
      lastIndex = m.endIndex;
    });

    if (lastIndex < testString.length) {
      parts.push(<span key="text-end">{testString.slice(lastIndex)}</span>);
    }

    return parts;
  }, [testString, matches, error]);

  // AI Generator Logic
  const handleGenerateAi = (presetQuery?: string) => {
    const query = (presetQuery || aiPrompt).toLowerCase().trim();
    if (!query) return;

    let genPattern = '';
    let genFlags = 'g';
    let genExplanation = '';
    let genSample = '';

    if (query.includes('email') || query.includes('mail')) {
      genPattern = '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}';
      genFlags = 'gi';
      genExplanation =
        'Matches alphanumeric names with allowed characters (_%+-), followed by @, valid domain labels, and TLD of at least 2 characters.';
      genSample = 'Contact dev@velnoxlabs.com or hello@example.org for inquiries.';
    } else if (query.includes('url') || query.includes('http') || query.includes('link')) {
      genPattern =
        'https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)';
      genFlags = 'gi';
      genExplanation =
        'Captures standard web protocols (http or https), optional www prefix, domain, TLD, and trailing path parameters.';
      genSample = 'Check out https://velnoxlabs.com/tools/regex-tester for testing.';
    } else if (query.includes('ip') || query.includes('ipv4')) {
      genPattern =
        '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b';
      genFlags = 'g';
      genExplanation =
        'Accurately verifies four decimal octets in range 0-255 separated by periods with word boundaries.';
      genSample = 'Primary server: 192.168.1.1, Secondary DNS: 8.8.8.8.';
    } else if (query.includes('date') || query.includes('year') || query.includes('calendar')) {
      genPattern = '\\b(\\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])\\b';
      genFlags = 'g';
      genExplanation =
        'Validates YYYY-MM-DD format with capture groups for 4-digit Year, Month (01-12), and Day (01-31).';
      genSample = 'Records from 2026-05-15 to 2026-11-24 were verified.';
    } else if (query.includes('phone') || query.includes('number') || query.includes('mobile')) {
      genPattern = '\\+?[1-9]\\d{1,14}(?:\\s?\\d{3,4}){2}';
      genFlags = 'g';
      genExplanation =
        'Matches international phone numbers with optional leading +, country code, and grouped digits.';
      genSample = 'Emergency dispatch: +1 555 882 1920 or +44 7700 900123.';
    } else if (query.includes('password') || query.includes('secret')) {
      genPattern = '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$';
      genFlags = 'm';
      genExplanation =
        'Requires minimum 8 characters, containing at least 1 uppercase letter, 1 lowercase letter, 1 digit, and 1 special symbol.';
      genSample = 'Secur3#Pass2026\nsimplepwd\nNoSpecial123';
    } else if (query.includes('hex') || query.includes('color')) {
      genPattern = '#(?:[0-9a-fA-F]{3}){1,2}\\b';
      genFlags = 'gi';
      genExplanation =
        'Matches 3-digit and 6-digit hex color representations starting with a hash character (#).';
      genSample = 'Theme colors: #3b82f6, #fff, #10b981, #222222.';
    } else if (query.includes('slug') || query.includes('kebab')) {
      genPattern = '^[a-z0-9]+(?:-[a-z0-9]+)*$';
      genFlags = 'm';
      genExplanation =
        'Validates SEO-friendly kebab-case strings with lowercase letters and numbers separated by single hyphens.';
      genSample = 'ai-regex-tester\nquick-start-guide\nInvalid_Slug!';
    } else {
      // General heuristic generator
      genPattern = '\\b[A-Za-z0-9_-]+\\b';
      genFlags = 'g';
      genExplanation = 'General alphanumeric word matching with underscore and hyphen support.';
      genSample = 'Sample string for generic pattern extraction.';
    }

    setPattern(genPattern);
    setFlags(genFlags);
    setAiExplanation(genExplanation);
    setTestString(genSample);
  };

  // RegEx Token Explainer Breakdown
  const explainerTokens: ExplainerToken[] = useMemo(() => {
    const list: ExplainerToken[] = [];
    if (!pattern) return list;

    const p = pattern;

    if (p.includes('^'))
      list.push({
        token: '^',
        meaning: 'Asserts the start of the string (or line in multiline mode).',
      });
    if (p.includes('$'))
      list.push({
        token: '$',
        meaning: 'Asserts the end of the string (or line in multiline mode).',
      });
    if (p.includes('\\b'))
      list.push({
        token: '\\b',
        meaning:
          'Word boundary: matches at a position where one side is a word character and the other is not.',
      });
    if (p.includes('\\d'))
      list.push({ token: '\\d', meaning: 'Digit character: matches any single numeral [0-9].' });
    if (p.includes('\\D'))
      list.push({
        token: '\\D',
        meaning: 'Non-digit: matches any character that is not a numeric digit.',
      });
    if (p.includes('\\w'))
      list.push({
        token: '\\w',
        meaning: 'Word character: matches any alphanumeric character or underscore [A-Za-z0-9_].',
      });
    if (p.includes('\\s'))
      list.push({
        token: '\\s',
        meaning: 'Whitespace: matches space, tab, newline, or carriage return.',
      });
    if (p.includes('.'))
      list.push({
        token: '.',
        meaning: "Wildcard: matches any single character (except newlines unless 's' flag is on).",
      });
    if (p.includes('+'))
      list.push({
        token: '+',
        meaning: 'Plus quantifier: matches 1 or more consecutive occurrences greedily.',
      });
    if (p.includes('*'))
      list.push({
        token: '*',
        meaning: 'Star quantifier: matches 0 or more occurrences greedily.',
      });
    if (p.includes('?'))
      list.push({
        token: '?',
        meaning:
          'Optional quantifier: matches 0 or 1 occurrence (or makes a quantifier non-greedy).',
      });
    if (p.includes('|'))
      list.push({
        token: '|',
        meaning: 'Alternation (OR operator): matches expression before OR after the pipe.',
      });
    if (/\[.*?\]/.test(p))
      list.push({
        token: '[...]',
        meaning: 'Character class: matches any single character contained within the brackets.',
      });
    if (/\(.*?=.*?\)/.test(p))
      list.push({
        token: '(?=...)',
        meaning:
          'Positive Lookahead: asserts that what immediately follows matches the pattern without consuming characters.',
      });
    if (/\(.*?\)/.test(p) && !/\(\?/.test(p))
      list.push({
        token: '(...)',
        meaning:
          'Capturing group: isolates matched substring into a numbered or reusable backreference.',
      });

    if (list.length === 0) {
      list.push({
        token: pattern,
        meaning: 'Literal string match: searches for exact character sequence.',
      });
    }

    return list;
  }, [pattern]);

  // Code Snippet Generators
  const generateSnippet = (lang: string) => {
    const escSample = testString.slice(0, 100).replace(/"/g, '\\"');

    switch (lang) {
      case 'python': {
        const pyFlags: string[] = [];
        if (flags.includes('i')) pyFlags.push('re.IGNORECASE');
        if (flags.includes('m')) pyFlags.push('re.MULTILINE');
        if (flags.includes('s')) pyFlags.push('re.DOTALL');
        const flagArg = pyFlags.length > 0 ? `, ${pyFlags.join(' | ')}` : '';
        return `# Python 3 (re module)
import re

pattern = r"${pattern}"
text = """${testString}"""

matches = re.findall(pattern, text${flagArg})
print(f"Total Matches: {len(matches)}")
for match in matches:
    print("Match:", match)`;
      }
      case 'java': {
        const javaFlags: string[] = [];
        if (flags.includes('i')) javaFlags.push('Pattern.CASE_INSENSITIVE');
        if (flags.includes('m')) javaFlags.push('Pattern.MULTILINE');
        if (flags.includes('s')) javaFlags.push('Pattern.DOTALL');
        const flagArg = javaFlags.length > 0 ? `, ${javaFlags.join(' | ')}` : '';
        return `// Java (java.util.regex)
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class RegexApp {
    public static void main(String[] args) {
        String pattern = "${pattern.replace(/\\/g, '\\\\')}";
        String text = "${escSample}";

        Pattern p = Pattern.compile(pattern${flagArg});
        Matcher m = p.matcher(text);

        while (m.find()) {
            System.out.println("Match: " + m.group() + " at [" + m.start() + "-" + m.end() + "]");
        }
    }
}`;
      }
      case 'csharp': {
        const csFlags: string[] = [];
        if (flags.includes('i')) csFlags.push('RegexOptions.IgnoreCase');
        if (flags.includes('m')) csFlags.push('RegexOptions.Multiline');
        if (flags.includes('s')) csFlags.push('RegexOptions.Singleline');
        const flagArg = csFlags.length > 0 ? `, ${csFlags.join(' | ')}` : '';
        return `// C# / .NET (System.Text.RegularExpressions)
using System;
using System.Text.RegularExpressions;

class Program {
    static void Main() {
        string pattern = @"${pattern}";
        string text = @"${testString.replace(/"/g, '""')}";

        MatchCollection matches = Regex.Matches(text, pattern${flagArg});
        Console.WriteLine($"Found {matches.Count} matches:");
        foreach (Match m in matches) {
            Console.WriteLine($"Match: {m.Value} at index {m.Index}");
        }
    }
}`;
      }
      case 'js': {
        return `// JavaScript / Node.js
const regex = /${pattern}/${flags};
const text = \`${testString.replace(/`/g, '\\`')}\`;

const matches = [...text.matchAll(regex)];
console.log(\`Found \${matches.length} matches:\`);
matches.forEach((m, i) => {
  console.log(\`#\${i + 1}: \${m[0]} (Index: \${m.index})\`);
});`;
      }
      case 'go': {
        return `// Go (regexp package)
package main

import (
    "fmt"
    "regexp"
)

func main() {
    pattern := \`${pattern}\`
    text := \`${testString}\`

    re := regexp.MustCompile(pattern)
    matches := re.FindAllString(text, -1)

    fmt.Printf("Matches found: %d\\n", len(matches))
    for _, m := range matches {
        fmt.Println("Match:", m)
    }
}`;
      }
      default:
        return '';
    }
  };

  const handleCopyCode = (lang: string) => {
    const code = generateSnippet(lang);
    navigator.clipboard.writeText(code);
    setCopiedCodeLang(lang);
    setTimeout(() => setCopiedCodeLang(null), 2000);
  };

  const loadPreset = (preset: (typeof COMMON_PRESETS)[0]) => {
    setPattern(preset.pattern);
    setFlags(preset.flags);
    setTestString(preset.sample);
    setActiveTab('tester');
  };

  return (
    <>
      <GlobalContainer maxWidth="2xl">
        <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          <SectionHeading title={tUI('title')} subtitle={tUI('subtitle')} />

          {/* Navigation Tabs */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              marginTop: 'var(--space-6)',
              marginBottom: '16px',
            }}
          >
            {[
              { id: 'tester', label: tUI('tabTester'), icon: Play },
              { id: 'replace', label: tUI('tabReplace'), icon: ArrowLeftRight },
              { id: 'aiGenerator', label: tUI('tabAiGenerator'), icon: Sparkles },
              { id: 'explainer', label: tUI('tabExplainer'), icon: BookOpen },
              { id: 'code', label: tUI('tabCode'), icon: Code2 },
              { id: 'cheatsheet', label: tUI('tabCheatsheet'), icon: Library },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabMode)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: isActive ? '1px solid #3b82f6' : '1px solid var(--border-color)',
                    backgroundColor: isActive ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-card)',
                    color: isActive ? '#60a5fa' : 'var(--text-main)',
                  }}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Main Card Container */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '24px',
            }}
          >
            {/* ================= TAB 1: REGEX TESTER ================= */}
            {activeTab === 'tester' && (
              <div>
                {/* Pattern & Flags Row */}
                <div style={{ marginBottom: '16px' }}>
                  <label
                    style={{
                      color: 'var(--text-main)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      display: 'block',
                      marginBottom: '8px',
                    }}
                  >
                    {tUI('patternLabel')}
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div
                      style={{
                        position: 'relative',
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        padding: '0 12px',
                      }}
                    >
                      <span
                        style={{
                          color: 'var(--text-muted)',
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          fontSize: '1.1rem',
                        }}
                      >
                        /
                      </span>
                      <input
                        type="text"
                        value={pattern}
                        onChange={(e) => setPattern(e.target.value)}
                        placeholder={tUI('patternPlaceholder')}
                        style={{
                          width: '100%',
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: '#38bdf8',
                          padding: '12px 8px',
                          fontSize: '1rem',
                          fontWeight: 600,
                          outline: 'none',
                          fontFamily: 'monospace',
                        }}
                      />
                      <span
                        style={{
                          color: 'var(--text-muted)',
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          fontSize: '1.1rem',
                        }}
                      >
                        /{flags}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Flags Checkbox Strip */}
                <div style={{ marginBottom: '20px' }}>
                  <label
                    style={{
                      color: 'var(--text-muted)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      display: 'block',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {tUI('flagsLabel')}
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {flagOptions.map((f) => {
                      const isChecked = flags.includes(f.key);
                      return (
                        <button
                          key={f.key}
                          type="button"
                          onClick={() => toggleFlag(f.key)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            backgroundColor: isChecked
                              ? 'rgba(59, 130, 246, 0.2)'
                              : 'var(--bg-page)',
                            border: isChecked
                              ? '1px solid #3b82f6'
                              : '1px solid var(--border-color)',
                            color: isChecked ? '#60a5fa' : 'var(--text-main)',
                          }}
                        >
                          <span
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: isChecked ? '#3b82f6' : 'var(--text-muted)',
                            }}
                          />
                          <span>{f.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Syntax Error Banner */}
                {error && (
                  <div
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      color: '#f87171',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      marginBottom: '16px',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                    }}
                  >
                    ⚠️ {error}
                  </div>
                )}

                {/* Test String Input */}
                <div style={{ marginBottom: '20px' }}>
                  <label
                    style={{
                      color: 'var(--text-main)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      display: 'block',
                      marginBottom: '8px',
                    }}
                  >
                    {tUI('testStringLabel')}
                  </label>
                  <textarea
                    rows={5}
                    value={testString}
                    onChange={(e) => setTestString(e.target.value)}
                    placeholder={tUI('testStringPlaceholder')}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      padding: '12px',
                      fontSize: '0.9rem',
                      outline: 'none',
                      fontFamily: 'monospace',
                      lineHeight: '1.6',
                    }}
                  />
                </div>

                {/* Live Match Summary & Export Bar */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '14px',
                    padding: '12px 16px',
                    backgroundColor: 'var(--bg-page)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#38bdf8' }}>
                    {tUI('matchesFound', { count: matches.length })}
                  </span>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    <button
                      onClick={handleCopyMatches}
                      disabled={matches.length === 0}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: matches.length === 0 ? 'not-allowed' : 'pointer',
                        backgroundColor: copiedMatches
                          ? 'rgba(16, 185, 129, 0.2)'
                          : 'var(--bg-card)',
                        color: copiedMatches ? '#34d399' : 'var(--text-main)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      {copiedMatches ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copiedMatches ? tUI('copied') : tUI('copyMatches')}</span>
                    </button>
                    <button
                      onClick={handleExportJson}
                      disabled={matches.length === 0}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: matches.length === 0 ? 'not-allowed' : 'pointer',
                        backgroundColor: 'var(--bg-card)',
                        color: 'var(--text-main)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <Download size={14} />
                      <span>{tUI('exportJson')}</span>
                    </button>
                    <button
                      onClick={handleExportCsv}
                      disabled={matches.length === 0}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: matches.length === 0 ? 'not-allowed' : 'pointer',
                        backgroundColor: 'var(--bg-card)',
                        color: 'var(--text-main)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <Download size={14} />
                      <span>{tUI('exportCsv')}</span>
                    </button>
                  </div>
                </div>

                {/* Highlighted Output Preview */}
                {testString && (
                  <div style={{ marginBottom: '20px' }}>
                    <label
                      style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        display: 'block',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {tUI('highlightedOutput')}
                    </label>
                    <div
                      style={{
                        padding: '16px',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        fontFamily: 'monospace',
                        fontSize: '0.9rem',
                        lineHeight: '1.7',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-all',
                        maxHeight: '220px',
                        overflowY: 'auto',
                      }}
                    >
                      {renderedHighlighted || (
                        <span style={{ color: 'var(--text-muted)' }}>
                          {tUI('highlightedPlaceholder')}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Matches & Capture Groups Detailed List */}
                {matches.length > 0 && (
                  <div>
                    <label
                      style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        display: 'block',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {tUI('matchList')}
                    </label>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        maxHeight: '280px',
                        overflowY: 'auto',
                      }}
                    >
                      {matches.map((m) => (
                        <div
                          key={m.index}
                          style={{
                            padding: '12px',
                            backgroundColor: 'var(--bg-page)',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '6px',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span
                                style={{
                                  fontSize: '0.75rem',
                                  fontWeight: 800,
                                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                                  color: '#60a5fa',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                }}
                              >
                                #{m.index}
                              </span>
                              <span
                                style={{
                                  fontFamily: 'monospace',
                                  fontWeight: 700,
                                  color: '#34d399',
                                  fontSize: '0.95rem',
                                }}
                              >
                                {m.match}
                              </span>
                            </div>
                            <span
                              style={{
                                fontSize: '0.75rem',
                                color: 'var(--text-muted)',
                                fontFamily: 'monospace',
                              }}
                            >
                              {tUI('indexRange', { start: m.startIndex, end: m.endIndex })}
                            </span>
                          </div>

                          {/* Sub-groups if any */}
                          {m.groups.length > 0 && (
                            <div
                              style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '8px',
                                marginTop: '6px',
                                paddingLeft: '8px',
                                borderLeft: '2px solid rgba(59, 130, 246, 0.3)',
                              }}
                            >
                              {m.groups.map((grp, gIdx) => (
                                <span
                                  key={gIdx}
                                  style={{
                                    fontSize: '0.8rem',
                                    fontFamily: 'monospace',
                                    color: 'var(--text-muted)',
                                  }}
                                >
                                  <strong style={{ color: '#60a5fa' }}>${gIdx + 1}:</strong>{' '}
                                  {grp || '""'}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ================= TAB 2: REPLACE & SUBSTITUTE ================= */}
            {activeTab === 'replace' && (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <label
                    style={{
                      color: 'var(--text-main)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      display: 'block',
                      marginBottom: '6px',
                    }}
                  >
                    {tUI('replaceLabel')}
                  </label>
                  <input
                    type="text"
                    value={replacement}
                    onChange={(e) => setReplacement(e.target.value)}
                    placeholder={tUI('replacePlaceholder')}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: '#34d399',
                      padding: '12px',
                      fontSize: '0.95rem',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      outline: 'none',
                    }}
                  />
                  <div
                    style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}
                  >
                    Tip: Use <code style={{ color: '#60a5fa' }}>$&</code> for full match,{' '}
                    <code style={{ color: '#60a5fa' }}>$1</code>,{' '}
                    <code style={{ color: '#60a5fa' }}>$2</code> for capture groups.
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '6px',
                    }}
                  >
                    <label
                      style={{ color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 600 }}
                    >
                      {tUI('replaceOutputLabel')}
                    </label>
                    <button
                      onClick={handleCopyReplaced}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        backgroundColor: copiedReplaced
                          ? 'rgba(16, 185, 129, 0.2)'
                          : 'var(--bg-page)',
                        color: copiedReplaced ? '#34d399' : 'var(--text-main)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      {copiedReplaced ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedReplaced ? tUI('copied') : tUI('copyReplaced')}</span>
                    </button>
                  </div>
                  <div
                    style={{
                      padding: '14px',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      fontFamily: 'monospace',
                      fontSize: '0.9rem',
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all',
                      minHeight: '140px',
                      maxHeight: '260px',
                      overflowY: 'auto',
                    }}
                  >
                    {transformedText}
                  </div>
                </div>
              </div>
            )}

            {/* ================= TAB 3: AI REGEX GENERATOR ================= */}
            {activeTab === 'aiGenerator' && (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {tUI('aiGenTitle')}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {tUI('aiGenSubtitle')}
                  </p>
                </div>

                {/* Quick Presets for Prompt */}
                <div style={{ marginBottom: '16px' }}>
                  <label
                    style={{
                      color: 'var(--text-muted)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      display: 'block',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {tUI('aiQuickPrompts')}
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {[
                      { key: 'presetEmail' as const, query: 'email address' },
                      { key: 'presetUrl' as const, query: 'http https web url' },
                      { key: 'presetIpv4' as const, query: 'ipv4 address' },
                      { key: 'presetDate' as const, query: 'date yyyy-mm-dd' },
                      { key: 'presetPhone' as const, query: 'international phone number' },
                      { key: 'presetPassword' as const, query: 'strong password' },
                      { key: 'presetHex' as const, query: 'hex color code' },
                      { key: 'presetSlug' as const, query: 'url slug' },
                    ].map((p) => (
                      <button
                        key={p.key}
                        onClick={() => {
                          setAiPrompt(p.query);
                          handleGenerateAi(p.query);
                        }}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          backgroundColor: 'var(--bg-page)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-main)',
                          cursor: 'pointer',
                        }}
                      >
                        {tUI(p.key)}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label
                    style={{
                      color: 'var(--text-main)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      display: 'block',
                      marginBottom: '6px',
                    }}
                  >
                    {tUI('aiPromptLabel')}
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder={tUI('aiPromptPlaceholder')}
                      style={{
                        flex: 1,
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'var(--text-main)',
                        padding: '12px',
                        fontSize: '0.9rem',
                        outline: 'none',
                      }}
                    />
                    <button
                      onClick={() => handleGenerateAi()}
                      style={{
                        backgroundColor: '#3b82f6',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '12px 20px',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                      }}
                    >
                      <Sparkles size={16} />
                      <span>{tUI('aiGenerateButton')}</span>
                    </button>
                  </div>
                </div>

                {/* Generated Result Preview */}
                {pattern && (
                  <div
                    style={{
                      padding: '16px',
                      backgroundColor: 'var(--bg-page)',
                      borderRadius: '8px',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                    }}
                  >
                    <div style={{ marginBottom: '10px' }}>
                      <span
                        style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}
                      >
                        Generated Regular Expression:
                      </span>
                      <div
                        style={{
                          fontSize: '1.05rem',
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          color: '#38bdf8',
                          marginTop: '4px',
                        }}
                      >
                        /{pattern}/{flags}
                      </div>
                    </div>

                    {aiExplanation && (
                      <p
                        style={{
                          fontSize: '0.85rem',
                          color: 'var(--text-main)',
                          marginBottom: '14px',
                          lineHeight: '1.5',
                        }}
                      >
                        {aiExplanation}
                      </p>
                    )}

                    <button
                      onClick={() => setActiveTab('tester')}
                      style={{
                        backgroundColor: 'rgba(59, 130, 246, 0.15)',
                        border: '1px solid #3b82f6',
                        color: '#60a5fa',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Play size={14} />
                      <span>{tUI('aiLoadIntoTester')}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ================= TAB 4: REGEX EXPLAINER ================= */}
            {activeTab === 'explainer' && (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {tUI('explainerTitle')}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {tUI('explainerSubtitle')}
                  </p>
                </div>

                <div
                  style={{
                    padding: '12px 16px',
                    backgroundColor: 'var(--bg-page)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    marginBottom: '16px',
                    fontFamily: 'monospace',
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: '#38bdf8',
                  }}
                >
                  /{pattern}/{flags}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {explainerTokens.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        padding: '12px 14px',
                        backgroundColor: 'var(--bg-page)',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <span
                        style={{
                          backgroundColor: 'rgba(59, 130, 246, 0.15)',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          color: '#60a5fa',
                          fontFamily: 'monospace',
                          fontWeight: 800,
                          fontSize: '0.95rem',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          minWidth: '60px',
                          textAlign: 'center',
                        }}
                      >
                        {item.token}
                      </span>
                      <span
                        style={{
                          fontSize: '0.85rem',
                          color: 'var(--text-main)',
                          lineHeight: '1.5',
                        }}
                      >
                        {item.meaning}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ================= TAB 5: MULTI-LANGUAGE CODE SNIPPETS ================= */}
            {activeTab === 'code' && (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {tUI('codeTitle')}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {tUI('codeSubtitle')}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {[
                    { id: 'python', name: tUI('codeLangPython') },
                    { id: 'java', name: tUI('codeLangJava') },
                    { id: 'csharp', name: tUI('codeLangCsharp') },
                    { id: 'js', name: tUI('codeLangJs') },
                    { id: 'go', name: tUI('codeLangGo') },
                  ].map((lang) => {
                    const isCopied = copiedCodeLang === lang.id;
                    return (
                      <div
                        key={lang.id}
                        style={{
                          backgroundColor: 'var(--bg-page)',
                          borderRadius: '8px',
                          border: '1px solid var(--border-color)',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '10px 14px',
                            borderBottom: '1px solid var(--border-color)',
                            backgroundColor: 'rgba(0, 0, 0, 0.1)',
                          }}
                        >
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#60a5fa' }}>
                            {lang.name}
                          </span>
                          <button
                            onClick={() => handleCopyCode(lang.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '4px 10px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              backgroundColor: isCopied
                                ? 'rgba(16, 185, 129, 0.2)'
                                : 'var(--bg-card)',
                              color: isCopied ? '#34d399' : 'var(--text-main)',
                              border: '1px solid var(--border-color)',
                            }}
                          >
                            {isCopied ? <Check size={12} /> : <Copy size={12} />}
                            <span>{isCopied ? tUI('copied') : tUI('copyCode')}</span>
                          </button>
                        </div>
                        <pre
                          style={{
                            padding: '14px',
                            margin: 0,
                            fontFamily: 'monospace',
                            fontSize: '0.85rem',
                            lineHeight: '1.5',
                            color: 'var(--text-main)',
                            overflowX: 'auto',
                          }}
                        >
                          {generateSnippet(lang.id)}
                        </pre>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ================= TAB 6: CHEATSHEET & LIBRARY ================= */}
            {activeTab === 'cheatsheet' && (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {tUI('cheatsheetTitle')}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {tUI('cheatsheetSubtitle')}
                  </p>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '14px',
                  }}
                >
                  {COMMON_PRESETS.map((p) => (
                    <div
                      key={p.id}
                      style={{
                        padding: '16px',
                        backgroundColor: 'var(--bg-page)',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontWeight: 700,
                            color: '#60a5fa',
                            fontSize: '0.95rem',
                            marginBottom: '6px',
                          }}
                        >
                          {p.name}
                        </div>
                        <div
                          style={{
                            fontSize: '0.78rem',
                            color: 'var(--text-muted)',
                            marginBottom: '10px',
                          }}
                        >
                          {p.description}
                        </div>
                        <div
                          style={{
                            fontFamily: 'monospace',
                            fontSize: '0.8rem',
                            color: '#34d399',
                            backgroundColor: 'var(--bg-card)',
                            padding: '8px',
                            borderRadius: '6px',
                            border: '1px solid var(--border-color)',
                            wordBreak: 'break-all',
                            marginBottom: '12px',
                          }}
                        >
                          /{p.pattern}/{p.flags}
                        </div>
                      </div>

                      <button
                        onClick={() => loadPreset(p)}
                        style={{
                          width: '100%',
                          backgroundColor: 'rgba(59, 130, 246, 0.15)',
                          border: '1px solid rgba(59, 130, 246, 0.4)',
                          color: '#60a5fa',
                          borderRadius: '6px',
                          padding: '8px',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                      >
                        <Play size={14} />
                        <span>{tUI('loadPreset')}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Centralized SEO & Structured Schema - Zero Duplicate Inline JSON-LD */}
          <ToolSeoContent
            toolSlug="regex-tester"
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
