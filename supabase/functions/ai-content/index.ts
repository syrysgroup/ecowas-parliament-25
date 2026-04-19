import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type GenerateRequest = {
  task: "meta_description" | "og_description" | "campaign_copy" | "email_subject" | "keyword_suggestions";
  context: {
    title?: string;
    keywords?: string;
    audience?: string;
    campaign_type?: string;
    programme?: string;
    page_path?: string;
    tone?: "formal" | "inspiring" | "urgent" | "informational";
  };
};

const PROMPTS: Record<GenerateRequest["task"], (ctx: GenerateRequest["context"]) => string> = {
  meta_description: (ctx) =>
    `Write a compelling SEO meta description (120–155 characters) for a web page with the title "${ctx.title || "ECOWAS Parliament Initiatives"}"${ctx.keywords ? ` targeting the keyword "${ctx.keywords}"` : ""}${ctx.programme ? ` about the ${ctx.programme} programme` : ""}. Make it action-oriented and relevant to West African parliamentary governance. Output ONLY the description text, nothing else.`,

  og_description: (ctx) =>
    `Write a compelling Open Graph description (100–125 characters) for social media sharing for a page titled "${ctx.title || "ECOWAS Parliament Initiatives"}"${ctx.programme ? ` about the ${ctx.programme} programme` : ""}. Make it engaging and shareable. Output ONLY the description text, nothing else.`,

  campaign_copy: (ctx) =>
    `Write a short marketing campaign message (2–3 sentences, max 200 words) for a ${ctx.campaign_type || "social media"} campaign targeted at ${ctx.audience || "West African youth and stakeholders"}${ctx.tone ? ` in a ${ctx.tone} tone` : ""}${ctx.programme ? ` promoting the ${ctx.programme} programme` : " promoting ECOWAS Parliament Initiatives"}. Output ONLY the message text, no labels or prefixes.`,

  email_subject: (ctx) =>
    `Write 3 compelling email subject lines (max 60 chars each) for a ${ctx.campaign_type || "newsletter"} email${ctx.audience ? ` targeting ${ctx.audience}` : ""}${ctx.programme ? ` about the ${ctx.programme} programme` : " about ECOWAS Parliament Initiatives"}. Output ONLY a numbered list of 3 subject lines, nothing else.`,

  keyword_suggestions: (ctx) =>
    `Suggest 5 primary SEO keywords and 5 long-tail keywords for a web page${ctx.title ? ` titled "${ctx.title}"` : ""}${ctx.programme ? ` about the ECOWAS ${ctx.programme} programme` : " about ECOWAS Parliament Initiatives"}. Focus on terms West African audiences and international stakeholders search for. Output ONLY a JSON object: {"primary": [...], "longtail": [...]}`,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.slice(7);
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: { user }, error: authErr } = await serviceClient.auth.getUser(token);
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { task, context } = await req.json() as GenerateRequest;
    if (!task || !PROMPTS[task]) {
      return new Response(JSON.stringify({ error: "Invalid task" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicKey) {
      return new Response(JSON.stringify({ error: "AI service not configured" }), {
        status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = PROMPTS[task](context);

    const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 512,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!aiRes.ok) {
      const err = await aiRes.text();
      console.error("Anthropic error:", err);
      return new Response(JSON.stringify({ error: "AI generation failed" }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiRes.json();
    const content = aiData.content?.[0]?.text ?? "";

    return new Response(JSON.stringify({ content, task }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("ai-content error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
