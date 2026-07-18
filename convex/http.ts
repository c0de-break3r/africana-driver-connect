import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Dojah webhook endpoint for verification status updates.
 * Dojah will POST to this endpoint when verification status changes.
 */
const dojahWebhook = httpAction(async (ctx, req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const body = await req.json();
  
  // Dojah sends entity_id and status in the webhook payload
  const { entity_id: entityId, status, data } = body;

  if (!entityId || !status) {
    return new Response("Missing required fields", { status: 400 });
  }

  // Call the internal webhook handler
  await ctx.runMutation(internal.kyc.handleDojahWebhook, {
    entityId,
    status,
    data: data ? JSON.stringify(data) : undefined,
  });

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});

const http = httpRouter();

http.route({
  path: "/dojah-webhook",
  method: "POST",
  handler: dojahWebhook,
});

export default http;
