declare namespace NodeJS {
   export interface ProcessEnv {
      DATABASE_URI: string;
      CLIENT_URL: string;
      JWT_SECRET: string;
      PORT: string;
      MAIL_SERVICE: string;
      MAIL: string;
      MAIL_PASS: string;
   }
}
