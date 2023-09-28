import { authConfig } from "@/config";

export const isProd = import.meta.env.MODE === "production";

export const login = () => {
  if (window.location.pathname === "/auth/callback") return;
  const { prodUrl, authUrl, clientId, secret } = authConfig;
  const redirectUri = encodeURIComponent(`${prodUrl}`);

  window.location.replace(
    `${authUrl}?redirectUri=${redirectUri}&clientId=${clientId}&secret=${secret}`
  );
};
