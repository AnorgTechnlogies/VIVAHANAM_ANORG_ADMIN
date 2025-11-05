// store.js (updated to include planReducer)
import { configureStore } from "@reduxjs/toolkit";
import doctorReducer from "./slices/doctorSlice";
import planReducer from "./slices/planSlice";

export const store = configureStore({
  reducer: {
    doctor: doctorReducer,
    plan: planReducer,
  },
});