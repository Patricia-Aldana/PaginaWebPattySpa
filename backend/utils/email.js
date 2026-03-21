const cleanText = (value) => String(value ?? "").trim();

const isBrevoConfigured = () => {
  return !!(
    cleanText(process.env.BREVO_API_KEY) &&
    cleanText(process.env.BREVO_SENDER_EMAIL)
  );
};

const parseBrevoResponse = async (response) => {
  try {
    return await response.json();
  } catch {
    try {
      const text = await response.text();
      return { message: text };
    } catch {
      return {};
    }
  }
};

const normalizePayload = (...args) => {
  if (args[0] && typeof args[0] === "object" && !Array.isArray(args[0])) {
    const input = args[0];

    return {
      to: cleanText(input.to),
      toName: cleanText(input.toName || input.nombre || ""),
      subject: cleanText(input.subject || input.asunto),
      textContent: cleanText(input.textContent || input.text || input.texto || ""),
      htmlContent: cleanText(input.htmlContent || input.html || ""),
    };
  }

  return {
    to: cleanText(args[0]),
    toName: "",
    subject: cleanText(args[1]),
    textContent: cleanText(args[2]),
    htmlContent: cleanText(args[3]),
  };
};

const sendEmail = async (...args) => {
  const { to, toName, subject, textContent, htmlContent } = normalizePayload(...args);

  if (!isBrevoConfigured()) {
    console.warn("⚠️ Brevo no está configurado.");
    return { sent: false, reason: "brevo-no-configurado" };
  }

  if (!to || !subject || (!textContent && !htmlContent)) {
    return { sent: false, reason: "datos-incompletos-para-correo" };
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": cleanText(process.env.BREVO_API_KEY),
      },
      body: JSON.stringify({
        sender: {
          email: cleanText(process.env.BREVO_SENDER_EMAIL),
          name: cleanText(process.env.BREVO_SENDER_NAME) || "Patty Spa",
        },
        to: [
          {
            email: to,
            name: toName,
          },
        ],
        subject,
        textContent,
        htmlContent,
      }),
    });

    const data = await parseBrevoResponse(response);

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

module.exports = sendEmail;
module.exports.sendEmail = sendEmail;
module.exports.sendMail = sendEmail;
module.exports.enviarCorreo = sendEmail;
module.exports.sendBrevoEmail = sendEmail;
module.exports.isBrevoConfigured = isBrevoConfigured;