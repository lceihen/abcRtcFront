import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App.tsx";
import { initSocket } from "@/config/socketInstance.ts";
import { Result, Button, Layout } from "antd";
import Store from "./store/index.ts";
import "normalize.css";
import "@/assets/css/index.css";

import styles from "./index.module.less";

initSocket()
  .then(() =>
    ReactDOM.createRoot(document.getElementById("root")!).render(
      <Provider store={Store}>
        <App />
      </Provider>
    )
  )
  .catch(() => {
    return ReactDOM.createRoot(document.getElementById("root")!).render(
      <Layout className={styles.root_container}>
        <Result
          status="500"
          title="500"
          subTitle="Sorry, something went wrong."
          extra={<Button type="primary">Retry</Button>}
        />
      </Layout>
    );
  });
