/** Cloudflare Pages Function: create a Razorpay order server-side. */
export async function onRequestPost({ request, env }) {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    return Response.json({ error: "Payment gateway is not configured." }, { status: 503 });
  }
  let input;
  try { input = await request.json(); } catch { return Response.json({ error: "Invalid request." }, { status: 400 }); }
  const amount = Number(input.amount);
  if (!Number.isInteger(amount) || amount < 100 || amount > 50000000 || input.currency !== "INR") {
    return Response.json({ error: "Donation amount is outside the permitted range." }, { status: 400 });
  }
  const auth = btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`);
  const upstream = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
    body: JSON.stringify({ amount, currency: "INR", receipt: `tbf_${crypto.randomUUID().replaceAll("-", "").slice(0, 18)}`, notes: { donor_name: String(input.name || "").slice(0, 100), donor_email: String(input.email || "").slice(0, 180), donation_purpose: String(input.purpose || "General support").slice(0, 120) } })
  });
  const order = await upstream.json();
  if (!upstream.ok) return Response.json({ error: "Could not create payment order." }, { status: 502 });
  return Response.json({ id: order.id, amount: order.amount, currency: order.currency, verifyEndpoint: "/api/verify-payment" }, { headers: { "Cache-Control": "no-store" } });
}
