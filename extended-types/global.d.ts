namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;
    PORT: string;
    MONGO_URI: string;
    ACCESS_TOKEN_SECRET: string;
    REFRESH_TOKEN_SECRET: string;
    GOOGLE_CLOUD_PROJECT_ID: string;
    GOOGLE_CLOUD_LOCATION: string;
  }
}
