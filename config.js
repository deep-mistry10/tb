/*
 * Trust Bridge Foundation — site configuration
 * Replace the clearly marked values with verified foundation details before launch.
 */
window.TBF_CONFIG = {
  name: "Trust Bridge Foundation",
  shortName: "Trust Bridge",
  tagline: "Together, we can build a stronger bridge to opportunity.",
  email: "info@tbr.net.in",
  phone: "+91 1234567890", // Replace if this is not the public contact number.
  phoneDisplay: "+91 1234567890",
  address: "VILL-SHAKTI PALLY, PO-BANSRA, PS-JIBANTALA, Canning, West Bengal 743363, India",
  mapUrl: "https://www.google.com/maps/place/Trust+Bridge+Foundation/@22.3596034,88.5669436,1005m/data=!3m2!1e3!4b1!4m6!3m5!1s0x3a0211bc32fde50f:0xbfd97da8788d4616!8m2!3d22.3595985!4d88.5695185!16s%2Fg%2F11mlgzg3xw?entry=ttu",
  instagramUrl: "https://www.instagram.com/trust_bridge_foundation/",
  /* Add the foundation's verified payment details here. Do not publish until checked. */
  upiId: "",
  upiName: "Trust Bridge Foundation",
  razorpayKeyId: "", // Public Key ID only. Never put a Razorpay secret in frontend code.
  donationEndpoint: "/api/create-order", // Implement server-side order creation + signature verification.
  contactEndpoint: "", // Optional server-side form endpoint; blank uses an email draft fallback.
  currency: "INR",
  /* Replace these with approved programme names and descriptions before publishing. */
  programmes: [
    { title: "Community Support", text: "Add a verified description of the foundation's community support work here.", icon: "community" },
    { title: "Education & Opportunity", text: "Add verified information about education or learning initiatives here.", icon: "book" },
    { title: "Health & Wellbeing", text: "Add verified information about health and wellbeing initiatives here.", icon: "heart" }
  ]
};
