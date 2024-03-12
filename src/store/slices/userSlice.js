import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "userSlice",
  initialState: {
    token: null,
    userInfo: null,
  },
  reducers: {
    setToken(state, action) {
      console.log({ action });
      state.token = action.payload;
    },
    setUserInfo(state, action) {
      console.log({ action });
      state.userInfo = action.payload;
    },
  },
});

export const { setToken, setUserInfo } = userSlice.actions;
export const userReducer = userSlice.reducer;
