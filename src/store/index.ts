import { configureStore } from "@reduxjs/toolkit";
import MeetReducer from "./meet";
import UserInfoReducer from "./user";

const Store = configureStore({
  reducer: {
    MeetStore: MeetReducer,
    UserInfoStore: UserInfoReducer,
  },
});

export default Store;
