import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userInfo: null,
};

export const UserInfoSlice = createSlice({
  name: "userInfo",
  initialState,
  reducers: {
    handleSetUserInfo: (state, { payload }) => {
      state.userInfo = payload;
    },
  },
});

export const { handleSetUserInfo } = UserInfoSlice.actions;

export default UserInfoSlice.reducer;
