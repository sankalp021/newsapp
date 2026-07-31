import { NextResponse } from 'next/server';

// Helper to create a response with CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle OPTIONS request (preflight)
export async function OPTIONS() {
  return NextResponse.json({}, {
    status: 204,
    headers: corsHeaders,
  });
}

// Models to try, in order. Override the primary with the GEMINI_MODEL env var.
// Extra models act as fallbacks if the primary is retired (HTTP 404), so a
// future model sunset degrades gracefully instead of silently breaking.
const PRIMARY_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const FALLBACK_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest'];

// Remove markdown / special characters the way the client used to.
const cleanText = (text: string): string =>
  text.replace(/[\*\"\'\_\`\~\#\>\<\[\]\(\)\{\}\|\\\^\=]/g, '').trim();

class GeminiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'GeminiError';
    this.status = status;
  }
}

// Call Gemini for a single prompt, trying each model until one succeeds.
async function callGemini(prompt: string, apiKey: string): Promise<string> {
  // De-duplicate while keeping the configured primary first.
  const models = [PRIMARY_MODEL, ...FALLBACK_MODELS].filter(
    (model, index, all) => all.indexOf(model) === index
  );

  let lastError: GeminiError = new GeminiError('Gemini request failed', 500);

  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    if (res.ok) {
      const data = await res.json().catch(() => null);
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text;
      // Empty/blocked response (e.g. safety filter) — not recoverable by switching models.
      throw new GeminiError('The AI model returned an empty response', 502);
    }

    const errBody = await res.json().catch(() => null);
    const message = errBody?.error?.message || `Gemini request failed (${res.status})`;
    lastError = new GeminiError(message, res.status);

    // Only a 404 (model retired/unavailable) is worth retrying with another model.
    // Bad key (400/403) or quota (429) would fail identically for every model,
    // so surface those immediately instead of hammering the API.
    if (res.status !== 404) break;
  }

  throw lastError;
}

export async function POST(request: Request) {
  const apiKey = process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

  if (!apiKey) {
    console.error('AI API key not configured');
    return NextResponse.json(
      { error: 'AI API key not configured' },
      { status: 500, headers: corsHeaders }
    );
  }

  let body: { title?: string; description?: string; content?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400, headers: corsHeaders }
    );
  }

  const { title = '', description = '', content = '' } = body;

  if (!title) {
    return NextResponse.json(
      { error: 'Missing article title' },
      { status: 400, headers: corsHeaders }
    );
  }

  const combinedContent = `Title: ${title}\nDescription: ${description}\nContent: ${content}`;

  const promptHeadline = `Craft a sharp, witty, or darkly humorous headline (max 10 words) that captures the essence of this news. If it's not crime-related, feel free to make it satirical or ironic. No fluff—make it hit hard: ${combinedContent} give a single headline only, no additional formatting like asterisks, quotes or markdown.`;
  const promptSummary = `Summarize this news article in exactly 100 words, blending analysis with biting wit, irony, or dark humor (if it doesn't involve crime). Highlight the main event, key details, and broader implications while keeping it bold, engaging, and slightly irreverent. Do not use any markdown, asterisks, quotes or special formatting: ${combinedContent}`;

  try {
    const [headline, summary] = await Promise.all([
      callGemini(promptHeadline, apiKey),
      callGemini(promptSummary, apiKey),
    ]);

    return NextResponse.json(
      { headline: cleanText(headline), summary: cleanText(summary) },
      { headers: corsHeaders }
    );
  } catch (error) {
    const status = error instanceof GeminiError ? error.status : 500;
    const message = error instanceof Error ? error.message : 'AI generation failed';
    console.error('AI generation error:', status, message);
    return NextResponse.json(
      { error: message },
      { status, headers: corsHeaders }
    );
  }
}
