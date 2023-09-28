import { io } from "socket.io-client";
import { baseUrl } from "@/config/index";
import { message } from "antd";

let socket = io(baseUrl, {
  reconnectionDelayMax: 10000,
  withCredentials: true,
});

let isError = false;

export const initSocket = () => {
  return new Promise((resolve, reject) => {
    socket.on("connect", async () => {
      // socket.io.on("reconnect", (attempt) => {
      //   message.success("成功重新连接");
      // });
      // socket.io.on("reconnect_attempt", (attempt) => {
      //   message.warning("正在连接中");
      // });
      if (isError) window.location.reload();
      console.log("成功连接");
      resolve();
    });
    socket.io.on("error", (error) => {
      // message.error("客户端socket发生错误,请刷新页面");
      console.log("客户端socket发生错误,请刷新页面");
      isError = true;
      reject();
    });
  });
};

export default socket;
