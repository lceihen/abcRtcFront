import { useRoutes } from "react-router-dom";
import Layout from "@/pages/Layout";
import Callback from "@/pages/Auth/Callback";
import Room from "@/pages/Room";
export const RouterConfig = [
  {
    name: "首页",
    path: "/",
    hideInMenu: true,
    children: [
      {
        path: "/",
        element: <Layout />,
      },
    ],
  },
  {
    name: "认证管理",
    path: "/auth",
    children: [
      {
        path: "/auth",
        redirect: "/auth/callback",
      },
      {
        name: "回调",
        path: "/auth/callback",
        hideInMenu: true,
        element: <Callback />,
      },
    ],
  },
  {
    name: "房间",
    path: "/room",
    hideInMenu: true,
    element: <Room />,
  },
];
const RouterConfigElement = () => useRoutes(RouterConfig);
export default RouterConfigElement;
