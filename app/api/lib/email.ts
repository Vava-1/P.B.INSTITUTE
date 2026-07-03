import { Resend } from "resend";

// Lazy-init so the module loads even when RESEND_API_KEY is unset.
let _resend: Resend | null = null;
function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!_resend) _resend = new Resend(key);
  return _resend;
}

// SECURITY: escape user-controlled text before interpolating into HTML.
// Prevents HTML injection in email clients (phishing via injected <a> tags, etc.).
function escapeHtml(input: string | undefined | null): string {
  if (!input) return "";
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function sendEnrollmentConfirmation(params: {
  to: string;
  studentName: string;
  courseName: string;
  referenceNumber: string;
  schedulePreference?: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not set — skipping enrollment confirmation email.");
    return;
  }

  const studentName = escapeHtml(params.studentName);
  const courseName = escapeHtml(params.courseName);
  const referenceNumber = escapeHtml(params.referenceNumber);
  const schedulePreference = params.schedulePreference ? escapeHtml(params.schedulePreference) : null;

  const resend = getResend();
  if (!resend) return;
  await resend.emails.send({
    from: "Pacemaker Institute <noreply@pacemakerinstitute.ac.rw>",
    to: params.to,
    subject: `Enrollment Confirmed \u2013 ${params.courseName} | ${params.referenceNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1A1A2E, #5E17EB); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
          <h1 style="color: white; font-size: 24px; margin: 0;">Enrollment Received!</h1>
        </div>
        <p>Dear <strong>${studentName}</strong>,</p>
        <p>Thank you for applying to <strong>${courseName}</strong> at Pacemaker Institute.</p>
        <div style="background: #EDE7FF; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Reference Number:</strong> ${referenceNumber}</p>
          <p style="margin: 8px 0 0;"><strong>Course:</strong> ${courseName}</p>
          ${schedulePreference ? `<p style="margin: 8px 0 0;"><strong>Schedule:</strong> ${schedulePreference}</p>` : ""}
        </div>
        <p>Our team will contact you within <strong>24\u201348 hours</strong> to confirm your enrollment and provide next steps.</p>
        <p>Questions? WhatsApp us: <a href="https://wa.me/250786053720">+250 786 053 720</a></p>
        <hr style="border: none; border-top: 1px solid #EDE7FF; margin: 24px 0;">
        <p style="color: #6B7280; font-size: 12px;">Pacemaker Institute | Kigali, Rwanda | pacemakerinstitute.ac.rw</p>
      </div>
    `,
  });
}

export async function sendAdminNewEnrollmentAlert(params: {
  adminEmail: string;
  studentName: string;
  courseName: string;
  referenceNumber: string;
  phone: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not set — skipping admin alert email.");
    return;
  }

  const studentName = escapeHtml(params.studentName);
  const courseName = escapeHtml(params.courseName);
  const referenceNumber = escapeHtml(params.referenceNumber);
  const phone = escapeHtml(params.phone);

  const resend = getResend();
  if (!resend) return;
  await resend.emails.send({
    from: "Pacemaker System <system@pacemakerinstitute.ac.rw>",
    to: params.adminEmail,
    subject: `New Enrollment: ${params.studentName} \u2192 ${params.courseName}`,
    html: `
      <p><strong>New enrollment received!</strong></p>
      <ul>
        <li><strong>Student:</strong> ${studentName}</li>
        <li><strong>Course:</strong> ${courseName}</li>
        <li><strong>Phone:</strong> ${phone}</li>
        <li><strong>Reference:</strong> ${referenceNumber}</li>
      </ul>
      <a href="https://pacemakerinstitute.ac.rw/admin/enrollments" style="display: inline-block; padding: 10px 20px; background: #5E17EB; color: white; border-radius: 6px; text-decoration: none;">View in Admin</a>
    `,
  });
}
