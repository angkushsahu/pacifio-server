import { createTransport } from "nodemailer";

export interface MailTransporterArgs {
   from: string;
   to: string;
   subject: string;
   text: string;
}

export default function mailTransporter(mailOptions: MailTransporterArgs) {
   const transporter = createTransport({
      service: process.env.MAIL_SERVICE,
      auth: {
         user: process.env.MAIL,
         pass: process.env.MAIL_PASS,
      },
   });

   return transporter.sendMail(mailOptions);
}
