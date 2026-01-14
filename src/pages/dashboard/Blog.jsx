import React, { useState, useEffect } from "react";
import { FaSearch, FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaCheckCircle, FaExclamationTriangle, FaImage, FaCalendar, FaClock, FaUser } from "react-icons/fa";
import axios from "axios";

const BlogManagement = () => {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    author: "",
    date: "",
    time: "",
    title: "",
    description: "",
    slug: "",
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // ✅ FIXED: API Base URL
  const BASE_URL = import.meta.env.VITE_API_KEY;

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem("adminToken") || localStorage.getItem("token");
  };

  // ✅ FIXED: Convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  // ✅ FIXED: Fetch all blogs - Handle API response structure properly
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      const res = await axios.get(`${BASE_URL}/blogs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log("Blogs fetched:", res.data);
      
      // ✅ FIX: Access the data array from the response structure
      const blogsData = res.data.data || res.data || [];
      setBlogs(blogsData);
      setFilteredBlogs(blogsData);
    } catch (err) {
      console.error("Fetch blogs error:", err);
      setError("Failed to load blogs: " + (err.response?.data?.msg || err.message));
      // ✅ FIX: Set empty arrays on error
      setBlogs([]);
      setFilteredBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Search filter
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredBlogs(blogs);
    } else {
      const filtered = blogs.filter(
        (blog) =>
          blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          blog.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          blog.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBlogs(filtered);
    }
  }, [searchTerm, blogs]);

  // ✅ IMPROVED: Auto-generate slug when title changes
  const handleTitleChange = (e) => {
    const title = e.target.value;
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single
      .replace(/(^-|-$)+/g, ""); // Remove leading/trailing hyphens
    
    setFormData(prev => ({ 
      ...prev, 
      title, 
      slug,
      description: prev.description || "" // Ensure description exists
    }));
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // ✅ IMPROVED: Reset form with default values
  const resetForm = () => {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    
    setFormData({ 
      author: "Admin", // Default author
      date: currentDate, // Today's date
      time: currentTime, // Current time
      title: "", 
      description: "", 
      slug: "", 
      image: null 
    });
    setImagePreview(null);
    setEditingId(null);
    setError("");
    setSuccess("");
    
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  // ✅ FIXED: Validate form data
  const validateForm = () => {
    if (!formData.title?.trim()) {
      setError("Title is required");
      return false;
    }
    if (!formData.description?.trim()) {
      setError("Description is required");
      return false;
    }
    if (!formData.slug?.trim()) {
      setError("Slug is required");
      return false;
    }
    if (!formData.image && !editingId) {
      setError("Image is required for new blogs");
      return false;
    }
    if (!formData.date) {
      setError("Date is required");
      return false;
    }
    if (!formData.time) {
      setError("Time is required");
      return false;
    }
    return true;
  };

  // ✅ FIXED: Create new blog with base64 image
  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setFormLoading(true);

    try {
      const token = getAuthToken();
      if (!token) {
        setError("Please log in to manage blogs");
        return;
      }

      // Validate form before submission
      if (!validateForm()) {
        setFormLoading(false);
        return;
      }

      // Convert image to base64
      let imageBase64 = null;
      if (formData.image) {
        console.log("🔄 Converting image to base64...");
        imageBase64 = await fileToBase64(formData.image);
        console.log("✅ Image converted to base64, length:", imageBase64.length);
      }

      const requestData = {
        author: formData.author,
        date: formData.date,
        time: formData.time,
        title: formData.title.trim(),
        description: formData.description.trim(),
        slug: formData.slug.trim(),
        image: imageBase64
      };

      console.log("📤 Sending blog data:", {
        author: requestData.author,
        title: requestData.title,
        description: requestData.description,
        slug: requestData.slug,
        date: requestData.date,
        time: requestData.time,
        hasImage: !!imageBase64
      });

      const res = await axios.post(`${BASE_URL}/blogs`, requestData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log("✅ Blog created successfully:", res.data);
      setSuccess("Blog created successfully!");
      resetForm();
      fetchBlogs(); // Refresh the list
    } catch (err) {
      console.error("❌ Create blog error:", err);
      const errorMsg = err.response?.data?.message || err.response?.data?.msg || "Failed to create blog";
      setError(`Create failed: ${errorMsg}`);
    } finally {
      setFormLoading(false);
    }
  };

  // ✅ FIXED: Update blog with base64 image
  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setFormLoading(true);

    try {
      const token = getAuthToken();
      if (!token) {
        setError("Please log in to manage blogs");
        return;
      }

      // Validate form before submission
      if (!validateForm()) {
        setFormLoading(false);
        return;
      }

      // Convert image to base64 if new image provided
      let imageBase64 = null;
      if (formData.image) {
        console.log("🔄 Converting image to base64 for update...");
        imageBase64 = await fileToBase64(formData.image);
      }

      const requestData = {
        author: formData.author,
        date: formData.date,
        time: formData.time,
        title: formData.title.trim(),
        description: formData.description.trim(),
        slug: formData.slug.trim(),
      };

      // Only include image if a new one was selected
      if (imageBase64) {
        requestData.image = imageBase64;
      }

      console.log("📤 Updating blog:", editingId);

      const res = await axios.put(`${BASE_URL}/blogs/${editingId}`, requestData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log("✅ Blog updated successfully:", res.data);
      setSuccess("Blog updated successfully!");
      resetForm();
      fetchBlogs(); // Refresh the list
    } catch (err) {
      console.error("❌ Update blog error:", err);
      const errorMsg = err.response?.data?.message || err.response?.data?.msg || "Failed to update blog";
      setError(`Update failed: ${errorMsg}`);
    } finally {
      setFormLoading(false);
    }
  };

  // ✅ FIXED: Delete blog
  const handleDelete = async (id) => {
    try {
      const token = getAuthToken();
      if (!token) {
        setError("Please log in to manage blogs");
        return;
      }

      console.log("Deleting blog:", id);

      await axios.delete(`${BASE_URL}/blogs/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess("Blog deleted successfully!");
      setDeleteConfirm(null);
      fetchBlogs(); // Refresh the list
    } catch (err) {
      console.error("Delete blog error:", err);
      const errorMsg = err.response?.data?.message || err.response?.data?.msg || "Failed to delete blog";
      setError(`Delete failed: ${errorMsg}`);
    }
  };

  // Start editing
  const startEdit = (blog) => {
    setFormData({
      author: blog.author,
      date: blog.date,
      time: blog.time,
      title: blog.title,
      description: blog.description,
      slug: blog.slug,
      image: null
    });
    setImagePreview(blog.image);
    setEditingId(blog._id);
    setError("");
    setSuccess("");
  };

  // Cancel edit
  const cancelEdit = () => {
    resetForm();
  };

  // ✅ IMPROVED: Handle form submit with validation
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (editingId) {
      handleUpdate(e);
    } else {
      handleCreate(e);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading blogs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Blog Management
          </h1>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center gap-2">
            <FaExclamationTriangle />
            <span>{error}</span>
            <button 
              onClick={() => setError("")}
              className="ml-auto text-red-700 hover:text-red-900"
            >
              <FaTimes />
            </button>
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 flex items-center gap-2">
            <FaCheckCircle />
            <span>{success}</span>
            <button 
              onClick={() => setSuccess("")}
              className="ml-auto text-green-700 hover:text-green-900"
            >
              <FaTimes />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingId ? "Edit Blog Post" : "Add New Blog Post"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Author */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Author *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-700 focus:border-transparent"
                    placeholder="Enter author name"
                    required
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={handleTitleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-700 focus:border-transparent"
                  placeholder="Enter blog title"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Description *
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({formData.description.length}/500 characters)
                  </span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-700 focus:border-transparent"
                  rows="4"
                  placeholder="Write your blog description..."
                  maxLength={500}
                  required
                />
                {/* {formData.description.length === 0 && (
                  <p className="text-red-500 text-sm mt-1">Description is required</p>
                )} */}
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Date *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaCalendar className="text-gray-400" />
                    </div>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-700 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Time *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaClock className="text-gray-400" />
                    </div>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-700 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Featured Image {!editingId && "*"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaImage className="text-gray-400" />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-700 focus:border-transparent"
                    required={!editingId}
                  />
                </div>
                {imagePreview && (
                  <div className="mt-3">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="rounded-lg w-full object-cover h-48 border"
                    />
                    <p className="text-sm text-gray-500 mt-1">Image Preview</p>
                  </div>
                )}
              </div>

              {/* Slug (Auto-generated) */}
              {/* <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Slug (Auto-generated)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  readOnly
                  className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                  placeholder="Slug will be generated from title"
                />
                {formData.slug.length === 0 && (
                  <p className="text-red-500 text-sm mt-1">Slug will be generated when you enter a title</p>
                )}
              </div> */}

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
                      {formLoading ? "Updating..." : "Update Blog"}
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
                    {formLoading ? "Creating..." : "Create Blog"}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Right Column - Blog List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                All Blog Posts ({blogs.length})
              </h2>
              
              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search blogs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-700 focus:border-transparent w-64"
                />
              </div>
            </div>

            {/* ✅ FIXED: Blogs List with safety check */}
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {!filteredBlogs || filteredBlogs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    {searchTerm ? "No blogs match your search." : "No blogs available yet."}
                  </p>
                  {!searchTerm && (
                    <p className="text-sm text-gray-400 mt-2">
                      Add your first blog post using the form on the left.
                    </p>
                  )}
                </div>
              ) : (
                // ✅ FIX: Add Array.isArray safety check
                Array.isArray(filteredBlogs) && filteredBlogs.map((blog) => (
                  <div
                    key={blog._id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex gap-4">
                      {/* Blog Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={blog.image}
                          alt={blog.title}
                          className="w-20 h-20 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/80x80?text=No+Image';
                          }}
                        />
                      </div>
                      
                      {/* Blog Content */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                          {blog.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                          {blog.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <FaUser className="text-red-700" />
                            {blog.author || 'Unknown'}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaCalendar className="text-red-700" />
                            {formatDate(blog.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaClock className="text-red-700" />
                            {blog.time || 'No time'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => startEdit(blog)}
                          className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                          title="Edit Blog"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(blog._id)}
                          className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete Blog"
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
                Are you sure you want to delete this blog post? This action cannot be undone.
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

export default BlogManagement;