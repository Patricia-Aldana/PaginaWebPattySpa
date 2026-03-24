const nodemailer = require("nodemailer");

const cleanText = (value) => String(value ?? "").trim();

const isBrevoConfigured = () => {
  return !!(
    cleanText(process.env.EMAIL_USER) &&
    cleanText(process.env.EMAIL_PASS)
  );
};

const normalizePayload = (...args) => {
  if (args[0] && typeof args[0] === "object" && !Array.isArray(args[0])) {
    const input = args[0];

    return {
      to: cleanText(input.to),
      toName: cleanText(input.toName || input.nombre || ""),
      subject: cleanText(input.subject || input.asunto),
      textContent: cleanText(
        input.textContent || input.text || input.texto || ""
      ),
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

const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: cleanText(process.env.EMAIL_USER),
      pass: cleanText(process.env.EMAIL_PASS),
    },
  });
};

const sendBrevoEmail = async (...args) => {
  const { to, subject, textContent, htmlContent } = normalizePayload(...args);

  if (!isBrevoConfigured()) {
    console.warn("⚠️ Gmail no está configurado.");
    return { sent: false, reason: "gmail-no-configurado" };
  }

  if (!to || !subject || (!textContent && !htmlContent)) {
    return { sent: false, reason: "datos-incompletos-para-correo" };
  }

  try {
    const transporter = createTransporter();

    const info = await transporter.sendMail({
      from: `"${cleanText(process.env.EMAIL_FROM_NAME) || "Patty Spa"}" <${cleanText(process.env.EMAIL_USER)}>`,
      to,
      subject,
      text: textContent || undefined,
      html: htmlContent || undefined,
    });

    console.log("📨 Correo enviado con Gmail:", info.messageId);

    return {
      sent: true,
      data: {
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected,
      },
    };
  } catch (error) {
    console.error("❌ Error enviando con Gmail:", error.message || error);

    return {
      sent: false,
      reason: error.message || "gmail-send-error",
    };
  }
};

module.exports = {
  sendBrevoEmail,
  isBrevoConfigured,
  sendEmail: sendBrevoEmail,
  sendMail: sendBrevoEmail,
  enviarCorreo: sendBrevoEmail,
};