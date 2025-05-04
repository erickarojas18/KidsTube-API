const twilio = require("twilio");
require("dotenv").config();

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE;

const client = new twilio(accountSid, authToken);

const sendSMS = async (to, message) => {
  try {
    const msg = await client.messages.create({
      body: message,
      from: twilioPhone,
      to,
    });
    console.log("📱 SMS enviado:", msg.sid);
  } catch (error) {
    console.error(" Error al enviar SMS:", error.message);
    throw new Error("No se pudo enviar el SMS");
  }
};

module.exports = { sendSMS };
