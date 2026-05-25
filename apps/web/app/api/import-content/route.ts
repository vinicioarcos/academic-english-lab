import { NextResponse } from "next/server";
import { z } from "zod";
import { generateImportedContent } from "@/lib/ai";
import { supabase } from "@/lib/supabase";

const RequestSchema = z.object({
  content: z.string().min(20, "El contenido debe tener al menos 20 caracteres."),
  language: z.enum(["Spanish", "English", "Mixed"]),
  domain: z.string().min(2),
  level: z.string().min(2),
  userId: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { content, language, domain, level, userId } = parsed.data;

    const importedContent = await generateImportedContent({
      content,
      language,
      domain,
      level,
    });

    const client = supabase;
    if (client && userId) {
      try {
        const { error } = await client.from("ai_generations").insert({
          user_id: userId,
          provider: process.env.AI_PROVIDER || "mock",
          prompt: JSON.stringify({ content, language, domain, level }),
          response: importedContent,
        });
        if (error) console.error("Error logging Content Importer generation to Supabase:", error);
      } catch (err) {
        console.error("Supabase content logging failed:", err);
      }
    }

    return NextResponse.json({ importedContent });
  } catch (err: any) {
    console.error("Route execution error in import-content:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
