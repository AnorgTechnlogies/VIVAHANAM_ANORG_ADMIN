import React, { useState } from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import axios from "axios";

const AddFaq = () => {
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("/api/faqs", formData);
      if (res.data.success) {
        setMessage("✅ FAQ added successfully!");
        setFormData({ question: "", answer: "" });
      }
    } catch (err) {
      console.error(err);
      setError("❌ Failed to add FAQ. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 border border-amber-100">
        <h2 className="text-3xl font-bold text-black text-center mb-8">Add New FAQ</h2>

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
          {/* Question */}
          <div>
            <label className="block text-black font-semibold mb-2">Question</label>
            <input
              type="text"
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              className="w-full p-3 border border-amber-100 rounded-lg focus:ring-2 focus:ring-red-700 focus:border-transparent"
              placeholder="Enter the question"
              required
            />
          </div>

          {/* Answer */}
          <div>
            <label className="block text-black font-semibold mb-2">Answer</label>
            <textarea
              value={formData.answer}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              className="w-full p-3 border border-amber-100 rounded-lg focus:ring-2 focus:ring-red-700 focus:border-transparent"
              rows="4"
              placeholder="Enter the answer"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-red-700 text-white font-semibold rounded-lg hover:bg-black transition-colors disabled:opacity-50"
          >
            {loading ? "Creating..." : "Add FAQ"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddFaq;
