import { isProd } from "@/utils";

export * from "./auth";

export const baseUrl = isProd
  ? "//authserve.abclive.cloud/rtc"
  : "ws://localhost:3001/rtc";

export const httpsRequestUrl = isProd
  ? "https://authserve.abclive.cloud"
  : "http://localhost:3000";
