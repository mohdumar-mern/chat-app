import { createSlice } from "@reduxjs/toolkit";


const initialState = {
  token: localStorage.getItem("token") || null,
  user: localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, { payload }) => {
      const { token, user } = payload;

      if (token) {
        state.token = token;
        localStorage.setItem("token", token);
      }

      if (user) {
        state.user = user;
        localStorage.setItem("user", JSON.stringify(user)); // ✅ store user as JSON
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
