import React, { useState, useEffect } from "react";
import { FaSearch, FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import axios from "axios";

const FaqManagement = () => {
  const [faqs, setFaqs] = useState([]);
  const [filteredFaqs, setFilteredFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const BASE_URL = import.meta.env.VITE_API_KEY;

  
  // Form states
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem("adminToken") || localStorage.getItem("token");
  };

  // Fetch all FAQs
  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/faqs/public`);
      setFaqs(res.data.data || []);
      setFilteredFaqs(res.data.data || []);
    } catch (err) {
      console.error("Fetch FAQs error:", err);
      setError("Failed to load FAQs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  // Search filter
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredFaqs(faqs);
    } else {
      const filtered = faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFaqs(filtered);
    }
  }, [searchTerm, faqs]);

  // Reset form
  const resetForm = () => {
    setFormData({ question: "", answer: "" });
    setEditingId(null);
    setError("");
    setSuccess("");
  };

  // Create new FAQ
  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setFormLoading(true);

    try {
      const token = getAuthToken();
      if (!token) {
        setError("Please log in to manage FAQs");
        return;
      }

      const res = await axios.post(`${BASE_URL}/faqs`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.data.success) {
        setSuccess("FAQ created successfully!");
        resetForm();
        fetchFaqs(); // Refresh the list
      }
    } catch (err) {
      console.error("Create FAQ error:", err);
      setError(err.response?.data?.message || "Failed to create FAQ");
    } finally {
      setFormLoading(false);
    }
  };

  // Update FAQ
  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setFormLoading(true);

    try {
      const token = getAuthToken();
      if (!token) {
        setError("Please log in to manage FAQs");
        return;
      }

      const res = await axios.put(`${BASE_URL}/faqs/${editingId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.data.success) {
        setSuccess("FAQ updated successfully!");
        resetForm();
        fetchFaqs(); // Refresh the list
      }
    } catch (err) {
      console.error("Update FAQ error:", err);
      setError(err.response?.data?.message || "Failed to update FAQ");
    } finally {
      setFormLoading(false);
    }
  };

  // Delete FAQ
  const handleDelete = async (id) => {
    try {
      const token = getAuthToken();
      if (!token) {
        setError("Please log in to manage FAQs");
        return;
      }

      await axios.delete(`${BASE_URL}/faqs/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess("FAQ deleted successfully!");
      setDeleteConfirm(null);
      fetchFaqs(); // Refresh the list
    } catch (err) {
      console.error("Delete FAQ error:", err);
      setError(err.response?.data?.message || "Failed to delete FAQ");
    }
  };

  // Start editing
  const startEdit = (faq) => {
    setFormData({
      question: faq.question,
      answer: faq.answer,
    });
    setEditingId(faq._id);
    setError("");
    setSuccess("");
  };

  // Cancel edit
  const cancelEdit = () => {
    resetForm();
  };

  // Handle form submit
  const handleSubmit = (e) => {
    if (editingId) {
      handleUpdate(e);
    } else {
      handleCreate(e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading FAQs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            FAQ Management
          </h1>
          <p className="text-lg text-gray-600">
            Create, edit, and manage frequently asked questions
          </p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center gap-2">
            <FaExclamationTriangle />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 flex items-center gap-2">
            <FaCheckCircle />
            <span>{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingId ? "Edit FAQ" : "Add New FAQ"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Question */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Question *
                </label>
                <input
                  type="text"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-700 focus:border-transparent"
                  placeholder="Enter the question"
                  required
                />
              </div>

              {/* Answer */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Answer *
                </label>
                <textarea
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-700 focus:border-transparent"
                  rows="6"
                  placeholder="Enter the answer"
                  required
                />
              </div>

              {/* Form Actions */}
              <div className="flex gap-3">
                {editingId ? (
                  <>
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <FaSave />
                      {formLoading ? "Updating..." : "Update FAQ"}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-6 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors flex items-center gap-2"
                    >
                      <FaTimes />
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 bg-red-700 text-white py-3 rounded-lg hover:bg-black transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <FaPlus />
                    {formLoading ? "Creating..." : "Add FAQ"}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Right Column - FAQ List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                All FAQs ({faqs.length})
              </h2>
              
              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search FAQs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-700 focus:border-transparent w-64"
                />
              </div>
            </div>

            {/* FAQs List */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {filteredFaqs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    {searchTerm ? "No FAQs match your search." : "No FAQs available yet."}
                  </p>
                  {!searchTerm && (
                    <p className="text-sm text-gray-400 mt-2">
                      Add your first FAQ using the form on the left.
                    </p>
                  )}
                </div>
              ) : (
                filteredFaqs.map((faq) => (
                  <div
                    key={faq._id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          Q: {faq.question}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          <strong>A:</strong> {faq.answer}
                        </p>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => startEdit(faq)}
                          className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                          title="Edit FAQ"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(faq._id)}
                          className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete FAQ"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this FAQ? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FaqManagement;