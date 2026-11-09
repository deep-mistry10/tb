/** Optional Cloudflare Pages Function for sending enquiries through Resend. */
export async function onRequestPost({ request, env }) {
  if (!env.RESEND_API_KEY || !env.CONTACT_TO || !env.FROM_EMAIL) {
    return Response.json({ error: "Contact delivery is not configured." }, { status: 503 });
  }
  let data;
  try { data = await request.json(); } catch { return Response.json({ error: "Invalid request." }, { status: 400 }); }
  const name = String(data.name || "").trim().slice(0, 120);
  const email = String(data.email || "").trim().slice(0, 200);
  const message = String(data.message || "").trim().slice(0, 5000);
  const subject = String(data.subject || "Website enquiry").trim().slice(0, 120);
  if (!name || !/^\S+@\S+\.\S+$/.test(email) || !message) return Response.json({ error: "Please provide a name, valid email and message." }, { status: 400 });
  const result = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: env.FROM_EMAIL, to: [env.CONTACT_TO], reply_to: email, subject: `[Trust Bridge website] ${subject}`, text: `Name: ${name}\nEmail: ${email}\nPhone: ${String(data.phone || "").slice(0, 40)}\nInterest: ${String(data.interest || "").slice(0, 120)}\n\n${message}` })
  });
  if (!result.ok) return Response.json({ error: "Message could not be delivered." }, { status: 502 });
  return Response.json({ sent: true }, { headers: { "Cache-Control": "no-store" } });
}
