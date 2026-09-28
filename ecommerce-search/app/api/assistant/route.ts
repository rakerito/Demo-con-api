import { NextRequest, NextResponse } from "next/server";
import {
  buildShoppingSpec,
  EMPTY_SHOPPING_ANSWERS,
  getNextShoppingStep,
  getShoppingCompletionReply,
  getShoppingOptions,
  getShoppingQuestion,
  ShoppingAnswers,
} from "@/lib/assistant";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const rawAnswers = (body as { answers?: unknown }).answers;
  if (!rawAnswers || typeof rawAnswers !== "object" || Array.isArray(rawAnswers)) {
    return NextResponse.json({ error: "Invalid shopping answers" }, { status: 400 });
  }

  const answers = { ...EMPTY_SHOPPING_ANSWERS };
  for (const key of Object.keys(answers) as (keyof ShoppingAnswers)[]) {
    const value = (rawAnswers as Record<string, unknown>)[key];
    if (typeof value !== "string" || value.length > 300) {
      return NextResponse.json({ error: "Invalid shopping answer" }, { status: 400 });
    }
    answers[key] = value.trim();
  }

  const step = getNextShoppingStep(answers);
  if (step === "complete") {
    return NextResponse.json({
      ready: true,
      step,
      reply: getShoppingCompletionReply(answers),
      options: [],
      spec: buildShoppingSpec(answers),
    });
  }

  return NextResponse.json({
    ready: false,
    step,
    reply: getShoppingQuestion(step, answers),
    options: getShoppingOptions(step, answers),
  });
}
