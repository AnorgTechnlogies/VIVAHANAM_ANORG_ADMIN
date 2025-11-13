import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    loading: false,
    admin: {},
    isAuthenticated: false,
    token: null, // Added token field
    error: null,
    message: null,
    isUpdated: false,
    isRegistered: false,
    staffAdded: false,
    success: false,
    grampanchayat: {},
    isGrampanchayatAdded: false,
    grampanchayatMessage: null,
  },
  reducers: {
    registerRequest(state) {
      state.loading = true;
      state.isAuthenticated = false;
      state.isRegistered = false;
      state.error = null;
    },
    registerSuccess(state, action) {
      state.loading = false;
      state.isAuthenticated = true;
      state.isRegistered = true;
      state.admin = action.payload.admin;
      state.token = action.payload.token; // Store token
      state.error = null;
    },
    registerFailed(state, action) {
      state.loading = false;
      state.isAuthenticated = false;
      state.isRegistered = false;
      state.error = action.payload;
    },
    loginRequest(state) {
      state.loading = true;
      state.isAuthenticated = false;
      state.admin = {};
      state.token = null; // Reset token
      state.error = null;
    },
    loginSuccess(state, action) {
      state.loading = false;
      state.isAuthenticated = true;
      state.admin = action.payload.admin;
      state.token = action.payload.token; // Store token
      state.error = null;
    },
    loginFailed(state, action) {
      state.loading = false;
      state.isAuthenticated = false;
      state.admin = {};
      state.token = null; // Reset token
      state.error = action.payload;
    },
    loadadminRequest(state) {
      state.loading = true;
      state.error = null;
    },
    loadadminSuccess(state, action) {
      state.loading = false;
      state.isAuthenticated = true;
      state.admin = action.payload.admin;
      state.token = action.payload.token; // Store token
      state.error = null;
    },
    loadadminFailed(state, action) {
      state.loading = false;
      state.isAuthenticated = false;
      state.admin = {};
      state.token = null; // Reset token
      state.error = action.payload;
    },
    logoutSuccess(state) {
      state.loading = false;
      state.isAuthenticated = false;
      state.admin = {};
      state.token = null; // Clear token
      state.error = null;
      state.message = "Logged out successfully";
    },
    logoutFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    updatePasswordRequest(state) {
      state.loading = true;
      state.error = null;
    },
    updatePasswordSuccess(state, action) {
      state.loading = false;
      state.message = action.payload;
      state.error = null;
    },
    updatePasswordFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    updateProfileRequest(state) {
      state.loading = true;
      state.isUpdated = false;
      state.error = null;
    },
    updateProfileSuccess(state, action) {
      state.loading = false;
      state.isUpdated = true;
      state.message = action.payload;
      state.error = null;
    },
    updateProfileFailed(state, action) {
      state.loading = false;
      state.isUpdated = false;
      state.error = action.payload;
    },
    updateProfileResetAfterUpdate(state) {
      state.isUpdated = false;
    },
    resetGrampanchayatStatus(state) {
      state.isGrampanchayatAdded = false;
    },
    clearAllErrors(state) {
      state.error = null;
    },
    clearAllMessagesOfadmin(state) {
      state.message = null;
      state.error = null;
    },
  },
});

const BASE_URL = import.meta.env.VITE_API_KEY;

export const registeradmin = (adminData) => async (dispatch) => {
  dispatch(adminSlice.actions.registerRequest());
  try {
    console.log("Register payload:", Object.fromEntries(adminData));
    const { data } = await axios.post(`${BASE_URL}/api/admin/register`, adminData, {
      withCredentials: true,
      headers: { "Content-Type": "multipart/form-data" },
    });
    localStorage.setItem('adminToken', data.token); // Store token
    console.log('Stored Token in register:', data.token); // Debug
    dispatch(adminSlice.actions.registerSuccess({ admin: data.result, token: data.token }));
    dispatch(adminSlice.actions.clearAllErrors());
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Registration failed";
    dispatch(adminSlice.actions.registerFailed(errorMessage));
  }
};

export const login = (adminEmailId, adminPassword) => async (dispatch) => {
  console.log("Login API URL:", `${BASE_URL}/api/admin/login`);
  console.log("Login payload:", { adminEmailId, adminPassword });
  dispatch(adminSlice.actions.loginRequest());
  try {
    const { data } = await axios.post(
      `${BASE_URL}/api/admin/login`,
      { adminEmailId, adminPassword },
      { withCredentials: true, headers: { "Content-Type": "application/json" } }
    );
    localStorage.setItem('adminToken', data.token); // Store token
    console.log('Stored Token in login:', data.token); // Debug
    dispatch(adminSlice.actions.loginSuccess({ admin: data.result, token: data.token }));
    dispatch(adminSlice.actions.clearAllErrors());
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Login failed";
    dispatch(adminSlice.actions.loginFailed(errorMessage));
  }
};

export const getadmin = () => async (dispatch) => {
  dispatch(adminSlice.actions.loadadminRequest());
  try {
    const { data } = await axios.get(`${BASE_URL}/api/admin/get-admin`, {
      withCredentials: true,
    });
    localStorage.setItem('adminToken', data.token); // Store token
    console.log('Stored Token in getadmin:', data.token); // Debug
    dispatch(adminSlice.actions.loadadminSuccess({ admin: data.result, token: data.token }));
    dispatch(adminSlice.actions.clearAllErrors());
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to load admin";
    dispatch(adminSlice.actions.loadadminFailed(errorMessage));
  }
};

export const logout = () => async (dispatch) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/api/admin/logout`, {
      withCredentials: true,
    });
    localStorage.removeItem('adminToken'); // Clear token
    dispatch(adminSlice.actions.logoutSuccess());
    dispatch(adminSlice.actions.clearAllErrors());
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Logout failed";
    dispatch(adminSlice.actions.logoutFailed(errorMessage));
  }
};

export const updatePassword =
  (currentPassword, newPassword, confirmNewPassword) => async (dispatch) => {
    dispatch(adminSlice.actions.updatePasswordRequest());
    try {
      const { data } = await axios.put(
        `${BASE_URL}/api/admin/password/update`,
        { currentPassword, newPassword, confirmNewPassword },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      dispatch(adminSlice.actions.updatePasswordSuccess(data.message));
      dispatch(adminSlice.actions.clearAllErrors());
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Password update failed";
      dispatch(adminSlice.actions.updatePasswordFailed(errorMessage));
    }
  };

export const updateProfile = (data) => async (dispatch) => {
  dispatch(adminSlice.actions.updateProfileRequest());
  try {
    const response = await axios.put(
      `${BASE_URL}/api/admin/profile-update`,
      data,
      {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    dispatch(adminSlice.actions.updateProfileSuccess(response.data.message));
    dispatch(adminSlice.actions.clearAllErrors());
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Profile update failed";
    dispatch(adminSlice.actions.updateProfileFailed(errorMessage));
  }
};

export const resetProfile = () => (dispatch) => {
  dispatch(adminSlice.actions.updateProfileResetAfterUpdate());
};

export const resetGrampanchayatStatus = () => (dispatch) => {
  dispatch(adminSlice.actions.resetGrampanchayatStatus());
};

export const clearAlladminErrors = () => (dispatch) => {
  dispatch(adminSlice.actions.clearAllErrors());
};

export const clearAlladminMessages = () => (dispatch) => {
  dispatch(adminSlice.actions.clearAllMessagesOfadmin());
};

export default adminSlice.reducer;