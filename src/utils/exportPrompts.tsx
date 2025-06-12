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

export async function exportPrompts({
  supabase,
  userId,
  username,
}: ExportPromptsParams): Promise<void> {
  const { data: prompts, error } = await supabase
    .from('prompts')
    .select<
      PromptRow[]
    >(
      `
        title,
        description,
        content,
        categories (
          name
        )
      `,
    )
    .eq('user_id', userId);

  if (error) throw new Error(error.message);

  const sorted = (prompts ?? []).sort((a, b) => {
    const catA = a.categories?.name?.toLowerCase() ?? '';
    const catB = b.categories?.name?.toLowerCase() ?? '';
    if (catA !== catB) return catA.localeCompare(catB);
    return (a.title ?? '').localeCompare(b.title ?? '');
  });

  const makePara = ({
    label,
    value,
    bold = false,
    bigger = false,
    color,
  }: {
    label: string;
    value: string | null | undefined;
    bold?: boolean;
    bigger?: boolean;
    color?: string;
  }) =>
    new Paragraph({
      children: [
        new TextRun({
          text: `${label}: `,
          bold: true,
          size: bigger ? 32 : 28,
        }),
        new TextRun({
          text: value ?? 'N/A',
          bold,
          size: bigger ? 32 : 28,
          color,
        }),
      ],
      spacing: { after: 200 },
    });

  const header = new Paragraph({
    children: [
      new TextRun({
        text: `All prompts printed (${sorted.length})`,
        bold: true,
      }),
    ],
    spacing: { after: 300 },
  });

  const blocks = sorted.flatMap((p, i) => [
    new Paragraph({
      text: `Prompt #${i + 1}`,
      spacing: { after: 200 },
    }),

    makePara({
      label: 'Title',
      value: p.title,
      bold: true,
      bigger: true,
      color: 'FFA500',
    }),

    makePara({
      label: 'Description',
      value: p.description,
    }),

    makePara({
      label: 'Category',
      value: p.categories?.name,
      color: '00AA00',
    }),

    new Paragraph({
      children: [new TextRun({ text: 'Content:', bold: true })],
      spacing: { after: 200 },
    }),
    ...p.content.split('\n').map((line) => new Paragraph(line)),

    new Paragraph({
      text: '⎯⎯⎯ ✶ ⎯⎯⎯ ✶ ⎯⎯⎯',
      alignment: AlignmentType.CENTER,
      spacing: { before: 300, after: 300 },
    }),
  ]);

  const doc = new Document({
    styles: {
      default: {
        document: { run: { font: 'Arial', size: 28 } }, // 14 pt
      },
    },
    sections: [{ properties: {}, children: [header, ...blocks] }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${username}_prompts_${new Date().toISOString().slice(0, 10)}.docx`);
}