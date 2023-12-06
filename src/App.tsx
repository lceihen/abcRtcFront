import { BrowserRouter } from "react-router-dom";
import RouterConfigElement from "@/routers";
import { useEffect } from "react";

import { useDispatch } from "react-redux";
import { getUserInfo } from "@/api";
import { handleSetUserInfo } from "@/store/user";
import { whiteRouterList } from "./config";
import { ResponseData, UserInfo } from "./interface";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!whiteRouterList.includes(location.pathname)) {
      getUserInfo().then((res: ResponseData<UserInfo>) => {
        if (res.code === "0") {
          dispatch(handleSetUserInfo(res.data));
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <BrowserRouter>
      <RouterConfigElement></RouterConfigElement>
    </BrowserRouter>
  );
}

export default App;
