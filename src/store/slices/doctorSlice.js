import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const doctorSlice = createSlice({
  name: "doctor",
  initialState: {
    loading: false,
    doctor: {},
    isAuthenticated: false,
    error: null,
    message: null,
    isUpdated: false,
    isRegistered: false, // Add this for registration status
    staffAdded: false, // Add this for staff addition status
    success: false,  // Add this for tracking success state

    grampanchayat: {},
    isGrampanchayatAdded: false,
    grampanchayatMessage: null,
  },


  reducers: {
    // Add these new reducers for registration
    registerRequest(state, action) {
      state.loading = true;
      state.isAuthenticated = false;
      state.isRegistered = false;
      state.error = null;
    },
    registerSuccess(state, action) {
      state.loading = false;
      state.isAuthenticated = true;
      state.isRegistered = true;
      state.doctor = action.payload;
      state.error = null;
    },
    registerFailed(state, action) {
      state.loading = false;
      state.isAuthenticated = false;
      state.isRegistered = false;
      state.error = action.payload;
    },
    // Keep all existing reducers
    loginRequest(state, action) {
      state.loading = true;
      state.isAuthenticated = false;
      state.doctor = {};
      state.error = null;
    },
    loginSuccess(state, action) {
      state.loading = false;
      state.isAuthenticated = true;
      state.doctor = action.payload;
      state.error = null;
    },
    loginFailed(state, action) {
      state.loading = false;
      state.isAuthenticated = false;
      state.doctor = {};
      state.error = action.payload;
    },
    loaddoctorRequest(state, action) {
      state.loading = true;
      state.error = null;
    },
    loaddoctorSuccess(state, action) {
      state.loading = false;
      state.isAuthenticated = true;
      state.doctor = action.payload;
      state.error = null;
    },
    loaddoctorFailed(state, action) {
      state.loading = false;
      state.isAuthenticated = false;
      state.doctor = {};
      state.error = action.payload;
    },
    logoutSuccess(state, action) {
      state.loading = false;
      state.isAuthenticated = false;
      state.doctor = {};
      state.error = null;
      state.message = action.payload;
    },
    logoutFailed(state, action) {
      state.loading = false;
      state.isAuthenticated = state.isAuthenticated;
      state.doctor = state.doctor;
      state.error = action.payload;
    },
    updatePasswordRequest(state, action) {
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
    updateProfileRequest(state, action) {
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
    updateProfileResetAfterUpdate(state, action) {
      state.isUpdated = false;
    },
    resetGrampanchayatStatus(state, action) {
      state.isGrampanchayatAdded = false;
    },

    clearAllErrors(state, action) {
      state.error = null;
      state = state.doctor;
    },
    clearAllMessgesOfDoctor(state, action) {
      state.message = null;
      state.error = null;
    },
  },
});

const BASE_URL = import.meta.env.VITE_API_KEY;

export const registerDoctor = (doctorData) => async (dispatch) => {
  dispatch(doctorSlice.actions.registerRequest());
  try {
    const { data } = await axios.post(
      `${BASE_URL}/api/admin/register`,
      doctorData,
      {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    dispatch(doctorSlice.actions.registerSuccess(data.doctor));
    dispatch(doctorSlice.actions.clearAllErrors());
  } catch (error) {
    dispatch(doctorSlice.actions.registerFailed(error.response.data.message));
  }
};

export const login = (adminEmailId, adminPassword) => async (dispatch) => {
  // console.log("DATA", doctorEmailId, "PAss", password);
  dispatch(doctorSlice.actions.loginRequest());
  try {
    const { data } = await axios.post(
      `${BASE_URL}/api/admin/login`,
      { adminEmailId, adminPassword },
      { withCredentials: true, headers: { "Content-Type": "application/json" } }
    );
    dispatch(doctorSlice.actions.loginSuccess(data.existingDoctor));
    dispatch(doctorSlice.actions.clearAllErrors());
  } catch (error) {
    dispatch(doctorSlice.actions.loginFailed(error.response.data.message));
  }
};

export const getdoctor = () => async (dispatch) => {
  dispatch(doctorSlice.actions.loaddoctorRequest());
  try {
    const { data } = await axios.get(`${BASE_URL}/api/admin/get-admin`, {
      withCredentials: true,
    });
    console.log(data);
    dispatch(doctorSlice.actions.loaddoctorSuccess(data.existingDoctor));
    dispatch(doctorSlice.actions.clearAllErrors());
  } catch (error) {
    dispatch(doctorSlice.actions.loaddoctorFailed(error.response.data.message));
  }
};

export const logout = () => async (dispatch) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/api/admin/logout`, {
      withCredentials: true,
    });
    console.log(data, "data in logout page");
    dispatch(doctorSlice.actions.logoutSuccess(data.message));
    dispatch(doctorSlice.actions.clearAllErrors());
  } catch (error) {
    dispatch(doctorSlice.actions.logoutFailed(error.response.data.message));
  }
};

export const updatePassword =
  (currentPassword, newPassword, confirmNewPassword) => async (dispatch) => {
    dispatch(doctorSlice.actions.updatePasswordRequest());
    try {
      const { data } = await axios.put(
        `${BASE_URL}/api/doctor/password/update`,
        { currentPassword, newPassword, confirmNewPassword },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      dispatch(doctorSlice.actions.updatePasswordSuccess(data.message));
      dispatch(doctorSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        doctorSlice.actions.updatePasswordFailed(error.response.data.message)
      );
    }
  };

export const updateProfile = (data) => async (dispatch) => {
  dispatch(doctorSlice.actions.updateProfileRequest());
  try {
    const response = await axios.put(
      `${BASE_URL}/api/doctor/profile-update`,
      data,
      {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    dispatch(doctorSlice.actions.updateProfileSuccess(response.data.message));
    dispatch(doctorSlice.actions.clearAllErrors());
  } catch (error) {
    dispatch(
      doctorSlice.actions.updateProfileFailed(error.response.data.message)
    );
  }
};

export const resetProfile = () => (dispatch) => {
  dispatch(doctorSlice.actions.updateProfileResetAfterUpdate());
};


export const resetGrampanchayatStatus = () => (dispatch) => {
  dispatch(doctorSlice.actions.resetGrampanchayatStatus());
};

export const clearAlldoctorErrors = () => (dispatch) => {
  dispatch(doctorSlice.actions.clearAllErrors());
};

export const clearAlldoctorMessages = () => (dispatch) => {
  dispatch(doctorSlice.actions.clearAllMessgesOfDoctor());
};

export default doctorSlice.reducer;