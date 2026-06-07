# Batch 2 — Communications (Email + Chat) restyle

Re-skin EmailInboxModule (1,782 LOC) and MessagingModule (1,564 LOC) onto the Phase 1 primitives. **Chrome only** — every Supabase call, Zoho integration, query, mutation, thread/draft/presence hook stays byte-identical.

## Ground rules (carried from Phase 2 plan)

- Wrap each module in `PageHeader` (icon + title + description + actions). Drop module-local title bars.
- Replace every `bg-crm*`, `text-crm*`, `border-crm*`, and raw hex/grey with semantic tokens: `--surface-1..4`, `--text-1/2/3`, `--border-subtle`, `--brand-*`.
- Panels/cards → `Surface`. Zero-state lists → `EmptyState`. Loading → shadcn `Skeleton`. Errors → toast.
- Data layer untouched: no edits to `useQuery`, mutation functions, supabase calls, edge function calls, hotkeys that drive behavior, or the compose/undo-send/draft/template logic.
- Verify at desktop + 375px mobile after each module.

## Files touched

1. `apps/admin/src/components/crm/modules/EmailInboxModule.tsx`
   - Top toolbar (folder switcher, search, pagination, sync button) → `PageHeader` with actions slot.
   - Folder list + thread list + reading pane wrappers → `Surface`.
   - Empty inbox / empty folder / no-search-results → `EmptyState`.
   - Compose popover (lines ~570–700) and contact autocomplete (lines ~196–240) keep their structure; only color classes swap to tokens.
   - `EmailSignaturePanel.tsx` gets the same token swap (small file, sibling component).

2. `apps/admin/src/components/crm/modules/MessagingModule.tsx`
   - Conversation list pane, message thread pane, composer → `Surface` wrappers.
   - Header bar → `PageHeader` (title "Messaging", new-conversation action).
   - Empty conversation list / no messages yet → `EmptyState`.
   - Presence dot, typing indicator, avatar groups: only color tokens change.

## Token mapping (applied everywhere)

```text
bg-crm-card        → bg-[hsl(var(--surface-1))]
bg-crm-surface     → bg-[hsl(var(--surface-3))]
border-crm-border  → border-[hsl(var(--border-subtle))]
text-crm-text      → text-[hsl(var(--text-1))]
text-crm-text-muted→ text-[hsl(var(--text-2))]
text-crm-text-dim/faint → text-[hsl(var(--text-3))]
primary (kept)     → text/bg-[hsl(var(--brand-green))]
```

A short codemod-style pass per file, then manual review of the compose popover (most custom styling lives there).

## Explicitly out of scope

- Zoho IMAP/SMTP sync, `sync-emails`, `send-email`, `save-draft`, `fetch-email-body`, `manage-folders`, `download-attachment` edge functions.
- Pagination logic (25/page) and trash-folder hard-delete confirmation (per memory).
- Draft persistence, undo-send countdown, template save/apply, signature insertion behavior.
- Messaging realtime channel, presence, typing, optimistic send.
- Any DB or RLS change.

## Verification

- Type-check passes.
- Open `/?shellV2=1`, switch to Inbox: folder switch, open thread, compose + send, save draft, switch folders, search. Repeat in `?shellV2=0` to confirm no regression.
- Open Messaging: list loads, open conversation, send message, see presence.
- 375px viewport spot-check for both.

Flag remains `?shellV2=1`. After this batch, only Batches 3 and 4 remain before the flag flips default-on.
