/** Verify the checkout signature, confirm capture with Razorpay, save the record, and email an acknowledgement. */
const hex = bytes => [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2, "0")).join("");
export async function onRequestPost({ request, env }) {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) return Response.json({ verified: false, error: "Payment verification is not configured." }, { status: 503 });
  let data;
  try { data = await request.json(); } catch { return Response.json({ verified: false }, { status: 400 }); }
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;
  if (![razorpay_order_id, razorpay_payment_id, razorpay_signature].every(v => typeof v === "string" && v.length > 0)) return Response.json({ verified: false, error: "Missing payment verification fields." }, { status: 400 });
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(env.RAZORPAY_KEY_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${razorpay_order_id}|${razorpay_payment_id}`));
  const expected = hex(digest);
  let mismatch = expected.length ^ razorpay_signature.length;
  for (let i = 0; i < Math.max(expected.length, razorpay_signature.length); i++) mismatch |= (expected.charCodeAt(i) || 0) ^ (razorpay_signature.charCodeAt(i) || 0);
  if (mismatch !== 0) return Response.json({ verified: false, error: "Payment signature could not be verified." }, { status: 400 });

  const auth = btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`);
  const paymentRes = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(razorpay_payment_id)}`, { headers: { Authorization: `Basic ${auth}` } });
  if (!paymentRes.ok) return Response.json({ verified: false, error: "Could not confirm payment status with the payment provider." }, { status: 502 });
  const payment = await paymentRes.json();
  if (payment.order_id !== razorpay_order_id) return Response.json({ verified: false, error: "Payment does not match the expected order." }, { status: 400 });
  if (payment.status !== "captured") return Response.json({ verified: false, pending: true, status: payment.status }, { status: 202 });

  let receiptSent = false;
  if (env.DB) {
    try {
      await env.DB.prepare(`INSERT OR IGNORE INTO donations (payment_id, order_id, amount_paise, currency, donor_name, donor_email, purpose, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'captured', datetime('now'))`)
        .bind(payment.id, payment.order_id, payment.amount, payment.currency, payment.notes?.donor_name || "", payment.email || payment.notes?.donor_email || "", payment.notes?.donation_purpose || "General support").run();
      const email = payment.email || payment.notes?.donor_email;
      if (email && env.RESEND_API_KEY && env.DONATION_RECEIPT_FROM) {
        const amount = new Intl.NumberFormat("en-IN", { style: "currency", currency: payment.currency || "INR", maximumFractionDigits: 2 }).format(payment.amount / 100);
        const receipt = `TBF-${payment.id}`;
        const mail = await fetch("https://api.resend.com/emails", {
          method: "POST", headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ from: env.DONATION_RECEIPT_FROM, to: [email], subject: "Thank you for supporting Trust Bridge Foundation", text: `Dear ${payment.notes?.donor_name || "Supporter"},\n\nThank you for your contribution to Trust Bridge Foundation.\n\nAmount: ${amount}\nPayment reference: ${payment.id}\nAcknowledgement reference: ${receipt}\nPurpose: ${payment.notes?.donation_purpose || "General support"}\n\nThis email confirms the payment captured by the payment provider. It is not a tax certificate or an 80G receipt. Please contact the foundation if you need an official document.\n\nWith thanks,\nTrust Bridge Foundation` })
        });
        receiptSent = mail.ok;
      }
    } catch { /* Payment is captured; keep response truthful even if receipt storage/email needs attention. */ }
  }
  return Response.json({ verified: true, paymentId: payment.id, receiptSent }, { headers: { "Cache-Control": "no-store" } });
}
