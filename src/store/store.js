// store.js (updated to include planReducer)
import { configureStore } from "@reduxjs/toolkit";
import adminReducer from "./slices/adminSlice";
import planReducer from "./slices/planSlice";

export const store = configureStore({
  reducer: {
    admin: adminReducer,
    plan: planReducer,
  },
});