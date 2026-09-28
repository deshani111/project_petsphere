function getAppUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ).replace(/\/+$/, "");
}

function getFromAddress() {
  if (!process.env.BREVO_FROM_EMAIL) {
    throw new Error("BREVO_FROM_EMAIL is not configured.");
  }

  return process.env.BREVO_FROM_EMAIL;
}

function getFromName() {
  return process.env.BREVO_FROM_NAME || "PetSphere";
}

export function buildVerificationLink(token) {
  const verificationUrl = new URL(
    "/api/auth/verify-email",
    getAppUrl()
  );

  verificationUrl.searchParams.set("token", token);

  return verificationUrl.toString();
}

export async function sendVerificationEmail({
  to,
  recipientName,
  verificationUrl,
}) {
  if (!process.env.BREVO_API_KEY) {
    throw new Error("BREVO_API_KEY is not configured.");
  }

  const displayName = recipientName || "there";

  const textContent = [
    `Hi ${displayName},`,
    "",
    "Welcome to PetSphere. Please verify your email address to activate your account:",
    verificationUrl,
    "",
    "This link expires in 24 hours.",
    "",
    "If you did not create a PetSphere account, you can ignore this email.",
  ].join("\n");

  const htmlContent = `
    <div style="margin: 0; padding: 40px 20px; background: #f8f5f5; font-family: Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 40px;">

        <div style="margin-bottom: 30px; font-size: 24px; font-weight: 700; color: #A13D3F;">
          PetSphere
        </div>

        <h1 style="margin: 0 0 16px; font-size: 28px; line-height: 1.08;">
          Verify your email address
        </h1>

        <p style="margin: 0 0 18px; color: #5e5356; font-size: 16px; line-height: 1.6;">
          Hi ${displayName},
        </p>

        <p style="margin: 0 0 22px; color: #5e5356; font-size: 16px; line-height: 1.6;">
          Welcome to PetSphere. Please confirm your email address to finish setting up your account.
        </p>

        <p style="margin: 0 0 28px;">
          <a
            href="${verificationUrl}"
            style="display: inline-block; background: #A13D3F; color: #ffffff; text-decoration: none; padding: 14px 22px; border-radius: 12px; font-weight: 700;"
          >
            Verify email
          </a>
        </p>

        <p style="margin: 0 0 10px; color: #7f7477; font-size: 14px; line-height: 1.6;">
          If the button does not work, copy and paste this link into your browser:
        </p>

        <p style="margin: 0 0 22px; word-break: break-all; color: #A13D3F; font-size: 14px; line-height: 1.6;">
          ${verificationUrl}
        </p>

        <p style="margin: 0; color: #7f7477; font-size: 14px; line-height: 1.6;">
          This link expires in 24 hours. If you did not create a PetSphere account, you can ignore this message.
        </p>

      </div>
    </div>
  `;

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: getFromName(),
        email: getFromAddress(),
      },
      to: [
        {
          email: to,
          name: displayName,
        },
      ],
      subject: "Verify your PetSphere email",
      textContent,
      htmlContent,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Brevo email error:", data);
    throw new Error(
      data?.message || "Failed to send verification email."
    );
  }

  return data;
}