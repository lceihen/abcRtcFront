import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import * as path from "path";
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    server: {
      host: "localhost",
      port: "5173",
    },
    plugins: [react()],
    resolve: {
      alias: [
        {
          find: "@",
          replacement: path.resolve("./src"),
        },
      ],
    },
    base:
      mode === "development"
        ? ""
        : "https://lcsubappassets.oss-cn-guangzhou.aliyuncs.com/rtc/",
  };
});
