// MatchmakingPlans.jsx
import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff, Save, X } from "lucide-react";


const BASE_URL = import.meta.env.VITE_API_KEY;


const MatchmakingPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    planCode: "",
    planName: "",
    planDisplayName: "",
    tagline: "",
    description: "",
    price: "",
    currency: "USD",
    profiles: "",
    users: "1",
    validityDays: "",
    validityUnit: "days",
    features: [],
    popular: false,
    bestValue: false,
    isActive: true,
    order: 0,
  });
  const [newFeature, setNewFeature] = useState("");

  const getToken = () => {
    return (
      localStorage.getItem("adminToken") ||
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("Authorization="))
        ?.split("=")[1]
        ?.replace("Bearer ", "")
    );
  };

const fetchPlans = async () => {
  try {
    setLoading(true);
    setError("");
    const token = getToken();

    // DEBUG: Add these console logs
    console.log('🔍 BASE_URL:', BASE_URL);
    console.log('🔍 Full URL:', `${BASE_URL}/matchmaking-plans`);
    console.log('🔍 Token:', token ? 'Present' : 'Missing');

    const res = await fetch(`${BASE_URL}/matchmaking-plans`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('🔍 Response status:', res.status); // Add this

    const data = await res.json();
    if (!data.success) throw new Error(data.message);

    setPlans(data.data || []);
  } catch (err) {
    console.error('❌ Fetch plans error:', err);
    setError(err.message || "Failed to load plans");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setSuccess("");
      const token = getToken();

      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        profiles: parseInt(formData.profiles),
        profilesAllocated: parseInt(formData.profiles),
        users: parseInt(formData.users),
        validityDays: parseInt(formData.validityDays),
        order: parseInt(formData.order) || 0,
        plan_features: formData.features,
      };

      const url = editingPlan
        ? `${BASE_URL}/matchmaking-plans/${editingPlan._id}`
        : `${BASE_URL}/matchmaking-plans`;
      const method = editingPlan ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setSuccess(
        editingPlan
          ? "Plan updated successfully"
          : "Plan created successfully"
      );
      setShowForm(false);
      setEditingPlan(null);
      resetForm();
      fetchPlans();
    } catch (err) {
      setError(err.message || "Failed to save plan");
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      planCode: plan.planCode || "",
      planName: plan.planName || "",
      planDisplayName: plan.planDisplayName || "",
      tagline: plan.tagline || "",
      description: plan.description || "",
      price: plan.price?.toString() || "",
      currency: plan.currency || "USD",
      profiles: plan.profiles?.toString() || plan.profilesAllocated?.toString() || "",
      users: plan.users?.toString() || "1",
      validityDays: plan.validityDays?.toString() || "",
      validityUnit: plan.validityUnit || "days",
      features: plan.features || plan.plan_features || [],
      popular: plan.popular || false,
      bestValue: plan.bestValue || false,
      isActive: plan.isActive !== false,
      order: plan.order || 0,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this plan?")) return;

    try {
      const token = getToken();
      const res = await fetch(`${BASE_URL}/matchmaking-plans/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setSuccess("Plan deleted successfully");
      fetchPlans();
    } catch (err) {
      setError(err.message || "Failed to delete plan");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const token = getToken();
      const res = await fetch(`${BASE_URL}/matchmaking-plans/${id}/toggle-status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setSuccess("Plan status updated");
      fetchPlans();
    } catch (err) {
      setError(err.message || "Failed to update status");
    }
  };

  const resetForm = () => {
    setFormData({
      planCode: "",
      planName: "",
      planDisplayName: "",
      tagline: "",
      description: "",
      price: "",
      currency: "USD",
      profiles: "",
      users: "1",
      validityDays: "",
      validityUnit: "days",
      features: [],
      popular: false,
      bestValue: false,
      isActive: true,
      order: 0,
    });
    setNewFeature("");
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()],
      });
      setNewFeature("");
    }
  };

  const removeFeature = (index) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Matchmaking Plans Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage credit plans for matchmaking feature
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setEditingPlan(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            Add New Plan
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingPlan ? "Edit Plan" : "Create New Plan"}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingPlan(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Plan Code *
                    </label>
                    <input
                      type="text"
                      value={formData.planCode}
                      onChange={(e) =>
                        setFormData({ ...formData, planCode: e.target.value.toUpperCase() })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                      placeholder="e.g., STANDARD"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Plan Name *
                    </label>
                    <input
                      type="text"
                      value={formData.planName}
                      onChange={(e) =>
                        setFormData({ ...formData, planName: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={formData.planDisplayName}
                    onChange={(e) =>
                      setFormData({ ...formData, planDisplayName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) =>
                      setFormData({ ...formData, tagline: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Currency
                    </label>
                    <select
                      value={formData.currency}
                      onChange={(e) =>
                        setFormData({ ...formData, currency: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="USD">USD</option>
                      <option value="INR">INR</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Profiles *
                    </label>
                    <input
                      type="number"
                      value={formData.profiles}
                      onChange={(e) =>
                        setFormData({ ...formData, profiles: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Users
                    </label>
                    <input
                      type="number"
                      value={formData.users}
                      onChange={(e) =>
                        setFormData({ ...formData, users: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Validity Days *
                    </label>
                    <input
                      type="number"
                      value={formData.validityDays}
                      onChange={(e) =>
                        setFormData({ ...formData, validityDays: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Order
                    </label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) =>
                        setFormData({ ...formData, order: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Features
                  </label>
                  <div className="space-y-2 mb-2">
                    {formData.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                      >
                        <span className="flex-1">{feature}</span>
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addFeature();
                        }
                      }}
                      placeholder="Add feature..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={addFeature}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.popular}
                      onChange={(e) =>
                        setFormData({ ...formData, popular: e.target.checked })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">Popular</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.bestValue}
                      onChange={(e) =>
                        setFormData({ ...formData, bestValue: e.target.checked })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">Best Value</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <Save className="w-4 h-4 inline mr-2" />
                    {editingPlan ? "Update Plan" : "Create Plan"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingPlan(null);
                      resetForm();
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Plans List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Plan Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Profiles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Validity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {plans.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      No plans found. Create your first plan!
                    </td>
                  </tr>
                ) : (
                  plans.map((plan) => (
                    <tr key={plan._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {plan.planCode}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {plan.planDisplayName || plan.planName}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {plan.currency} {plan.price}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {plan.profiles || plan.profilesAllocated}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {plan.validityDays} days
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            plan.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {plan.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleToggleStatus(plan._id)}
                            className="p-2 text-gray-600 hover:text-blue-600 transition"
                            title={plan.isActive ? "Deactivate" : "Activate"}
                          >
                            {plan.isActive ? (
                              <Eye className="w-4 h-4" />
                            ) : (
                              <EyeOff className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleEdit(plan)}
                            className="p-2 text-gray-600 hover:text-blue-600 transition"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(plan._id)}
                            className="p-2 text-gray-600 hover:text-red-600 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchmakingPlans;

