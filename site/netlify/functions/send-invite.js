const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const friendEmail = (payload.friendEmail || '').trim();
  const personalMessage = (payload.personalMessage || '').trim();
  const eventName = (payload.eventName || '').trim();
  const eventDate = (payload.eventDate || '').trim();
  const eventTime = (payload.eventTime || '').trim();
  const eventVenue = (payload.eventVenue || '').trim();

  if (!EMAIL_RE.test(friendEmail)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'A valid friend email is required.' }) };
  }
  if (!eventName || !eventDate || !eventTime || !eventVenue) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing event details.' }) };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Email service is not configured.' }) };
  }

  const subject = `Join me at the ${eventName}`;

  const textBody =
    (personalMessage ? personalMessage + '\n\n---\n\n' : '') +
    `I wanted to invite you to this special event!\n\n` +
    `${eventName}\n` +
    `${eventDate} · ${eventTime}\n` +
    `${eventVenue}\n\n` +
    `RSVP here: https://mascp.org/rsvp/\n\n` +
    `View the invitation: https://mascp.org/assets/images/mascp-invitation.png`;

  const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${escapeHtml(eventName)}</title>
</head>
<body style="margin:0;padding:0;background-color:#F5F0E8;font-family:Georgia,serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F5F0E8;">
    <tr>
      <td align="center" style="padding:20px 10px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#FAF7F2;border:1px solid #E0D8CC;">

          <tr>
            <td align="center" style="padding:24px 32px 12px;">
              <p style="margin:0;font-size:13px;color:#888;letter-spacing:1px;text-transform:uppercase;font-family:Arial,sans-serif;">The Madison Arcatao Sister City Project</p>
            </td>
          </tr>

          ${personalMessage ? `
          <tr>
            <td style="padding:0 32px 16px;">
              <p style="margin:0;font-size:16px;color:#333;font-family:Arial,sans-serif;white-space:pre-wrap;">${escapeHtml(personalMessage)}</p>
            </td>
          </tr>` : ''}

          <!-- Invitation image (full-width, clickable) -->
          <tr>
            <td align="center" style="padding:0 24px 20px;">
              <a href="https://mascp.org/rsvp/" style="display:block;">
                <img
                  src="https://mascp.org/assets/images/mascp-invitation.png"
                  alt="${escapeHtml(eventName)} — ${escapeHtml(eventDate)} from ${escapeHtml(eventTime)} — ${escapeHtml(eventVenue)}"
                  width="552"
                  style="display:block;width:100%;max-width:552px;height:auto;border:0;"
                >
              </a>
            </td>
          </tr>

          <!-- CTA button (visible even when images are blocked) -->
          <tr>
            <td align="center" style="padding:8px 32px 32px;">
              <a
                href="https://mascp.org/rsvp/"
                style="display:inline-block;background-color:#C4533A;color:#ffffff;font-family:Arial,sans-serif;font-size:18px;font-weight:bold;text-decoration:none;padding:16px 40px;border-radius:2px;"
              >
                RSVP Now &rarr;
              </a>
              <p style="margin:16px 0 0;font-size:13px;color:#888;font-family:Arial,sans-serif;">
                Or visit <a href="https://mascp.org/rsvp/" style="color:#C4533A;">mascp.org/rsvp</a>
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:0 32px;">
              <hr style="border:none;border-top:1px solid #DDD5C5;margin:0;">
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:20px 32px 24px;">
              <p style="margin:0;font-size:12px;color:#999;font-family:Arial,sans-serif;">
                A friend invited you to this event via <a href="https://mascp.org/" style="color:#999;">mascp.org</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'MASCP <info@mascp.org>',
      to: [friendEmail],
      subject,
      text: textBody,
      html: htmlBody,
    }),
  });

  if (!resendResponse.ok) {
    const detail = await resendResponse.text();
    console.error('Resend error:', detail);
    return { statusCode: 502, body: JSON.stringify({ error: 'Failed to send invitation email.' }) };
  }

  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
