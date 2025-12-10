import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// Token management functions (inline instead of separate file)
const tokenManager = {
  getToken: () => {
    // Check multiple storage locations
    const localToken = localStorage.getItem('adminToken');
    if (localToken) return localToken;
    
    // Check sessionStorage as fallback
    const sessionToken = sessionStorage.getItem('adminToken');
    if (sessionToken) return sessionToken;
    
    return null;
  },
  
  setToken: (token) => {
    localStorage.setItem('adminToken', token);
    sessionStorage.setItem('adminToken', token); // Backup in sessionStorage
  },
  
  removeToken: () => {
    localStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminToken');
  },
  
  isAuthenticated: () => {
    return !!tokenManager.getToken();
  }
};

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    loading: false,
    admin: {},
    isAuthenticated: tokenManager.isAuthenticated(), // Initialize with token check
    token: tokenManager.getToken(), // Initialize with actual token
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
  state.isAuthenticated = false; // ✅ CHANGED: Keep false after registration
  state.isRegistered = true;     // ✅ Registration successful but not authenticated
  state.admin = action.payload.admin;
  state.token = null;            // ✅ CHANGED: Don't set token after registration
  state.error = null;
  // ✅ CHANGED: Don't save token after registration
},
    registerFailed(state, action) {
      state.loading = false;
      state.isAuthenticated = false;
      state.isRegistered = false;
      state.error = action.payload;
      tokenManager.removeToken(); // Clear token on failure
    },
    loginRequest(state) {
      state.loading = true;
      state.isAuthenticated = false;
      state.admin = {};
      state.token = null;
      state.error = null;
    },
    loginSuccess(state, action) {
      state.loading = false;
      state.isAuthenticated = true;  // ✅ Only set true after login
      state.admin = action.payload.admin;
      state.token = action.payload.token;
      state.error = null;
      tokenManager.setToken(action.payload.token); // Save token only after login
    },
    loginFailed(state, action) {
      state.loading = false;
      state.isAuthenticated = false;
      state.admin = {};
      state.token = null;
      state.error = action.payload;
      tokenManager.removeToken(); // Clear token on failure
    },
    loadadminRequest(state) {
      state.loading = true;
      state.error = null;
    },
    loadadminSuccess(state, action) {
      state.loading = false;
      state.isAuthenticated = true;
      state.admin = action.payload.admin;
      state.error = null;
      // Don't overwrite token here, keep the one from storage
    },
    loadadminFailed(state, action) {
      state.loading = false;
      state.isAuthenticated = false;
      state.admin = {};
      state.token = null;
      state.error = action.payload;
      tokenManager.removeToken(); // Clear invalid token
    },
    logoutSuccess(state) {
      state.loading = false;
      state.isAuthenticated = false;
      state.admin = {};
      state.token = null;
      state.error = null;
      state.message = "Logged out successfully";
      tokenManager.removeToken(); // Clear token on logout
    },
    logoutFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
      // Still remove token even if server logout fails
      tokenManager.removeToken();
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
    // New action to refresh token state
    refreshTokenState(state) {
      state.isAuthenticated = tokenManager.isAuthenticated();
      state.token = tokenManager.getToken();
    },
    // New action to clear registration state
    clearRegistrationState(state) {
      state.isRegistered = false;
      state.isAuthenticated = false;
      state.token = null;
    },
  },
});

const BASE_URL = import.meta.env.VITE_API_KEY;

// Enhanced API calls with automatic token handling
export const registeradmin = (adminData) => async (dispatch) => {
  dispatch(adminSlice.actions.registerRequest());
  try {
    console.log("Register payload:", adminData);
    const { data } = await axios.post(`${BASE_URL}/register`, adminData, {
      withCredentials: true,
      headers: { "Content-Type": "application/json" },
    });
    
    console.log('Registration successful, but NOT storing token');
    
    // ✅ Successfully registered but NOT authenticated
    dispatch(adminSlice.actions.registerSuccess({ 
      admin: data.result,
      // Don't pass token here
    }));
    
    dispatch(adminSlice.actions.clearAllErrors());
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Registration failed";
    dispatch(adminSlice.actions.registerFailed(errorMessage));
  }
};

