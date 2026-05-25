---
name: parliament-content-pipeline
description: Drive the full parliament content lifecycle — from raw session input to multilingual drafts and platform-specific distribution. Use this when processing a new parliament session transcript, approving content for distribution, or debugging a distribution failure.
---

## Instructions

### Phase 1 — Ingest and AI processing
1. Accept the raw input (transcript text, document path, or structured data)
2. Call the `parliament-ai` edge function via the admin `supabase` client:
   ```ts
   const { data, error } = await supabase.functions.invoke('parliament-ai', {
     body: { transcript: rawText, sessionId, sessionDate }
   });
   ```
3. The function returns `{ en: string, fr: string, pt: string }` summaries
4. Write to `parliament_content` table with `status = 'draft'`:
   ```ts
   await supabase.from('parliament_content').insert({
     session_id: sessionId,
     content_en: data.en,
     content_fr: data.fr,
     content_pt: data.pt,
     status: 'draft',
     created_by: user.id,
   });
   ```

### Phase 2 — Platform variant generation
For each approved record, generate platform-specific variants:

| Platform   | Format         | Length        | Key constraints                      |
|------------|----------------|---------------|--------------------------------------|
| WhatsApp   | Plain text     | ≤ 800 chars   | No markdown, use line breaks         |
| Telegram   | Markdown       | ≤ 2000 chars  | Bold headers, bullet points OK       |
| Twitter/X  | Thread         | ≤ 280/tweet   | Number tweets (1/n), no hashtag spam |
| Instagram  | Caption        | ≤ 500 chars   | Ends with 5–8 relevant hashtags      |

Store variants in `parliament_content.platform_variants` as JSONB:
```json
{
  "whatsapp": "...",
  "telegram": "...",
  "twitter_thread": ["tweet1", "tweet2"],
  "instagram": "..."
}
```

### Phase 3 — Super admin approval gate
Status transitions:
- `draft` → super_admin reviews in ParliamentContentModule
- `approved` → triggers distribution
- `rejected` → back to draft with rejection note

Only transition to `approved` when `isSuperAdmin` is confirmed both client-side and server-side (edge function role check).

### Phase 4 — Distribution
On approval, invoke each platform function:
```ts
const platforms = ['send-telegram', 'send-whatsapp', 'send-twitter', 'send-instagram'];
for (const platform of platforms) {
  const result = await supabase.functions.invoke(platform, {
    body: { contentId, variant: platformVariants[platform] }
  });
  // Write outcome to distribution_log regardless of success/failure
  await supabase.from('distribution_log').insert({
    content_id: contentId,
    platform: platform.replace('send-', ''),
    status: result.error ? 'failed' : 'sent',
    error_message: result.error?.message ?? null,
    sent_at: new Date().toISOString(),
  });
}
```

### Phase 5 — Error handling
- If `parliament-ai` fails: set `status = 'ai_error'`, store raw error in `error_log` column
- If a platform send fails: write `status = 'failed'` to `distribution_log`, do NOT block other platforms
- Retry logic: expose a "Retry failed sends" action in ParliamentOpsModule

## Example

**Prompt:** "Process the 2026-05-25 plenary session transcript and prepare it for distribution."

**Output:**
- Calls `parliament-ai` with the transcript
- Writes draft to `parliament_content`
- Generates all 4 platform variants
- Awaits approval in ParliamentContentModule
- On approval, distributes to all platforms and logs each outcome in `distribution_log`
