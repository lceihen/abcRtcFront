import { isProd } from "@/utils";

export * from "./auth";

export const baseUrl = isProd
  ? "//rtc-server.abclive.cloud/rtc"
  : "ws://localhost:3001/rtc";

export const httpsRequestUrl = isProd ? "" : "http://localhost:3000";

export const whiteRouterList = ["/auth/callback"];
