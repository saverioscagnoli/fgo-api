declare global {
  namespace NodeJS {
    interface ProcessEnv {
      WRAPPER: string;
      SERVANT_NAME: string;
      JP_NAME: string;
      AKAS: string;
    }
  }
}
export {};
