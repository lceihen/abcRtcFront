import request from "@/utils/request";
export const getToken = (params: any) => {
  return request({
    params,
    url: "/api/auth/token",
  });
};
export const getUserInfo = () => {
  return request({
    url: "/api/user",
  });
};

export const loginOutApi = () => {
  return request({
    url: "/api/auth/loginOut",
  });
};
