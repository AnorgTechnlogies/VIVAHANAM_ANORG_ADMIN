// ContactInfoManagement.jsx
import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Check, X, Phone, Mail, MapPin, Clock, Users, Globe, MessageCircle } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_KEY;


const ContactInfoManagement = () => {
  const [contactInfoList, setContactInfoList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingInfo, setEditingInfo] = useState(null);
  const [actionLoading, setActionLoading] = useState({
    delete: null,
    setActive: null
  });
  const [activeTab, setActiveTab] = useState("basic");
  
  const [formData, setFormData] = useState({
    // Basic Info
    phone: "",
    email: "",
    office: "",
    isActive: true,
    
    // Additional Fields
    additionalPhones: [""],
    additionalEmails: [""],
    
    // Address
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      zipCode: ""
    },
    
    // Working Hours
    workingHours: {
      monday: { open: "09:00", close: "17:00", closed: false },
      tuesday: { open: "09:00", close: "17:00", closed: false },
      wednesday: { open: "09:00", close: "17:00", closed: false },
      thursday: { open: "09:00", close: "17:00", closed: false },
      friday: { open: "09:00", close: "17:00", closed: false },
      saturday: { open: "09:00", close: "17:00", closed: false },
      sunday: { open: "09:00", close: "17:00", closed: false }
    },
    
    // Social Media
    socialMedia: {
      facebook: "",
      twitter: "",
      instagram: "",
      linkedin: "",
      youtube: ""
    },
    
    // Support Details
    supportDetails: {
      supportEmail: "",
      supportPhone: "",
      emergencyContact: "",
      responseTime: "24 hours"
    }
  });

  const getToken = () => {
    return localStorage.getItem("adminToken") || "";
  };

  const fetchContactInfo = async () => {
    try {
      setLoading(true);
      setError("");
      const token = getToken();

      console.log("🔗 Fetching contact info...");
      const res = await fetch(`${BASE_URL}/contact-info`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("📋 API Response:", data);
      
      if (!data.success) {
        throw new Error(data.message || "Failed to fetch contact information");
      }

      let contactData = [];
      if (Array.isArray(data.data)) {
        contactData = data.data;
      } else if (data.data && typeof data.data === 'object') {
        contactData = [data.data];
      }
      
      console.log("📊 Processed Contact Data:", contactData);
      setContactInfoList(contactData);
    } catch (err) {
      console.error("❌ Fetch error:", err);
      setError(err.message || "Failed to load contact information");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setSuccess("");

      const token = getToken();
      if (!token) {
        setError("Authentication token not found. Please log in again.");
        return;
      }

      const url = editingInfo
        ? `${BASE_URL}/contact-info/${editingInfo._id}`
        : `${BASE_URL}/contact-info`;
      const method = editingInfo ? "PUT" : "POST";

      console.log("📤 Submitting form to:", url);
      console.log("📝 Form data:", formData);

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log("✅ Submit response:", data);
      
      if (!data.success) throw new Error(data.message);

      setSuccess(
        editingInfo
          ? "Contact information updated successfully"
          : "Contact information created successfully"
      );
      setShowForm(false);
      setEditingInfo(null);
      resetForm();
      fetchContactInfo();
    } catch (err) {
      console.error("❌ Submit error:", err);
      setError(err.message || "Failed to save contact information");
    }
  };

  const handleEdit = (info) => {
    console.log("✏️ Editing contact info:", info);
    
    setEditingInfo(info);
    
    // Set form data with all fields from the database
    setFormData({
      phone: info.phone || "",
      email: info.email || "",
      office: info.office || "",
      isActive: info.isActive !== false,
      
      additionalPhones: info.additionalPhones || [""],
      additionalEmails: info.additionalEmails || [""],
      
      address: {
        street: info.address?.street || "",
        city: info.address?.city || "",
        state: info.address?.state || "",
        country: info.address?.country || "",
        zipCode: info.address?.zipCode || ""
      },
      
      workingHours: info.workingHours || {
        monday: { open: "09:00", close: "17:00", closed: false },
        tuesday: { open: "09:00", close: "17:00", closed: false },
        wednesday: { open: "09:00", close: "17:00", closed: false },
        thursday: { open: "09:00", close: "17:00", closed: false },
        friday: { open: "09:00", close: "17:00", closed: false },
        saturday: { open: "09:00", close: "17:00", closed: false },
        sunday: { open: "09:00", close: "17:00", closed: false }
      },
      
      socialMedia: info.socialMedia || {
        facebook: "",
        twitter: "",
        instagram: "",
        linkedin: "",
        youtube: ""
      },
      
      supportDetails: info.supportDetails || {
        supportEmail: "",
        supportPhone: "",
        emergencyContact: "",
        responseTime: "24 hours"
      }
    });
    
    setShowForm(true);
    setActiveTab("basic");
  };

  const handleDelete = async (id) => {
    console.log("🗑️ Deleting ID:", id);
    
    if (!window.confirm("Are you sure you want to delete this contact information?")) return;

    try {
      setActionLoading(prev => ({ ...prev, delete: id }));
      const token = getToken();
      
      if (!token) {
        setError("Authentication token not found. Please log in again.");
        return;
      }

      console.log("🔗 Making DELETE request to:", `${BASE_URL}/contact-info/${id}`);
      
      const res = await fetch(`${BASE_URL}/contact-info/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("✅ Delete response:", data);
      
      if (!data.success) throw new Error(data.message);

      setSuccess("Contact information deleted successfully");
      fetchContactInfo();
    } catch (err) {
      console.error("❌ Delete error:", err);
      setError(err.message || "Failed to delete contact information");
    } finally {
      setActionLoading(prev => ({ ...prev, delete: null }));
    }
  };

  const handleSetActive = async (id) => {
    console.log("⭐ Setting active ID:", id);
    
    try {
      setActionLoading(prev => ({ ...prev, setActive: id }));
      const token = getToken();
      
      if (!token) {
        setError("Authentication token not found. Please log in again.");
        return;
      }

      console.log("🔗 Making PATCH request to:", `${BASE_URL}/contact-info/${id}/set-active`);
      
      const res = await fetch(`${BASE_URL}/contact-info/${id}/set-active`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("✅ Set active response:", data);
      
      if (!data.success) throw new Error(data.message);

      setSuccess("Contact information set as active");
      fetchContactInfo();
    } catch (err) {
      console.error("❌ Set active error:", err);
      setError(err.message || "Failed to set active contact information");
    } finally {
      setActionLoading(prev => ({ ...prev, setActive: null }));
    }
  };

  // Helper functions for dynamic arrays
  const addAdditionalPhone = () => {
    setFormData(prev => ({
      ...prev,
      additionalPhones: [...prev.additionalPhones, ""]
    }));
  };

  const removeAdditionalPhone = (index) => {
    setFormData(prev => ({
      ...prev,
      additionalPhones: prev.additionalPhones.filter((_, i) => i !== index)
    }));
  };

  const updateAdditionalPhone = (index, value) => {
    setFormData(prev => ({
      ...prev,
      additionalPhones: prev.additionalPhones.map((phone, i) => 
        i === index ? value : phone
      )
    }));
  };

  const addAdditionalEmail = () => {
    setFormData(prev => ({
      ...prev,
      additionalEmails: [...prev.additionalEmails, ""]
    }));
  };

  const removeAdditionalEmail = (index) => {
    setFormData(prev => ({
      ...prev,
      additionalEmails: prev.additionalEmails.filter((_, i) => i !== index)
    }));
  };

  const updateAdditionalEmail = (index, value) => {
    setFormData(prev => ({
      ...prev,
      additionalEmails: prev.additionalEmails.map((email, i) => 
        i === index ? value : email
      )
    }));
  };

  const resetForm = () => {
    setFormData({
      phone: "",
      email: "",
      office: "",
      isActive: true,
      additionalPhones: [""],
      additionalEmails: [""],
      address: {
        street: "",
        city: "",
        state: "",
        country: "",
        zipCode: ""
      },
      workingHours: {
        monday: { open: "09:00", close: "17:00", closed: false },
        tuesday: { open: "09:00", close: "17:00", closed: false },
        wednesday: { open: "09:00", close: "17:00", closed: false },
        thursday: { open: "09:00", close: "17:00", closed: false },
        friday: { open: "09:00", close: "17:00", closed: false },
        saturday: { open: "09:00", close: "17:00", closed: false },
        sunday: { open: "09:00", close: "17:00", closed: false }
      },
      socialMedia: {
        facebook: "",
        twitter: "",
        instagram: "",
        linkedin: "",
        youtube: ""
      },
      supportDetails: {
        supportEmail: "",
        supportPhone: "",
        emergencyContact: "",
        responseTime: "24 hours"
      }
    });
    setActiveTab("basic");
  };

  const TabButton = ({ tab, icon: Icon, children }) => (
    <button
      type="button"
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
        activeTab === tab
          ? "bg-blue-600 text-white"
          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
      }`}
    >
      <Icon className="w-4 h-4" />
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Contact Information Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage contact details displayed on the contact page
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setEditingInfo(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            Add New Contact Info
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
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingInfo ? "Edit Contact Information" : "Create Contact Information"}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingInfo(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Tabs */}
              <div className="border-b">
                <div className="flex gap-2 p-4">
                  <TabButton tab="basic" icon={Phone}>Basic Info</TabButton>
                  {/* <TabButton tab="additional" icon={Users}>Additional Contacts</TabButton> */}
                  {/* <TabButton tab="address" icon={MapPin}>Address</TabButton> */}
                  {/* <TabButton tab="hours" icon={Clock}>Working Hours</TabButton> */}
                  <TabButton tab="social" icon={Globe}>Social Media</TabButton>
                  {/* <TabButton tab="support" icon={MessageCircle}>Support</TabButton> */}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 max-h-[60vh] overflow-y-auto">
                {/* Basic Info Tab */}
                {activeTab === "basic" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Primary Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                          placeholder="+1 888 768 8289"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Primary Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                          placeholder="ourdivinethoughts@gmail.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Office Location *
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={formData.office}
                          onChange={(e) =>
                            setFormData({ ...formData, office: e.target.value })
                          }
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                          placeholder="North America"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) =>
                          setFormData({ ...formData, isActive: e.target.checked })
                        }
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <label htmlFor="isActive" className="text-sm text-gray-700">
                        Set as active (will deactivate others)
                      </label>
                    </div>
                  </div>
                )}

                {/* Additional Contacts Tab */}
                {activeTab === "additional" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Phone Numbers
                      </label>
                      {formData.additionalPhones.map((phone, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <div className="relative flex-1">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              value={phone}
                              onChange={(e) => updateAdditionalPhone(index, e.target.value)}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Additional phone number"
                            />
                          </div>
                          {formData.additionalPhones.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeAdditionalPhone(index)}
                              className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addAdditionalPhone}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                      >
                        <Plus className="w-4 h-4" />
                        Add Phone Number
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Email Addresses
                      </label>
                      {formData.additionalEmails.map((email, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <div className="relative flex-1">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => updateAdditionalEmail(index, e.target.value)}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Additional email address"
                            />
                          </div>
                          {formData.additionalEmails.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeAdditionalEmail(index)}
                              className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addAdditionalEmail}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                      >
                        <Plus className="w-4 h-4" />
                        Add Email Address
                      </button>
                    </div>
                  </div>
                )}

                {/* Address Tab */}
                {activeTab === "address" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Street Address
                        </label>
                        <input
                          type="text"
                          value={formData.address.street}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              address: { ...formData.address, street: e.target.value }
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="123 Main Street"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          value={formData.address.city}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              address: { ...formData.address, city: e.target.value }
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="New York"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State/Province
                        </label>
                        <input
                          type="text"
                          value={formData.address.state}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              address: { ...formData.address, state: e.target.value }
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="NY"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Country
                        </label>
                        <input
                          type="text"
                          value={formData.address.country}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              address: { ...formData.address, country: e.target.value }
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="United States"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP/Postal Code
                      </label>
                      <input
                        type="text"
                        value={formData.address.zipCode}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            address: { ...formData.address, zipCode: e.target.value }
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="10001"
                      />
                    </div>
                  </div>
                )}

                {/* Working Hours Tab - Simplified for now */}
                {activeTab === "hours" && (
                  <div className="space-y-4">
                    <p className="text-gray-600">Working hours configuration coming soon...</p>
                  </div>
                )}

                {/* Social Media Tab */}
                {activeTab === "social" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Facebook
                        </label>
                        <input
                          type="url"
                          value={formData.socialMedia.facebook}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              socialMedia: { ...formData.socialMedia, facebook: e.target.value }
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://facebook.com/username"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Twitter
                        </label>
                        <input
                          type="url"
                          value={formData.socialMedia.twitter}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              socialMedia: { ...formData.socialMedia, twitter: e.target.value }
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://twitter.com/username"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Instagram
                        </label>
                        <input
                          type="url"
                          value={formData.socialMedia.instagram}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              socialMedia: { ...formData.socialMedia, instagram: e.target.value }
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://instagram.com/username"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          LinkedIn
                        </label>
                        <input
                          type="url"
                          value={formData.socialMedia.linkedin}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              socialMedia: { ...formData.socialMedia, linkedin: e.target.value }
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://linkedin.com/company/username"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        YouTube
                      </label>
                      <input
                        type="url"
                        value={formData.socialMedia.youtube}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            socialMedia: { ...formData.socialMedia, youtube: e.target.value }
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://youtube.com/username"
                      />
                    </div>
                  </div>
                )}

                {/* Support Tab */}
                {activeTab === "support" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Support Email
                        </label>
                        <input
                          type="email"
                          value={formData.supportDetails.supportEmail}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              supportDetails: { ...formData.supportDetails, supportEmail: e.target.value }
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="support@company.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Support Phone
                        </label>
                        <input
                          type="text"
                          value={formData.supportDetails.supportPhone}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              supportDetails: { ...formData.supportDetails, supportPhone: e.target.value }
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="+1 800 SUPPORT"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Emergency Contact
                      </label>
                      <input
                        type="text"
                        value={formData.supportDetails.emergencyContact}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            supportDetails: { ...formData.supportDetails, emergencyContact: e.target.value }
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Emergency contact number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Response Time
                      </label>
                      <input
                        type="text"
                        value={formData.supportDetails.responseTime}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            supportDetails: { ...formData.supportDetails, responseTime: e.target.value }
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="24 hours"
                      />
                    </div>
                  </div>
                )}

                {/* Form Actions */}
                <div className="flex gap-3 pt-6 border-t">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <Check className="w-4 h-4 inline mr-2" />
                    {editingInfo ? "Update" : "Create"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingInfo(null);
                      resetForm();
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Contact Info List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-500 mt-2">Loading contact information...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {contactInfoList.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-12 text-center">
                <p className="text-gray-500 text-lg">No contact information found.</p>
                <p className="text-gray-400 mt-2">Create your first contact information to get started.</p>
              </div>
            ) : (
              contactInfoList.map((info) => (
                <div
                  key={info._id}
                  className={`bg-white rounded-xl shadow p-6 transition-all duration-200 ${
                    info.isActive ? "ring-2 ring-green-500 ring-opacity-50" : "hover:shadow-md"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-medium text-gray-900">{info.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium text-gray-900">{info.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-500">Office</p>
                          <p className="font-medium text-gray-900">{info.office}</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <span
                          className={`px-3 py-1 text-xs rounded-full font-medium ${
                            info.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {info.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!info.isActive && (
                        <button
                          onClick={() => handleSetActive(info._id)}
                          disabled={actionLoading.setActive === info._id}
                          className="p-2 text-gray-600 hover:text-green-600 transition disabled:opacity-50 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded"
                          title="Set as Active"
                        >
                          {actionLoading.setActive === info._id ? (
                            <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Check className="w-5 h-5" />
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(info)}
                        className="p-2 text-gray-600 hover:text-blue-600 transition focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(info._id)}
                        disabled={actionLoading.delete === info._id}
                        className="p-2 text-gray-600 hover:text-red-600 transition disabled:opacity-50 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
                        title="Delete"
                      >
                        {actionLoading.delete === info._id ? (
                          <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactInfoManagement;