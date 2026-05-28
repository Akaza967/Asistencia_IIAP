import * as nodemailer from 'nodemailer';

export const sendVerificationEmail = async (email: string, fullName: string, token: string) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // URL del frontend o endpoint que procesará el token
  const verificationLink = `http://localhost:3000/auth/verify/${token}`;

  const mailOptions = {
    from: `"Asistencia IIAP" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Verifica tu cuenta en Asistencia IIAP',
    html: `
      <h2>Hola ${fullName},</h2>
      <p>Gracias por registrarte. Por favor, verifica tu correo electrónico haciendo clic en el siguiente enlace:</p>
      <p><a href="${verificationLink}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Verificar mi cuenta</a></p>
      <p>Si no puedes hacer clic, copia y pega este enlace en tu navegador:</p>
      <p>${verificationLink}</p>
      <br />
      <p>Este enlace expirará en 24 horas.</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Correo de verificación enviado: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error enviando el correo:', error);
    throw new Error('Error al enviar el correo de verificación');
  }
};

export const sendPasswordResetEmail = async (email: string, fullName: string, token: string) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // El frontend debe tener esta ruta para que el usuario introduzca su nueva contraseña
  const resetLink = `http://localhost:3000/reset-password?token=${token}`;

  const mailOptions = {
    from: `"Asistencia IIAP" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Restablecer contraseña - Asistencia IIAP',
    html: `
      <h2>Hola ${fullName},</h2>
      <p>Has solicitado restablecer tu contraseña. Haz clic en el botón de abajo para asignar una nueva:</p>
      <p><a href="${resetLink}" style="padding: 10px 20px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 5px;">Restablecer Contraseña</a></p>
      <p>Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
      <br />
      <p>Este enlace expirará en 1 hora.</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Correo de recuperación enviado: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error enviando el correo de recuperación:', error);
    throw new Error('Error al enviar el correo de recuperación');
  }
};