export const login = (adminEmailId, adminPassword) => async (dispatch) => {
  console.log("Login API URL:", `${BASE_URL}/login`);
  console.log("Login payload:", { adminEmailId, adminPassword });
  dispatch(adminSlice.actions.loginRequest());
  try {
    const { data } = await axios.post(
      `${BASE_URL}/login`,
      { adminEmailId, adminPassword },
      { withCredentials: true, headers: { "Content-Type": "application/json" } }
    );
    
    console.log('Stored Token in login:', data.token);
    
    // ✅ Only set authentication after login
    dispatch(adminSlice.actions.loginSuccess({ 
      admin: data.result, 
      token: data.token 
    }));
    dispatch(adminSlice.actions.clearAllErrors());
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Login failed";
    dispatch(adminSlice.actions.loginFailed(errorMessage));
  }
};

export const getadmin = () => async (dispatch) => {
  dispatch(adminSlice.actions.loadadminRequest());
  try {
    const token = tokenManager.getToken();
    if (!token) {
      dispatch(adminSlice.actions.loadadminFailed("No token found"));
      return;
    }

    const { data } = await axios.get(`${BASE_URL}/get-admin`, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    dispatch(
      adminSlice.actions.loadadminSuccess({
        admin: data.result,
        token: token, // Use the stored token
      })
    );
    dispatch(adminSlice.actions.clearAllErrors());
  } catch (error) {
    console.error("getadmin error:", error.response?.data);
    dispatch(adminSlice.actions.loadadminFailed("Session expired"));
  }
};

export const logout = () => async (dispatch) => {
  try {
    const token = tokenManager.getToken();
    await axios.get(`${BASE_URL}/logout`, {
      withCredentials: true,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    dispatch(adminSlice.actions.logoutSuccess());
    dispatch(adminSlice.actions.clearAllErrors());
  } catch (error) {
    console.error("Logout error:", error);
    // Still logout locally even if server call fails
    dispatch(adminSlice.actions.logoutSuccess());
  }
};

export const updatePassword =
  (currentPassword, newPassword, confirmNewPassword) => async (dispatch) => {
    dispatch(adminSlice.actions.updatePasswordRequest());
    try {
      const token = tokenManager.getToken();
      const { data } = await axios.put(
        `${BASE_URL}/password/update`,
        { currentPassword, newPassword, confirmNewPassword },
        {
          withCredentials: true,
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      dispatch(adminSlice.actions.updatePasswordSuccess(data.message));
      dispatch(adminSlice.actions.clearAllErrors());
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Password update failed";
      dispatch(adminSlice.actions.updatePasswordFailed(errorMessage));
    }
  };

export const updateProfile = (profileData) => async (dispatch) => {
  dispatch(adminSlice.actions.updateProfileRequest());
  try {
    const token = tokenManager.getToken();
    const response = await axios.put(
      `${BASE_URL}/profile-update`,
      profileData,
      {
        withCredentials: true,
        headers: { 
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    dispatch(adminSlice.actions.updateProfileSuccess(response.data.message));
    dispatch(adminSlice.actions.clearAllErrors());
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Profile update failed";
    dispatch(adminSlice.actions.updateProfileFailed(errorMessage));
  }
};

// New action to refresh authentication state
export const refreshAuthState = () => (dispatch) => {
  dispatch(adminSlice.actions.refreshTokenState());
};

// Initialize auth state on app start
export const initializeAuth = () => (dispatch) => {
  const token = tokenManager.getToken();
  if (token) {
    // If we have a token, try to get admin data
    dispatch(getadmin());
  } else {
    // If no token, ensure state is clean
    dispatch(adminSlice.actions.loadadminFailed("No token found"));
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

// New action to clear registration state
export const clearRegistrationState = () => (dispatch) => {
  dispatch(adminSlice.actions.clearRegistrationState());
};

export default adminSlice.reducer;