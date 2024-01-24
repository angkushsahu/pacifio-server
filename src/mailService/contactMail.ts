import mailTransporter from "./mailTransporter";

export interface ContactMailArgs {
   subject: string;
   email: string;
   name: string;
   message: string;
}

export default async function contactMail({ email, message, name, subject }: ContactMailArgs) {
   try {
      const text: string = `
        NAME :- ${name}
        EMAIL :- ${email}
        SUBJECT :- ${subject}

        MESSAGE 👇🏻
        ${message}
        `;

      const mailOptions = {
         from: process.env.MAIL,
         to: process.env.MAIL,
         subject: subject,
         text,
      };

      await mailTransporter(mailOptions);
      return { success: true, message: "We received your message, thanks for connecting with us" };
   } catch (error: any) {
      return { success: false, message: error.message as string };
   }
}
