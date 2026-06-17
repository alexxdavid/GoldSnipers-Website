// Cloudflare Worker — Stripe Webhook → Supabase License Key Creator
// Deploy: npx wrangler deploy

const STRIPE_WEBHOOK_SECRET = "whsec_..."; // Get from Stripe Dashboard → Webhooks
const SUPABASE_URL = "https://hxlqbctnkqqtueuyqyyv.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4bHFiY3Rua3FxdHVldXlxeXl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTcxNDQzNSwiZXhwIjoyMDk3MjkwNDM1fQ.BUTCsx4uWDi_LxVRBy-yjsbNS8hkPEC0QPZVGCEMYm8";

const PRICE_MAP = {
    "price_1TjOSZHEiE6tGvuniSWUjD11": { product: "starter", max_machines: 1 },
    "price_1TjOSZHEiE6tGvunidfDUbeF": { product: "starter", max_machines: 1 },
    "price_1TjOSZHEiE6tGvunT0D2TNqT": { product: "pro", max_machines: 3 },
    "price_1TjOSaHEiE6tGvunulK8c0ak": { product: "pro", max_machines: 3 },
    "price_1TjOSbHEiE6tGvun9CUSI4tj": { product: "developer", max_machines: 6 },
    "price_1TjOSbHEiE6tGvundUX7aPkg": { product: "developer", max_machines: 6 },
};

function generateKey() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const seg = (len) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    return `GS-${seg(4)}-${seg(4)}-${seg(4)}`;
}

async function createLicenseKey(email, product, maxMachines) {
    const key = generateKey();
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/license_keys`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "apikey": SUPABASE_SERVICE_KEY,
            "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
            "Prefer": "return=representation",
        },
        body: JSON.stringify({
            license_key: key,
            email: email,
            product: product,
            max_machines: maxMachines,
            machines_used: 0,
            status: "active",
        }),
    });
    return resp.ok ? key : null;
}

async function verifyStripeSignature(request, body) {
    const sig = request.headers.get("stripe-signature");
    if (!sig) return false;
    // Basic verification — in production use crypto.subtle for HMAC
    return true;
}

export default {
    async fetch(request, env, ctx) {
        if (request.method !== "POST") {
            return new Response("Method not allowed", { status: 405 });
        }

        try {
            const body = await request.text();
            const event = JSON.parse(body);

            if (event.type === "checkout.session.completed") {
                const session = event.data.object;
                const email = session.customer_details?.email || session.customer_email;
                const lineItems = await fetch(`https://api.stripe.com/v1/checkout/sessions/${session.id}/line_items`, {
                    headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY || "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" } },
                });
                const items = await lineItems.json();
                const priceId = items.data?.[0]?.price?.id;
                const mapping = PRICE_MAP[priceId];

                if (mapping && email) {
                    const key = await createLicenseKey(email, mapping.product, mapping.max_machines);
                    if (key) {
                        // Store key in session metadata for success page
                        await fetch(`${SUPABASE_URL}/rest/v1/license_keys?license_key=eq.${key}`, {
                            method: "PATCH",
                            headers: {
                                "Content-Type": "application/json",
                                "apikey": SUPABASE_SERVICE_KEY,
                                "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
                            },
                            body: JSON.stringify({ stripe_customer_id: session.customer }),
                        });
                    }
                }
            }

            return new Response(JSON.stringify({ received: true }), {
                headers: { "Content-Type": "application/json" },
            });
        } catch (err) {
            return new Response(JSON.stringify({ error: err.message }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }
    },
};
