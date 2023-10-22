export * from "./auth";

import { request } from "@lceihen/front-utils";

import { httpsRequestUrl, authConfig } from "@/config";

export const httpsRequest = (param: any) => {
  return request({
    ...param,
    BaseUrl: httpsRequestUrl,
    authConfig,
  });
};
