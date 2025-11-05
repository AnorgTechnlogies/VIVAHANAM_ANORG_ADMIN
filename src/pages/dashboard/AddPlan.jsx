// AddPlan.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createPlan, resetPlanStatus } from "../../store/slices/planSlice";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const AddPlan = () => {
  const [formData, setFormData] = useState({
    name: "",
    billingCycle: "monthly",
    price: "",
    description: "",
    features: [{ text: "", included: true }],
    highlight: false,
    icon: "",
  });
  const [newFeatureText, setNewFeatureText] = useState("");
  const [newFeatureIncluded, setNewFeatureIncluded] = useState(true);

  const dispatch = useDispatch();
  const { loading, isCreated, message, error, success } = useSelector(
    (state) => state.plan
  );

  useEffect(() => {
    if (success && isCreated) {
      setFormData({
        name: "",
        billingCycle: "monthly",
        price: "",
        description: "",
        features: [{ text: "", included: true }],
        highlight: false,
        icon: "",
      });
      setNewFeatureText("");
      dispatch(resetPlanStatus());
    }
  }, [success, isCreated, dispatch]);

  const addFeature = () => {
    if (newFeatureText.trim()) {
      setFormData((prev) => ({
        ...prev,
        features: [
          ...prev.features,
          { text: newFeatureText.trim(), included: newFeatureIncluded },
        ],
      }));
      setNewFeatureText("");
    }
  };

  const removeFeature = (index) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.features.some((f) => !f.text.trim())) {
      alert("Please fill all feature texts");
      return;
    }
    dispatch(createPlan(formData));
  };

  const handleFeatureKeyPress = (e) => {
    if (e.key === "Enter") {
      addFeature();
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 border border-amber-100">
        <h2 className="text-3xl font-bold text-black text-center mb-8">
          Add New Plan
        </h2>

        {error && (
          <div className="bg-red-700 text-white p-4 rounded-lg mb-6 flex items-center justify-between">
            <span>{error}</span>
            <FaTimesCircle className="ml-2" />
          </div>
        )}

        {message && (
          <div className="bg-amber-100 text-black p-4 rounded-lg mb-6 flex items-center justify-between">
            <span>{message}</span>
            <FaCheckCircle className="ml-2 text-green-600" />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-black font-semibold mb-2">Plan Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 border border-amber-100 rounded-lg focus:ring-2 focus:ring-red-700 focus:border-transparent"
              placeholder="e.g., Silver"
              required
            />
          </div>

          <div>
            <label className="block text-black font-semibold mb-2">Billing Cycle</label>
            <select
              value={formData.billingCycle}
              onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
              className="w-full p-3 border border-amber-100 rounded-lg focus:ring-2 focus:ring-red-700 focus:border-transparent"
              required
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div>
            <label className="block text-black font-semibold mb-2">Price</label>
            <input
              type="text"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full p-3 border border-amber-100 rounded-lg focus:ring-2 focus:ring-red-700 focus:border-transparent"
              placeholder="e.g., $25"
              required
            />
          </div>

          <div>
            <label className="block text-black font-semibold mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-3 border border-amber-100 rounded-lg focus:ring-2 focus:ring-red-700 focus:border-transparent"
              rows="3"
              placeholder="Plan description..."
              required
            />
          </div>

          <div>
            <label className="block text-black font-semibold mb-2">Features</label>
            <div className="space-y-2">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-amber-100 rounded-lg">
                  <input
                    type="text"
                    value={feature.text}
                    onChange={(e) => {
                      const updatedFeatures = [...formData.features];
                      updatedFeatures[index].text = e.target.value;
                      setFormData({ ...formData, features: updatedFeatures });
                    }}
                    className="flex-1 p-2 border border-amber-100 rounded focus:ring-2 focus:ring-red-700"
                    placeholder="Feature text"
                  />
                  <label className="ml-2 flex items-center">
                    <input
                      type="checkbox"
                      checked={feature.included}
                      onChange={(e) => {
                        const updatedFeatures = [...formData.features];
                        updatedFeatures[index].included = e.target.checked;
                        setFormData({ ...formData, features: updatedFeatures });
                      }}
                      className="mr-1"
                    />
                    <span className="text-black text-sm">Included</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="ml-2 text-red-700 hover:text-black"
                  >
                    <FaTimesCircle />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex mt-4">
              <input
                type="text"
                value={newFeatureText}
                onChange={(e) => setNewFeatureText(e.target.value)}
                onKeyPress={handleFeatureKeyPress}
                className="flex-1 p-2 border border-amber-100 rounded-l focus:ring-2 focus:ring-red-700"
                placeholder="Add new feature text"
              />
              <label className="flex items-center p-2 border border-amber-100 rounded-r bg-amber-100">
                <input
                  type="checkbox"
                  checked={newFeatureIncluded}
                  onChange={(e) => setNewFeatureIncluded(e.target.checked)}
                  className="mr-1"
                />
                <span className="text-black text-sm">Included</span>
              </label>
              <button
                type="button"
                onClick={addFeature}
                className="ml-2 px-4 py-2 bg-red-700 text-white rounded hover:bg-black"
              >
                Add
              </button>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="highlight"
              checked={formData.highlight}
              onChange={(e) => setFormData({ ...formData, highlight: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="highlight" className="text-black font-semibold">
              Highlight Plan
            </label>
          </div>

          <div>
            <label className="block text-black font-semibold mb-2">Icon Identifier</label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="w-full p-3 border border-amber-100 rounded-lg focus:ring-2 focus:ring-red-700 focus:border-transparent"
              placeholder="e.g., FaRocket"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-red-700 text-white font-semibold rounded-lg hover:bg-black transition-colors disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Plan"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddPlan;