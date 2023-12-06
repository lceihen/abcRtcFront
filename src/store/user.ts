import { UserInfo } from "@/interface";
import { createSlice } from "@reduxjs/toolkit";

interface InitialState {
  userInfo: UserInfo;
}

const initialState: InitialState = {
  userInfo: JSON.parse(localStorage.getItem("userInfo") || "{}"),
};

export const UserInfoSlice = createSlice({
  name: "userInfo",
  initialState,
  reducers: {
    handleSetUserInfo: (state, { payload }) => {
      state.userInfo = payload;
      localStorage.setItem("userInfo", JSON.stringify(payload));
    },
  },
});

export const { handleSetUserInfo } = UserInfoSlice.actions;

export default UserInfoSlice.reducer;
