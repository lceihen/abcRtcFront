import { BrowserRouter, useLocation } from "react-router-dom";
import RouterConfigElement from "@/routers";
import { useEffect, useState } from "react";

import { useSelector, useDispatch } from "react-redux";
import { getUserInfo } from "@/api";
import { handleSetUserInfo } from "@/store/user";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    getUserInfo().then((res) => {
      if (res.code === "0") {
        dispatch(handleSetUserInfo(res.data));
      }
    });
  }, []);

  return (
    <BrowserRouter>
      <RouterConfigElement></RouterConfigElement>
    </BrowserRouter>
  );
}

export default App;
