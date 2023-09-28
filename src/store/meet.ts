import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  audioConfig: {
    display: false,
  },
  videoConfig: {
    display: true,
  },
  socketConfig: {
    id: 12,
  },
};

export const MeetSlice = createSlice({
  name: "meet",
  initialState,
  reducers: {
    handleAudioConfig: (state) => {
      console.log("handleAudioConfig", state);
    },
    handleSocketConfig: (state) => {
      console.log("handleSocketConfig", state);
    },
  },
});

export const { handleAudioConfig, handleSocketConfig } = MeetSlice.actions;

export default MeetSlice.reducer;
