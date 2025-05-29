/**
 * Export every prompt that belongs to userId into a TXT download.
 *
 */

import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";

export async function exportPrompts({ supabase, userId, username }) {
  const { data: prompts, error } = await supabase
    .from("prompts")
    .select("title, description, content")
    .eq("user_id", userId);

  if (error) throw new Error(error.message);

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: "Arial", size: 28 } 
        }
      }
    }
  });

  const headerPara = new Paragraph({
    children: [new TextRun({ text: `Prompt Dump (${prompts.length})`, bold: true })],
    spacing: { after: 300 }
  });

  const promptParagraphs = prompts.flatMap((p, i) => [
    new Paragraph({ text: `Prompt #${i + 1}`, spacing: { after: 200 } }),

    // Title
    new Paragraph({
      children: [
        new TextRun({ text: "Title: ", bold: true }),
        new TextRun(p.title || "N/A")
      ]
    }),

    // Desc
    new Paragraph({
      children: [
        new TextRun({ text: "Description: ", bold: true }),
        new TextRun(p.description || "N/A")
      ]
    }),

    // Content
    new Paragraph({ children: [new TextRun({ text: "Content:", bold: true })] }),
    ...p.content.split("\n").map(line => new Paragraph(line)),

    new Paragraph({
      text: "--------------------------------------",
      spacing: { before: 120, after: 300 }
    })
  ]);

  // 5️⃣ – Szakaszba fűzzük és letöltjük
  doc.addSection({ children: [headerPara, ...promptParagraphs] });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${username}_prompts_${new Date().toISOString().slice(0, 10)}.docx`);
}