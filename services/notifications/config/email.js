import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: '"CargoSync" <noreply@cargosync.com>',
      to,
      subject,
      html
    });

    console.log(`Email sent: ${info.messageId}`);
    console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);

    return info;
  } catch (error) {
    console.error(`Email error: ${error.message}`);
    throw error;
  }
};

export default transporter;