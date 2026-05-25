---
name: edge-function-scaffold
description: Generate a new Supabase edge function in Deno following the project's established pattern. Use this when adding backend logic that needs auth, privileged DB writes, or external API calls. Produces the function file, updates deno.json if needed, and outputs a curl test command.
---

## Instructions

### 1. Gather requirements
Ask for (or infer):
- Function name (kebab-case, e.g. `send-budget-report`)
- Required roles (who is allowed to call this function)
- Whether it needs privileged DB writes (requires `serviceClient`)
- External secrets it needs from `Deno.env.get()`
- HTTP method (POST is standard; GET for read-only)

### 2. Create the function file
Path: `supabase/functions/<function-name>/index.ts`

**Standard template:**
```ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // 1. CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 2. Auth — MUST come before any DB operation
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const anonClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await anonClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Role check
    const { data: hasAccess } = await anonClient.rpc('has_role', {
      _user_id: user.id,
      _role: '<required_role>',
    });
    if (!hasAccess) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 4. Parse request body
    const body = await req.json();

    // 5. Privileged DB operations (if needed)
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // ... business logic here ...

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
```

### 3. Security rules (enforce these without exception)
- Auth header extraction and `getUser()` call ALWAYS come before any DB operation
- `serviceClient` is only created AFTER successful auth + role check
- Never log the auth header, JWT, or any secret value
- External API keys via `Deno.env.get()` only — never hardcoded
- If the function doesn't need privileged DB writes, omit `serviceClient` entirely

### 4. Update deno.json if new shared deps are needed
File: `supabase/functions/deno.json`
Add any new imports to the `imports` map to keep versions consistent across functions.

### 5. Output a test command
```bash
curl -i --location --request POST \
  'http://localhost:54321/functions/v1/<function-name>' \
  --header 'Authorization: Bearer <your-local-anon-key>' \
  --header 'Content-Type: application/json' \
  --data '{"key": "value"}'
```

## Example

**Prompt:** "Create an edge function called `export-finance-report` that only finance_coordinator and super_admin can call. It reads from budget_items and returns a CSV."

**Output:**
- `supabase/functions/export-finance-report/index.ts` with full auth/role check pattern, serviceClient for the read, CSV response
- curl test command for local verification
