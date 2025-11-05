// slices/planSlice.js
import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const planSlice = createSlice({
  name: "plan",
  initialState: {
    loading: false,
    plans: {
      monthly: [],
      yearly: [],
    },
    plan: null,
    error: null,
    message: null,
    isCreated: false,
    isUpdated: false,
    isDeleted: false,
    success: false,
  },
  reducers: {
    getPlansRequest(state, action) {
      state.loading = true;
      state.error = null;
    },
    getPlansSuccess(state, action) {
      state.loading = false;
      state.plans = action.payload;
      state.error = null;
    },
    getPlansFailed(state, action) {
      state.loading = false;
      state.plans = { monthly: [], yearly: [] };
      state.error = action.payload;
    },
    createPlanRequest(state, action) {
      state.loading = true;
      state.isCreated = false;
      state.error = null;
    },
    createPlanSuccess(state, action) {
      state.loading = false;
      state.isCreated = true;
      state.plan = action.payload;
      state.message = "Plan created successfully";
      state.error = null;
      state.success = true;
    },
    createPlanFailed(state, action) {
      state.loading = false;
      state.isCreated = false;
      state.error = action.payload;
      state.success = false;
    },
    updatePlanRequest(state, action) {
      state.loading = true;
      state.isUpdated = false;
      state.error = null;
    },
    updatePlanSuccess(state, action) {
      state.loading = false;
      state.isUpdated = true;
      state.plan = action.payload;
      state.message = "Plan updated successfully";
      state.error = null;
      state.success = true;
    },
    updatePlanFailed(state, action) {
      state.loading = false;
      state.isUpdated = false;
      state.error = action.payload;
      state.success = false;
    },
    deletePlanRequest(state, action) {
      state.loading = true;
      state.isDeleted = false;
      state.error = null;
    },
    deletePlanSuccess(state, action) {
      state.loading = false;
      state.isDeleted = true;
      state.message = "Plan deleted successfully";
      state.error = null;
      state.success = true;
    },
    deletePlanFailed(state, action) {
      state.loading = false;
      state.isDeleted = false;
      state.error = action.payload;
      state.success = false;
    },
    clearPlanErrors(state, action) {
      state.error = null;
    },
    clearPlanMessages(state, action) {
      state.message = null;
      state.error = null;
    },
    resetPlanStatus(state, action) {
      state.isCreated = false;
      state.isUpdated = false;
      state.isDeleted = false;
      state.success = false;
      state.message = null;
    },
  },
});

const BASE_URL = import.meta.env.VITE_API_KEY;

export const getPlans = () => async (dispatch) => {
  dispatch(planSlice.actions.getPlansRequest());
  try {
    const { data } = await axios.get(`${BASE_URL}/api/user/getPlans`, {
      withCredentials: true,
    });
    dispatch(planSlice.actions.getPlansSuccess(data));
    dispatch(planSlice.actions.clearPlanErrors());
  } catch (error) {
    dispatch(planSlice.actions.getPlansFailed(error.response?.data?.message || "Error fetching plans"));
  }
};

export const createPlan = (planData) => async (dispatch) => {
  dispatch(planSlice.actions.createPlanRequest());
  try {
    const { data } = await axios.post(`${BASE_URL}/api/user/createPlan`, planData, {
      withCredentials: true,
      headers: { "Content-Type": "application/json" },
    });
    dispatch(planSlice.actions.createPlanSuccess(data.result));
    dispatch(planSlice.actions.clearPlanErrors());
    dispatch(getPlans()); // Refetch plans after creation
  } catch (error) {
    dispatch(planSlice.actions.createPlanFailed(error.response?.data?.message || "Error creating plan"));
  }
};

export const updatePlan = (id, planData) => async (dispatch) => {
  dispatch(planSlice.actions.updatePlanRequest());
  try {
    const { data } = await axios.put(`${BASE_URL}/api/user/updatePlan/${id}`, planData, {
      withCredentials: true,
      headers: { "Content-Type": "application/json" },
    });
    dispatch(planSlice.actions.updatePlanSuccess(data.plan));
    dispatch(planSlice.actions.clearPlanErrors());
    dispatch(getPlans()); // Refetch plans after update
  } catch (error) {
    dispatch(planSlice.actions.updatePlanFailed(error.response?.data?.message || "Error updating plan"));
  }
};

export const deletePlan = (id) => async (dispatch) => {
  dispatch(planSlice.actions.deletePlanRequest());
  try {
    const { data } = await axios.delete(`${BASE_URL}/api/user/deletePlan/${id}`, {
      withCredentials: true,
    });
    dispatch(planSlice.actions.deletePlanSuccess());
    dispatch(planSlice.actions.clearPlanErrors());
    dispatch(getPlans()); // Refetch plans after deletion
  } catch (error) {
    dispatch(planSlice.actions.deletePlanFailed(error.response?.data?.message || "Error deleting plan"));
  }
};

export const clearPlanErrors = () => (dispatch) => {
  dispatch(planSlice.actions.clearPlanErrors());
};

export const clearPlanMessages = () => (dispatch) => {
  dispatch(planSlice.actions.clearPlanMessages());
};

export const resetPlanStatus = () => (dispatch) => {
  dispatch(planSlice.actions.resetPlanStatus());
};

export default planSlice.reducer;