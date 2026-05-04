const fetch = require("node-fetch");
const nodemailer = require("nodemailer");

const cleanText = (value) => String(value ?? "").trim();

const hasBrevoConfig = () => {
  return !!(
    cleanText(process.env.BREVO_API_KEY) &&
    cleanText(process.env.BREVO_SENDER_EMAIL)
  );
};

const hasGmailConfig = () => {
  return !!(
    cleanText(process.env.EMAIL_USER) &&
    cleanText(process.env.EMAIL_PASS)
  );
};

const isBrevoConfigured = () => {
  return hasBrevoConfig() || hasGmailConfig();
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

const createGmailTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: cleanText(process.env.EMAIL_USER),
      pass: cleanText(process.env.EMAIL_PASS),
    },
  });
};

const sendWithBrevo = async ({ to, toName, subject, textContent, htmlContent }) => {
  try {
    // CORRECCIÓN: Usamos un timeout para que Render no se quede colgado si la red falla
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos max

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "api-key": cleanText(process.env.BREVO_API_KEY),
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: cleanText(process.env.EMAIL_FROM_NAME) || "Patty Spa",
          email: cleanText(process.env.BREVO_SENDER_EMAIL),
        },
        to: [{ email: to, name: toName || to }],
        subject,
        textContent: textContent || undefined,
        htmlContent: htmlContent || undefined,
      }),
    });

    clearTimeout(timeoutId);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("❌ Error Brevo API:", data);
      return { sent: false, reason: data?.message || `status-${response.status}` };
    }

    return { sent: true, data };
  } catch (error) {
    console.error("❌ Fallo conexión Brevo:", error.message);
    
    // FALLBACK: Si Brevo falla por red (como el ENETUNREACH), intentamos con Gmail automáticamente
    if (hasGmailConfig()) {
      console.log("🔄 Reintentando envío con Gmail por error de red en Brevo...");
      return await sendWithGmail({ to, subject, textContent, htmlContent });
    }

    return { sent: false, reason: "error-conexion-correo" };
  }
};

const sendWithGmail = async ({ to, subject, textContent, htmlContent }) => {
  try {
    const transporter = createGmailTransporter();
    const info = await transporter.sendMail({
      from: `"${cleanText(process.env.EMAIL_FROM_NAME) || "Patty Spa"}" <${cleanText(process.env.EMAIL_USER)}>`,
      to,
      subject,
      text: textContent || undefined,
      html: htmlContent || undefined,
    });

    return { sent: true, data: { messageId: info.messageId } };
  } catch (error) {
    console.error("❌ Error Gmail:", error.message);
    return { sent: false, reason: "error-gmail" };
  }
};

const sendBrevoEmail = async (...args) => {
  const { to, toName, subject, textContent, htmlContent } = normalizePayload(...args);

  if (!to || !subject || (!textContent && !htmlContent)) {
    return { sent: false, reason: "datos-incompletos" };
  }

  // Prioridad: Brevo, si falla o no está, Gmail
  if (hasBrevoConfig()) {
    return sendWithBrevo({ to, toName, subject, textContent, htmlContent });
  }

  if (hasGmailConfig()) {
    return sendWithGmail({ to, subject, textContent, htmlContent });
  }

  return { sent: false, reason: "sin-configuracion" };
};

module.exports = {
  sendBrevoEmail,
  isBrevoConfigured,
  sendEmail: sendBrevoEmail,
  sendMail: sendBrevoEmail,
  enviarCorreo: sendBrevoEmail,
};