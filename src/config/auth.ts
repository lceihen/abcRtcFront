import { isProd } from "@/utils";

export const authConfig = isProd
  ? {
      prodUrl: "https://rtc.abclive.cloud/auth/callback",
      authUrl: "https://auth.abclive.cloud/",
      secret: "4330e47a00b259f8",
      clientId: "033f0a50eb2cd2b1",
    }
  : {
      prodUrl: "http://localhost:5173/auth/callback",
      authUrl: "http://localhost:3002",
      secret: "553d4e01120fe401",
      clientId: "553d4e01120fe401",
    };
