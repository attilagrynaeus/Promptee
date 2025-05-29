// exportPromptsDocx.js
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
} from "docx";
import { saveAs } from "file-saver";

/**
 * Prompt-export DOCX
 * ─────────────────────
 * • Arial 14 pt
 * • Title: 16 pt, BOLD, (#FFA500)
 * • Category: (#00AA00)
 */
export async function exportPrompts({ supabase, userId, username }) {
  /* 1️⃣   */
  const { data: prompts, error } = await supabase
    .from("prompts")
    .select(
      `
        title,
        description,
        content,
        categories (
          name
        )
      `
    )
    .eq("user_id", userId);

  if (error) throw new Error(error.message);

  /* 2️⃣  */
  const makePara = ({
    label,
    value,
    bold = false,
    bigger = false,
    color, // opcionális hex (pl. "FFA500")
  }) =>
    new Paragraph({
      children: [
        new TextRun({
          text: `${label}: `,
          bold: true,
          size: bigger ? 32 : 28, // 16 pt vagy 14 pt
        }),
        new TextRun({
          text: value ?? "N/A",
          bold,
          size: bigger ? 32 : 28,
          color,
        }),
      ],
      spacing: { after: 200 }, // empty line
    });

  /* 3️⃣  Header */
  const header = new Paragraph({
    children: [
      new TextRun({
        text: `All prompts printed:  (${prompts.length}) `,
        bold: true,
      }),
    ],
    spacing: { after: 300 },
  });

  /* 4️⃣  Prompt */
  const blocks = prompts.flatMap((p, i) => [

    new Paragraph({
      text: `Prompt #${i + 1}`,
      spacing: { after: 200 },
    }),

    makePara({
      label: "Title",
      value: p.title,
      bold: true,
      bigger: true,
      color: "FFA500", // narancs
    }),

    // Description
    makePara({
      label: "Description",
      value: p.description,
    }),

    // Category
    makePara({
      label: "Category",
      value: p.categories?.name,
      color: "00AA00",
    }),

    // Content
    new Paragraph({
      children: [new TextRun({ text: "Content:", bold: true })],
      spacing: { after: 200 },
    }),
    ...p.content.split("\n").map((line) => new Paragraph(line)),

    new Paragraph({
      text: "⎯⎯⎯ ✶ ⎯⎯⎯ ✶ ⎯⎯⎯",
      alignment: AlignmentType.CENTER,
      spacing: { before: 300, after: 300 },
    }),
  ]);

  /* 5️⃣  DOCX  */
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: "Arial", size: 28 }, // 14 pt (half-points)
        },
      },
    },
    sections: [
      {
        properties: {},
        children: [header, ...blocks],
      },
    ],
  });

  /* 6️⃣  download */
  const blob = await Packer.toBlob(doc);
  saveAs(
    blob,
    `${username}_prompts_${new Date().toISOString().slice(0, 10)}.docx`
  );
}