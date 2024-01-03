import { createTransport } from "nodemailer";

export default async function sendResetMail({ email, resetToken }: { email: string; resetToken: string }) {
   try {
      const transporter = createTransport({
         service: process.env.MAIL_SERVICE,
         auth: {
            user: process.env.MAIL,
            pass: process.env.MAIL_PASS,
         },
      });

      const text: string = `
        WE GOT YOUR REQUEST TO RESET YOUR PASSWORD

        CLICK ON THE LINK BELOW WHICH WILL REDIRECT TO A PAGE WHERE YOU CAN SAFELY RESET YOUR PASSWORD

        LINK - ${process.env.CLIENT_URL}/auth/reset-password/${resetToken}

        THANKS.
        PACIFIO
        `;

      const mailOptions = {
         from: process.env.MAIL,
         to: email,
         subject: "PACIFIO RESET PASSWORD",
         text,
      };

      await transporter.sendMail(mailOptions);
      return { success: true, message: "Check your mail inbox, you will receive a link from where you can reset your password" };
   } catch (error: any) {
      return { success: false, message: error.message as string };
   }
}
