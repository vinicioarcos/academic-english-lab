import { NextResponse } from "next/server";
import { z } from "zod";
import { generateSpeakingFeedback } from "@/lib/ai";
import { supabase } from "@/lib/supabase";

const RequestSchema = z.object({
  prompt: z.string().min(3),
  category: z.string().min(3),
  userText: z.string().min(3),
  level: z.string().default("B2"),
  domain: z.string().optional(),
  userId: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { prompt, category, userText, level, domain, userId } = parsed.data;

    const feedback = await generateSpeakingFeedback({
      prompt,
      category,
      userText,
      level,
      domain,
    });

    const client = supabase;
    if (client && userId) {
      try {
        const { error } = await client.from("ai_generations").insert({
          user_id: userId,
          provider: process.env.AI_PROVIDER || "mock",
          prompt: JSON.stringify({ prompt, category, userText, level, domain }),
          response: feedback,
        });
        if (error) console.error("Error logging Speaking AI generation to Supabase:", error);
      } catch (err) {
        console.error("Supabase speaking logging failed:", err);
      }
    }

    return NextResponse.json({ feedback });
  } catch (err: any) {
    console.error("Route execution error in speaking-feedback:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
