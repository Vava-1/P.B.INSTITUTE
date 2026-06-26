import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY ?? "");

export async function sendEnrollmentConfirmation(params: {
  to: string;
  studentName: string;
  courseName: string;
  referenceNumber: string;
  schedulePreference?: string;
}) {
  if (!process.env.RESEND_API_KEY) return;

  await resend.emails.send({
    from: "Pacemaker Institute <noreply@pacemakerinstitute.ac.rw>",
    to: params.to,
    subject: `Enrollment Confirmed \u2013 ${params.courseName} | ${params.referenceNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1A1A2E, #5E17EB); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
          <h1 style="color: white; font-size: 24px; margin: 0;">Enrollment Received!</h1>
        </div>
        <p>Dear <strong>${params.studentName}</strong>,</p>
        <p>Thank you for applying to <strong>${params.courseName}</strong> at Pacemaker Institute.</p>
        <div style="background: #EDE7FF; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Reference Number:</strong> ${params.referenceNumber}</p>
          <p style="margin: 8px 0 0;"><strong>Course:</strong> ${params.courseName}</p>
          ${params.schedulePreference ? `<p style="margin: 8px 0 0;"><strong>Schedule:</strong> ${params.schedulePreference}</p>` : ""}
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
  if (!process.env.RESEND_API_KEY) return;

  await resend.emails.send({
    from: "Pacemaker System <system@pacemakerinstitute.ac.rw>",
    to: params.adminEmail,
    subject: `New Enrollment: ${params.studentName} \u2192 ${params.courseName}`,
    html: `
      <p><strong>New enrollment received!</strong></p>
      <ul>
        <li><strong>Student:</strong> ${params.studentName}</li>
        <li><strong>Course:</strong> ${params.courseName}</li>
        <li><strong>Phone:</strong> ${params.phone}</li>
        <li><strong>Reference:</strong> ${params.referenceNumber}</li>
      </ul>
      <a href="https://pacemakerinstitute.ac.rw/admin/enrollments" style="display: inline-block; padding: 10px 20px; background: #5E17EB; color: white; border-radius: 6px; text-decoration: none;">View in Admin</a>
    `,
  });
}
