const fetch = require("node-fetch");

const cleanText = (value) => String(value ?? "").trim();

const isBrevoConfigured = () => {
  return !!(
    cleanText(process.env.BREVO_API_KEY) &&
    cleanText(process.env.BREVO_SENDER_EMAIL)
  );
};

const sendBrevoEmail = async ({
  to,
  toName = "",
  subject,
  textContent = "",
  htmlContent = "",
}) => {
  try {
    if (!isBrevoConfigured()) {
      console.warn("⚠️ Brevo no está configurado.");
      return { sent: false, reason: "brevo-no-configurado" };
    }

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": cleanText(process.env.BREVO_API_KEY),
      },
      body: JSON.stringify({
        sender: {
          name: cleanText(process.env.BREVO_SENDER_NAME) || "Patty Spa",
          email: cleanText(process.env.BREVO_SENDER_EMAIL),
        },
        to: [
          {
            email: cleanText(to),
            name: cleanText(toName),
          },
        ],
        subject: cleanText(subject),
        textContent: cleanText(textContent),
        htmlContent: cleanText(htmlContent),
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("❌ Error Brevo:", data);
      return {
        sent: false,
        reason: data?.message || data?.code || "brevo-error",
        data,
      };
    }

    console.log("📨 Correo enviado con Brevo:", data);
    return { sent: true, data };
  } catch (error) {
    console.error("❌ Error enviando con Brevo:", error.message || error);
    return {
      sent: false,
      reason: error.message || "brevo-fetch-error",
    };
  }
};

module.exports = {
  sendBrevoEmail,
  isBrevoConfigured,
};