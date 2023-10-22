export * from "./auth";

import { frontUtils } from "@lceihen/front-utils";

const { request } = frontUtils;
import { httpsRequestUrl, authConfig } from "@/config";

export const httpsRequest = (param: any) => {
  return request({
    ...param,
    BaseUrl: httpsRequestUrl,
    authConfig,
  });
};
