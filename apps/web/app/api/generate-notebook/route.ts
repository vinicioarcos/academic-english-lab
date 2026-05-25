import { NextResponse } from "next/server";
import { z } from "zod";
import { generateNotebookDraft } from "@/lib/ai";
import { supabase } from "@/lib/supabase";

const RequestSchema = z.object({
  topic: z.string().min(3),
  level: z.string().default("B2"),
  domain: z.string().default("Academic English"),
  userMistakes: z.array(z.string()).optional(),
  targetSkill: z.string().optional(),
  userId: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { topic, level, domain, userMistakes, targetSkill, userId } = parsed.data;

    const notebook = await generateNotebookDraft({
      topic,
      level,
      domain,
      userMistakes,
      targetSkill,
    });

    const client = supabase;
    if (client && userId) {
      try {
        const { error } = await client.from("ai_generations").insert({
          user_id: userId,
          provider: process.env.AI_PROVIDER || "mock",
          prompt: JSON.stringify({ topic, level, domain, userMistakes, targetSkill }),
          response: notebook,
        });
        if (error) console.error("Error logging AI generation to Supabase:", error);
      } catch (err) {
        console.error("Supabase logging failed:", err);
      }
    }

    return NextResponse.json({ notebook });
  } catch (err: any) {
    console.error("Route execution error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
