import { isProd } from "@/utils";

export const authConfig = isProd
  ? {
      prodUrl: "https://rtc.abclive.cloud/auth/callback",
      authUrl: "https://auth.abclive.cloud",
      secret: "940ce575-577f-4919-acfe-f7b8d2b2ceb9",
      clientId: "0ad69e55-8dd1-45f3-b72a-06dcec411d31",
    }
  : {
      prodUrl: "http://localhost:5173/auth/callback",
      authUrl: "http://localhost:3002",
      secret: "553d4e01120fe401",
      clientId: "553d4e01120fe401",
    };
