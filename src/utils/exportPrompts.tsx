import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
} from 'docx';
import { saveAs } from 'file-saver';
import { SupabaseClient } from '@supabase/supabase-js';

type PromptRow = {
  title: string | null;
  description: string | null;
  content: string;
  categories: { name: string | null } | null;
};

interface ExportPromptsParams {
  supabase: SupabaseClient;
  userId: string;
  username: string;
}

/** ---------- Trace types ---------- */
type DropReason = 'control' | 'orphanHigh' | 'orphanLow';
type TraceEvent = { ts: string; msg: string; meta?: any };

interface PromptTrace {
  index: number;
  titlePreview: string;
  category?: string;
  drops: Record<DropReason, number>;
  original: { titleLen: number; descLen: number; catLen: number; contentLen: number };
  contentLines: number;
}

interface ExportTrace {
  startedAt: string;
  endedAt?: string;
  durationMs?: number;
  userId: string;
  username: string;
  queryCount?: number;
  sortedCount?: number;
  categoryCount?: number;
  removedCharsTotal: number;
  prompts: PromptTrace[];
  events: TraceEvent[];
  error?: { message: string; stack?: string };
}


const XML_DOCX_MIME =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

const nowIso = () => new Date().toISOString();

function safeFileName(name: string): string {
  // Cross-platform safe filename
  return name.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').slice(0, 120);
}

/**
 * XML 1.0 safe sanitizer for DOCX content
 * - strips illegal control chars (U+0000–0008, 000B, 000C, 000E–001F)
 * - drops orphan surrogate halves
 */
function sanitizeXml(
  input?: string | null,
  onDrop?: (reason: DropReason, code: number, i: number) => void,
): string {
  if (!input) return '';
  let out = '';
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);

    if ((c >= 0x00 && c <= 0x08) || c === 0x0b || c === 0x0c || (c >= 0x0e && c <= 0x1f)) {
      onDrop?.('control', c, i);
      continue;
    }
    if (c >= 0xd800 && c <= 0xdbff) {
      const d = input.charCodeAt(i + 1);
      if (d >= 0xdc00 && d <= 0xdfff) {
        out += input[i] + input[i + 1];
        i++;
      } else {
        onDrop?.('orphanHigh', c, i);
      }
      continue;
    }
    if (c >= 0xdc00 && c <= 0xdfff) {
      onDrop?.('orphanLow', c, i);
      continue;
    }
    out += input[i];
  }
  return out;
}

function trPara(
  text: string,
  opts?: {
    spacing?: { before?: number; after?: number };
    alignment?: AlignmentType;
    bold?: boolean;
    size?: number; 
    color?: string;
    highlight?: string; 
  },
): Paragraph {
  const run = new TextRun({
    text: sanitizeXml(text),
    bold: opts?.bold,
    size: opts?.size,
    color: opts?.color,
    highlight: opts?.highlight as any,
  });
  return new Paragraph({
    children: [run],
    alignment: opts?.alignment,
    spacing: opts?.spacing,
  });
}

// Simple key-value line (Label: Value)
function kvPara(label: string, value: string, opts?: { boldVal?: boolean; size?: number; color?: string }) {
  return new Paragraph({
    children: [
      new TextRun({ text: `${label}: `, bold: true, size: opts?.size ?? 28 }),
      new TextRun({ text: sanitizeXml(value), bold: opts?.boldVal, size: opts?.size ?? 28, color: opts?.color }),
    ],
    spacing: { after: 200 },
  });
}

function dividerPara() {
  return trPara('⎯⎯⎯ ✶ ⎯⎯⎯ ✶ ⎯⎯⎯', {
    alignment: AlignmentType.CENTER,
    spacing: { before: 300, after: 300 },
  });
}

// Category header: centered + bold + highlighted
function categoryHeader(name: string) {
  return trPara(name, {
    alignment: AlignmentType.CENTER,
    bold: true,
    size: 44,           // ~22pt
    highlight: 'yellow' // visual emphasis
  });
}

function addEvent(trace: ExportTrace, msg: string, meta?: any) {
  trace.events.push({ ts: nowIso(), msg, meta });
}

