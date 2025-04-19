const { MailerSend, EmailParams, Sender, Recipient } = require("mailersend");

const mailersend = new MailerSend({
  apiKey: "mlsn.e5e08b0494bdf84e268176f4298772746e37aadd732f1d078cfe33fa37a21806", // Podés moverlo a .env
});

const sendVerificationEmail = async (user) => {
  const recipients = [new Recipient(user.email, `${user.name} ${user.lastname}`)];
  const domain = "test-2p0347zzzp9lzdrn.mlsender.net";
  const frontendUrl = `http://localhost:3000`; // ✅ Puerto correcto de tu app React


  const emailParams = new EmailParams()
    .setFrom(new Sender(`no-reply@${domain}`, "KidsTube"))
    .setTo(recipients)
    .setSubject("Verificá tu cuenta")
    .setHtml(`<p>Hola ${user.name},</p>
              <p>Gracias por registrarte en KidsTube. Para activar tu cuenta, hacé clic en el siguiente botón:</p>
              <a href="${frontendUrl}/verify?token=${user.verificationToken}">Verificar mi cuenta</a>
              <p>Si no te registraste, ignorá este mensaje.</p>`);

  await mailersend.email.send(emailParams);
};

module.exports = { sendVerificationEmail };
