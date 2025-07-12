namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;
    PORT: string;
    DATABASE_URL: string;
    ACCESS_TOKEN_SECRET: string;
    REFRESH_TOKEN_SECRET: string;
    GOOGLE_CLOUD_PROJECT_ID: string;
    GOOGLE_CLOUD_LOCATION: string;
    GOOGLE_APPLICATION_CREDENTIALS_JSON?: string;
    GOOGLE_APPLICATION_CREDENTIALS?: string;
  }
}
