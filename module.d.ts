declare namespace NodeJS {
   export interface ProcessEnv {
      DATABASE_URI: string;
      JWT_SECRET: string;
      PORT: string;
   }
}
