import { httpsRequest } from "@/api/index";

export const getToken = (params: any) => {
  return httpsRequest({
    params,
    url: "/api/auth/token",
  });
};
export const getUserInfo = () => {
  return httpsRequest({
    url: "/api/user",
  });
};

export const loginOutApi = () => {
  return httpsRequest({
    url: "/api/auth/loginOut",
  });
};