export async function exportPrompts({
  supabase,
  userId,
  username,
}: ExportPromptsParams): Promise<void> {
  const trace: ExportTrace = {
    startedAt: nowIso(),
    userId,
    username,
    removedCharsTotal: 0,
    prompts: [],
    events: [],
  };

  const baseName = `${safeFileName(username)}_prompts_${new Date().toISOString().slice(0, 10)}`;

  try {
    addEvent(trace, 'Supabase query start');
    const { data: prompts, error } = await supabase
      .from('prompts')
      .select<PromptRow[]>(
        `
          title,
          description,
          content,
          categories (
            name
          )
        `
      )
      .eq('user_id', userId);

    if (error) {
      addEvent(trace, 'Supabase error', { message: error.message });
      throw new Error(error.message);
    }

    trace.queryCount = (prompts ?? []).length;
    addEvent(trace, 'Query done', { count: trace.queryCount });

    // Sort by category (case-insensitive), then by title
    const sorted = (prompts ?? []).sort((a, b) => {
      const catA = (a.categories?.name ?? 'Uncategorized').toLowerCase();
      const catB = (b.categories?.name ?? 'Uncategorized').toLowerCase();
      if (catA !== catB) return catA.localeCompare(catB);
      return (a.title ?? '').localeCompare(b.title ?? '', undefined, { sensitivity: 'base' });
    });
    trace.sortedCount = sorted.length;

    // Build category buckets
    const buckets = new Map<string, { name: string; items: PromptRow[] }>();
    for (const p of sorted) {
      const raw = (p.categories?.name ?? '').trim();
      const cat = raw.length ? raw : 'Uncategorized';
      const key = cat.toLowerCase();
      if (!buckets.has(key)) buckets.set(key, { name: cat, items: [] });
      buckets.get(key)!.items.push(p);
    }
    const bucketList = Array.from(buckets.values()).sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    );
    trace.categoryCount = bucketList.length;
    addEvent(trace, 'Buckets built', {
      categoryCount: bucketList.length,
      categories: bucketList.map(b => b.name),
    });

    // Header
    const header = trPara(`All prompts printed (${sorted.length}) — grouped by category (${bucketList.length})`, {
      bold: true,
      spacing: { after: 300 },
    });

    // Build DOCX body: Category header -> prompts... then next category
    const blocks: Paragraph[] = [];
    addEvent(trace, 'DOCX body build start');

    let globalIndex = 0; // NOTE: numbering is global; reset here if you want per-category

    for (const bucket of bucketList) {
      // Category heading
      const catSan = sanitizeXml(bucket.name);
      blocks.push(categoryHeader(catSan));
      blocks.push(trPara(' ', { spacing: { after: 100 } })); // small spacer

      // Prompts within this category (already title-sorted)
      for (const p of bucket.items) {
        globalIndex++;

        const drops: Record<DropReason, number> = { control: 0, orphanHigh: 0, orphanLow: 0 };
        const onDrop = (reason: DropReason) => {
          drops[reason] += 1;
          trace.removedCharsTotal += 1;
        };

        const titleSan = sanitizeXml(p.title ?? '', onDrop);
        const descSan  = sanitizeXml(p.description ?? '', onDrop);
        const catOut   = sanitizeXml(bucket.name, onDrop);
        const contentSan = sanitizeXml(p.content ?? '', onDrop);
        const lines = contentSan.split(/\r?\n/);

        trace.prompts.push({
          index: globalIndex,
          titlePreview: titleSan.slice(0, 80),
          category: bucket.name,
          drops,
          original: {
            titleLen: p.title?.length ?? 0,
            descLen: p.description?.length ?? 0,
            catLen: p.categories?.name?.length ?? 0,
            contentLen: p.content?.length ?? 0,
          },
          contentLines: lines.length,
        });

        // "Prompt #n"
        blocks.push(trPara(`Prompt #${globalIndex}`, { spacing: { after: 200 } }));

        // Metadata lines
        blocks.push(kvPara('Title', titleSan, { boldVal: true, size: 32, color: 'FFA500' }));
        blocks.push(kvPara('Description', descSan));
        blocks.push(kvPara('Category', catOut, { color: '00AA00' }));

        // Content
        blocks.push(
          new Paragraph({
            children: [new TextRun({ text: 'Content:', bold: true })],
            spacing: { after: 200 },
          }),
        );

        for (const line of lines) {
          const text = line.length ? line : ' ';
          blocks.push(new Paragraph({ children: [new TextRun({ text })] }));
        }

        // Divider between prompts
        blocks.push(dividerPara());
      }

      // Extra spacing between categories
      blocks.push(trPara(' ', { spacing: { after: 200 } }));
    }

    addEvent(trace, 'DOCX body build done', { paras: blocks.length });

    // TRACE SECTION at the end
    addEvent(trace, 'Trace section build start');
    const traceHeader = trPara('— Generation Trace —', {
      bold: true,
      spacing: { before: 600, after: 200 },
      alignment: AlignmentType.CENTER,
      size: 32,
    });

    trace.endedAt = nowIso();
    trace.durationMs = Date.parse(trace.endedAt) - Date.parse(trace.startedAt);

    const traceSummary: Paragraph[] = [
      kvPara('Started at', trace.startedAt),
      kvPara('User', `${trace.username} (${trace.userId})`),
      kvPara('Queried prompts', String(trace.queryCount ?? 0)),
      kvPara('Sorted prompts', String(trace.sortedCount ?? 0)),
      kvPara('Categories', String(trace.categoryCount ?? 0)),
      kvPara('Removed chars (sanitizer)', String(trace.removedCharsTotal)),
      kvPara('Ended at', trace.endedAt),
      kvPara('Duration (ms)', String(trace.durationMs)),
    ];

    const promptStats: Paragraph[] = [];
    for (const pt of trace.prompts) {
      promptStats.push(
        trPara(
          `#${pt.index} [${pt.category ?? 'Uncategorized'}] | lines=${pt.contentLines} | drops: control=${pt.drops.control}, orphanHigh=${pt.drops.orphanHigh}, orphanLow=${pt.drops.orphanLow}`,
          { size: 24 },
        ),
        trPara(`   title preview: "${pt.titlePreview}"`, { size: 24 }),
      );
    }
    addEvent(trace, 'Trace section build done');

    const doc = new Document({
      styles: {
        default: {
          document: { run: { font: 'Arial', size: 28 } }, // 14 pt
        },
      },
      sections: [
        {
          properties: {},
          children: [header, ...blocks, traceHeader, ...traceSummary, dividerPara(), ...promptStats],
        },
      ],
    });

    addEvent(trace, 'Packer.toBlob start');
    const blob = await Packer.toBlob(doc);
    addEvent(trace, 'Packer.toBlob done', { size: blob.size });

    const fileName = `${baseName}.docx`;
    const file = new File([blob], fileName, { type: XML_DOCX_MIME });
    saveAs(file);
    addEvent(trace, 'DOCX saved', { fileName });

    // Console snapshot (non-blocking)
    console.groupCollapsed(`[exportPrompts] trace ${fileName}`);
    console.table({
      startedAt: trace.startedAt,
      endedAt: trace.endedAt,
      durationMs: trace.durationMs,
      queried: trace.queryCount,
      sorted: trace.sortedCount,
      categories: trace.categoryCount,
      removedCharsTotal: trace.removedCharsTotal,
    });
    console.log('events:', trace.events);
    console.log('perPrompt:', trace.prompts);
    console.groupEnd();
  } catch (e: any) {
    // Fail-safe: dump trace to JSON
    const trace: ExportTrace = (window as any).__lastExportTrace ?? {
      startedAt: nowIso(),
      userId,
      username,
      removedCharsTotal: 0,
      prompts: [],
      events: [],
    };
    trace.error = { message: String(e?.message ?? e), stack: e?.stack };
    trace.endedAt = nowIso();
    trace.durationMs = Date.parse(trace.endedAt) - Date.parse(trace.startedAt);

    try {
      const traceBlob = new Blob([JSON.stringify(trace, null, 2)], { type: 'application/json' });
      const traceName = `${safeFileName(username)}_prompts_trace.json`;
      saveAs(traceBlob, traceName);
      console.error('[exportPrompts] Error, trace saved:', traceName, trace);
    } catch {
      console.error('[exportPrompts] Error and trace save also failed:', trace, e);
    }
    throw e;
  }
}
