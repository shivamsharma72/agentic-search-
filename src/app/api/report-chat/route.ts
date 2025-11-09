import { NextRequest, NextResponse } from "next/server";
import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";

export const runtime = "nodejs";

/**
 * Report Chat API
 * Allows users to ask questions about the analysis report
 */
export async function POST(req: NextRequest) {
  try {
    const { question, report, marketTitle, alpha } = await req.json();

    if (!question || !report) {
      return NextResponse.json(
        { success: false, error: "Missing question or report" },
        { status: 400 }
      );
    }

    console.log("💬 [Report Chat] Question:", question);

    // Use Claude to answer questions about the report
    const { text } = await generateText({
      model: anthropic("claude-sonnet-4-5"),
      messages: [
        {
          role: "system",
          content: `You are an AI assistant helping users understand a prediction market analysis report. 
          
**Market**: ${marketTitle}
**Prediction**: ${alpha ? (alpha * 100).toFixed(1) : "Unknown"}% confidence

**Full Analysis Report**:
${report}

Answer the user's questions based ONLY on the information in this report. Be concise, helpful, and accurate. If the answer isn't in the report, say so.`,
        },
        {
          role: "user",
          content: question,
        },
      ],
      maxTokens: 500,
    });

    console.log("✅ [Report Chat] Answer generated");

    return NextResponse.json({
      success: true,
      answer: text,
    });
  } catch (error) {
    console.error("❌ [Report Chat] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

