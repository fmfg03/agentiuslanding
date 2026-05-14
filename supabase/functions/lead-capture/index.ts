import { createClient } from "jsr:@supabase/supabase-js@2";

type LeadPayload = {
  name?: string;
  company?: string;
  workflow?: string;
  email?: string;
  source?: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function requiredString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

async function notifyByEmail(payload: Required<LeadPayload>) {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const notifyTo = Deno.env.get("LEADS_NOTIFY_TO") || "fmfg@agentius.ai";
  const notifyFrom = Deno.env.get("LEADS_NOTIFY_FROM");

  if (!resendApiKey || !notifyFrom) {
    return { delivered: false, skipped: true };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: notifyFrom,
      to: [notifyTo],
      reply_to: payload.email,
      subject: `Agentius lead: ${payload.company}`,
      text: [
        "New Agentius lead",
        "",
        `Name: ${payload.name}`,
        `Company: ${payload.company}`,
        `Email: ${payload.email}`,
        `Source: ${payload.source}`,
        "",
        "Workflow",
        payload.workflow,
      ].join("\n"),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend notification failed: ${errorText}`);
  }

  return { delivered: true, skipped: false };
}

async function persistLead(
  supabase: ReturnType<typeof createClient>,
  payload: Required<LeadPayload>,
) {
  const bucketName = Deno.env.get("LEADS_BUCKET") || "lead-intake";
  const filePath =
    `${new Date().toISOString().replaceAll(":", "-")}-${crypto.randomUUID()}.json`;

  const bucketResult = await supabase.storage.createBucket(bucketName, {
    public: false,
    fileSizeLimit: 1024 * 1024,
    allowedMimeTypes: ["application/json"],
  });

  if (
    bucketResult.error &&
    !bucketResult.error.message.toLowerCase().includes("already exists")
  ) {
    throw new Error(`Bucket setup failed: ${bucketResult.error.message}`);
  }

  const uploadResult = await supabase.storage
    .from(bucketName)
    .upload(
      filePath,
      new Blob(
        [
          JSON.stringify(
            {
              ...payload,
              received_at: new Date().toISOString(),
            },
            null,
            2,
          ),
        ],
        { type: "application/json" },
      ),
      {
        contentType: "application/json",
        upsert: false,
      },
    );

  if (uploadResult.error) {
    throw new Error(`Lead persistence failed: ${uploadResult.error.message}`);
  }

  return {
    bucket: bucketName,
    path: filePath,
  };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  let body: LeadPayload;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const payload = {
    name: requiredString(body.name),
    company: requiredString(body.company),
    workflow: requiredString(body.workflow),
    email: requiredString(body.email),
    source: requiredString(body.source) || "agentius-landing",
  };

  if (!payload.name || !payload.company || !payload.workflow || !payload.email) {
    return json({ error: "Missing required fields" }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return json({ error: "Supabase environment is not configured" }, 500);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  let storageResult: { bucket: string; path: string };
  try {
    storageResult = await persistLead(supabase, payload);
  } catch (error) {
    return json(
      {
        error: error instanceof Error ? error.message : "Lead storage failed",
      },
      500,
    );
  }

  let emailStatus: { delivered: boolean; skipped: boolean } | null = null;
  try {
    emailStatus = await notifyByEmail(payload);
  } catch (error) {
    console.error(error);
  }

  return json({
    ok: true,
    storage: storageResult,
    email: emailStatus,
  });
});
