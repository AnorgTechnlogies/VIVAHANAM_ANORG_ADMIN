import React, { useState } from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import axios from "axios";

const AddBlog = () => {
  const [formData, setFormData] = useState({
    author: "",
    date: "",
    time: "",
    image: "",
    title: "",
    description: "",
    slug: "",
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-generate slug when title changes
  const handleTitleChange = (e) => {
    const title = e.target.value;
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setFormData((prev) => ({ ...prev, title, slug }));
  };

  // Handle image upload to Cloudinary
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    setMessage("Uploading image...");
    setError("");
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", "your_upload_preset"); // <-- Change this
      const res = await fetch("https://api.cloudinary.com/v1_1/your_cloud_name/image/upload", {
        method: "POST",
        body: data,
      });
      const result = await res.json();
      if (result.secure_url) {
        setFormData((prev) => ({ ...prev, image: result.secure_url }));
        setMessage("✅ Image uploaded successfully!");
      } else {
        setError("Failed to upload image.");
      }
    } catch (err) {
      console.error(err);
      setError("Image upload failed!");
    }
  };

  // Submit the form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("/api/blogs", formData);
      if (res.data.success) {
        setMessage("✅ Blog created successfully!");
        setFormData({
          author: "",
          date: "",
          time: "",
          image: "",
          title: "",
          description: "",
          slug: "",
        });
        setImagePreview(null);
      }
    } catch (err) {
      console.error(err);
      setError("❌ Failed to create blog.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 border border-amber-100">
        <h2 className="text-3xl font-bold text-black text-center mb-8">Add New Blog</h2>

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
          {/* Author */}
          <div>
            <label className="block text-black font-semibold mb-2">Author</label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              className="w-full p-3 border border-amber-100 rounded-lg focus:ring-2 focus:ring-red-700 focus:border-transparent"
              placeholder="Author name"
              required
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-black font-semibold mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={handleTitleChange}
              className="w-full p-3 border border-amber-100 rounded-lg focus:ring-2 focus:ring-red-700 focus:border-transparent"
              placeholder="Blog title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-black font-semibold mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-3 border border-amber-100 rounded-lg focus:ring-2 focus:ring-red-700 focus:border-transparent"
              rows="4"
              placeholder="Write your blog description..."
              required
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-black font-semibold mb-2">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full p-3 border border-amber-100 rounded-lg focus:ring-2 focus:ring-red-700 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-black font-semibold mb-2">Time</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full p-3 border border-amber-100 rounded-lg focus:ring-2 focus:ring-red-700 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-black font-semibold mb-2">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full p-3 border border-amber-100 rounded-lg focus:ring-2 focus:ring-red-700 focus:border-transparent"
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="mt-3 rounded-lg w-full object-cover h-48 border"
              />
            )}
          </div>

          {/* Slug (Auto) */}
          <div>
            <label className="block text-black font-semibold mb-2">Slug (Auto-generated)</label>
            <input
              type="text"
              value={formData.slug}
              readOnly
              className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-red-700 text-white font-semibold rounded-lg hover:bg-black transition-colors disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Blog"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddBlog;
