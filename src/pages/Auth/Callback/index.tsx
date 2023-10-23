import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getToken } from "@/api";
import { authConfig } from "@/config";
const Callback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const code = searchParams.get("code");

  const { prodUrl, clientId, secret } = authConfig;
  const redirectUri = encodeURIComponent(`${prodUrl}`);

  useEffect(() => {
    getToken({
      code,
      redirectUri,
      clientId,
      secret,
    }).finally(() => {
      window.location.href = "/";
    });
  }, []);
  return null;
};
export default Callback;
