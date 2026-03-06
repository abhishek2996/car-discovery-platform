import { Resend } from "resend";

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

const FROM_EMAIL = process.env.FROM_EMAIL ?? "CarDiscovery <noreply@cardiscovery.co.uk>";

type SendEmailOptions = {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
};

export async function sendEmail({ to, subject, html, replyTo }: SendEmailOptions) {
  const resend = getResend();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set – skipping email:", subject);
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      ...(replyTo ? { replyTo } : {}),
    });

    if (error) {
      console.error("[email] Failed to send:", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error("[email] Exception:", err);
    return { success: false, error: String(err) };
  }
}

// ── Email template helpers ────────────────────────────────────────

function layout(title: string, body: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${title}</title>
<style>
  body { margin:0; padding:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; background:#f4f4f5; }
  .container { max-width:600px; margin:0 auto; background:#ffffff; border-radius:8px; overflow:hidden; margin-top:32px; margin-bottom:32px; }
  .header { background:#18181b; padding:24px 32px; }
  .header h1 { color:#ffffff; margin:0; font-size:20px; font-weight:600; }
  .body { padding:32px; color:#27272a; line-height:1.6; }
  .body h2 { color:#18181b; font-size:18px; margin-top:0; }
  .detail-row { display:flex; padding:8px 0; border-bottom:1px solid #f4f4f5; }
  .detail-label { font-weight:600; min-width:140px; color:#71717a; }
  .detail-value { color:#27272a; }
  .cta { display:inline-block; background:#18181b; color:#ffffff; padding:12px 24px; border-radius:6px; text-decoration:none; font-weight:500; margin-top:16px; }
  .footer { padding:24px 32px; background:#fafafa; text-align:center; color:#a1a1aa; font-size:13px; }
</style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>CarDiscovery</h1></div>
    <div class="body">${body}</div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} CarDiscovery. All rights reserved.</p>
      <p>United Kingdom</p>
    </div>
  </div>
</body>
</html>`;
}

// ── Buyer emails ──────────────────────────────────────────────────

export function enquiryConfirmationEmail(buyerName: string, dealerName: string, carName?: string) {
  const carLine = carName ? `<p>Car: <strong>${carName}</strong></p>` : "";
  return layout(
    "Enquiry Received",
    `<h2>Hi ${buyerName || "there"},</h2>
     <p>Thanks for your enquiry! We've passed your details to <strong>${dealerName}</strong>.</p>
     ${carLine}
     <p>The dealer will get in touch with you shortly. In the meantime, you can track the status of your enquiry in your account.</p>
     <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://cardiscovery.co.uk"}/my-activity" class="cta">View My Activity</a>`,
  );
}

export function testDriveConfirmationEmail(
  buyerName: string,
  dealerName: string,
  carName: string,
  date: string,
  time: string,
) {
  return layout(
    "Test Drive Request Received",
    `<h2>Hi ${buyerName || "there"},</h2>
     <p>Your test drive request has been received!</p>
     <div style="background:#f4f4f5; border-radius:6px; padding:16px; margin:16px 0;">
       <div class="detail-row"><span class="detail-label">Car</span><span class="detail-value">${carName}</span></div>
       <div class="detail-row"><span class="detail-label">Dealer</span><span class="detail-value">${dealerName}</span></div>
       <div class="detail-row"><span class="detail-label">Preferred Date</span><span class="detail-value">${date}</span></div>
       <div class="detail-row"><span class="detail-label">Preferred Time</span><span class="detail-value">${time}</span></div>
     </div>
     <p><strong>${dealerName}</strong> will confirm your slot shortly.</p>
     <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://cardiscovery.co.uk"}/my-activity" class="cta">Track Status</a>`,
  );
}

export function testDriveUpdateEmail(
  buyerName: string,
  carName: string,
  newStatus: string,
  dealerName: string,
) {
  const statusMessages: Record<string, string> = {
    CONFIRMED: "Your test drive has been confirmed!",
    CANCELLED: "Unfortunately, your test drive has been cancelled.",
    COMPLETED: "Your test drive is marked as completed. We hope you enjoyed it!",
    NO_SHOW: "It looks like you missed your test drive appointment.",
  };

  return layout(
    "Test Drive Update",
    `<h2>Hi ${buyerName || "there"},</h2>
     <p>${statusMessages[newStatus] || `Your test drive status has been updated to: ${newStatus}.`}</p>
     <div style="background:#f4f4f5; border-radius:6px; padding:16px; margin:16px 0;">
       <div class="detail-row"><span class="detail-label">Car</span><span class="detail-value">${carName}</span></div>
       <div class="detail-row"><span class="detail-label">Dealer</span><span class="detail-value">${dealerName}</span></div>
       <div class="detail-row"><span class="detail-label">Status</span><span class="detail-value">${newStatus.replace(/_/g, " ")}</span></div>
     </div>
     <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://cardiscovery.co.uk"}/my-activity" class="cta">View Details</a>`,
  );
}

export function upcomingCarAlertEmail(buyerName: string, carName: string, brandName: string) {
  return layout(
    `${carName} is here!`,
    `<h2>Hi ${buyerName || "there"},</h2>
     <p>Great news! The <strong>${carName}</strong> by <strong>${brandName}</strong> that you were watching is now officially launched!</p>
     <p>Check out the full details, pricing, and find dealers near you.</p>
     <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://cardiscovery.co.uk"}/new-cars" class="cta">Explore Now</a>`,
  );
}

// ── Dealer emails ─────────────────────────────────────────────────

export function newLeadNotificationEmail(
  dealerName: string,
  buyerName: string,
  buyerEmail: string,
  leadType: string,
  carName?: string,
  message?: string | null,
) {
  const typeBadge = leadType === "TEST_DRIVE" ? "Test Drive Request" : "Enquiry";
  return layout(
    `New ${typeBadge}`,
    `<h2>New ${typeBadge}</h2>
     <p>Hi ${dealerName}, you have a new lead!</p>
     <div style="background:#f4f4f5; border-radius:6px; padding:16px; margin:16px 0;">
       <div class="detail-row"><span class="detail-label">Buyer</span><span class="detail-value">${buyerName || "—"}</span></div>
       <div class="detail-row"><span class="detail-label">Email</span><span class="detail-value">${buyerEmail}</span></div>
       ${carName ? `<div class="detail-row"><span class="detail-label">Car</span><span class="detail-value">${carName}</span></div>` : ""}
       ${message ? `<div class="detail-row"><span class="detail-label">Message</span><span class="detail-value">${message}</span></div>` : ""}
     </div>
     <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://cardiscovery.co.uk"}/dealer/leads" class="cta">View in Dashboard</a>`,
  );
}

export function testDriveBookingEmail(
  dealerName: string,
  buyerName: string,
  carName: string,
  date: string,
  time: string,
) {
  return layout(
    "New Test Drive Booking",
    `<h2>New Test Drive Booking</h2>
     <p>Hi ${dealerName}, a customer has requested a test drive.</p>
     <div style="background:#f4f4f5; border-radius:6px; padding:16px; margin:16px 0;">
       <div class="detail-row"><span class="detail-label">Customer</span><span class="detail-value">${buyerName || "—"}</span></div>
       <div class="detail-row"><span class="detail-label">Car</span><span class="detail-value">${carName}</span></div>
       <div class="detail-row"><span class="detail-label">Preferred Date</span><span class="detail-value">${date}</span></div>
       <div class="detail-row"><span class="detail-label">Preferred Time</span><span class="detail-value">${time}</span></div>
     </div>
     <p>Please confirm or reschedule from your dashboard.</p>
     <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://cardiscovery.co.uk"}/dealer/test-drives" class="cta">Manage Test Drives</a>`,
  );
}

// ── Admin emails ──────────────────────────────────────────────────

export function newDealerSignupEmail(dealerName: string, city: string, contactEmail: string) {
  return layout(
    "New Dealer Application",
    `<h2>New Dealer Application</h2>
     <p>A new dealer has applied to join CarDiscovery.</p>
     <div style="background:#f4f4f5; border-radius:6px; padding:16px; margin:16px 0;">
       <div class="detail-row"><span class="detail-label">Dealership</span><span class="detail-value">${dealerName}</span></div>
       <div class="detail-row"><span class="detail-label">City</span><span class="detail-value">${city}</span></div>
       <div class="detail-row"><span class="detail-label">Contact</span><span class="detail-value">${contactEmail}</span></div>
     </div>
     <p>Please review and approve or reject this application.</p>
     <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://cardiscovery.co.uk"}/admin/dealers" class="cta">Review Applications</a>`,
  );
}

export function criticalAlertEmail(subject: string, details: string) {
  return layout(
    subject,
    `<h2>System Alert</h2>
     <div style="background:#fef2f2; border:1px solid #fecaca; border-radius:6px; padding:16px; margin:16px 0; color:#991b1b;">
       ${details}
     </div>
     <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://cardiscovery.co.uk"}/admin" class="cta">Go to Admin</a>`,
  );
}
