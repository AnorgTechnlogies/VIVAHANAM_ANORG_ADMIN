// src/pages/dashboard/TestimonialAdmin.jsx
import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Typography,
  Button,
  Chip,
  Avatar,
  Tooltip,
  Alert,
  IconButton,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
} from "@material-tailwind/react";
import {
  CheckCircleIcon,
  ClockIcon,
  TrashIcon,
  StarIcon,
  ArrowPathIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const TABLE_HEAD = [
  "Couple",
  "Wedding Date",
  "Rating",
  "Message Preview",
  "Submitted",
  "Status",
  "Actions",
];

const safeText = (value, fallback = "—") => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed && trimmed.length < 300 && !trimmed.includes("cloudinary")) {
      return trimmed;
    }
  }
  return fallback;
};

export default function TestimonialAdmin() {
  const [testimonials, setTestimonials] = useState([]);
  const [filteredTestimonials, setFilteredTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const BASE_URL = import.meta.env.VITE_API_KEY;

  const navigate = useNavigate();

  // Helper function to get auth token
  const getAuthToken = () => {
    return localStorage.getItem("adminToken") || localStorage.getItem("token");
  };

  // Helper function to handle auth errors
  const handleAuthError = () => {
    toast.error("Session expired. Please log in again.");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("token");
    setTimeout(() => {
      navigate("/auth/sign-in");
    }, 1500);
  };

  // Fetch all testimonials
  const fetchTestimonials = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError("");

    try {
      const token = getAuthToken();

      if (!token) {
        setError("Please log in to access this page");
        toast.error("Authentication required");
        handleAuthError();
        return;
      }

      const res = await axios.get(`${BASE_URL}/testimonials/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      setTestimonials(data);
      setFilteredTestimonials(data);

      if (!silent) {
        console.log("✅ Testimonials loaded:", data.length);
      }
    } catch (err) {
      console.error("❌ Fetch Error:", err.response || err);

      if (err.response?.status === 401) {
        setError("Unauthorized. Please log in again.");
        handleAuthError();
      } else {
        const msg = err.response?.data?.message || "Failed to load testimonials";
        setError(msg);
        toast.error(msg);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  // Filter testimonials based on search and status
  useEffect(() => {
    let filtered = testimonials;

    if (statusFilter === "pending") {
      filtered = filtered.filter((t) => !t.isActive);
    } else if (statusFilter === "approved") {
      filtered = filtered.filter((t) => t.isActive);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name?.toLowerCase().includes(query) ||
          t.message?.toLowerCase().includes(query) ||
          t.weddingDate?.toLowerCase().includes(query)
      );
    }

    setFilteredTestimonials(filtered);
  }, [searchQuery, statusFilter, testimonials]);

  // Approve testimonial
  const handleApprove = async (id, e) => {
    if (e) e.stopPropagation();

    const already = testimonials.find((t) => t._id === id)?.isActive;
    if (already) {
      toast.warn("This testimonial is already approved");
      return;
    }

    try {
      const token = getAuthToken();

      if (!token) {
        handleAuthError();
        return;
      }

      const res = await axios.patch(
        `${BASE_URL}/testimonials/approve/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        setTestimonials((prev) =>
          prev.map((t) => (t._id === id ? { ...t, isActive: true } : t))
        );
        toast.success("✅ Testimonial approved successfully!");
        console.log("✅ Approved:", res.data.data);
      }
    } catch (err) {
      console.error("❌ Approve Error:", err.response || err);

      if (err.response?.status === 401) {
        handleAuthError();
      } else {
        toast.error(err.response?.data?.message || "Failed to approve testimonial");
      }
    }
  };

  // Delete testimonial
  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();

    const testimonial = testimonials.find((t) => t._id === id);
    const name = safeText(testimonial?.name, "this testimonial");

    if (!window.confirm(`Delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = getAuthToken();

      if (!token) {
        handleAuthError();
        return;
      }

      await axios.delete(`${BASE_URL}/testimonials/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      setTestimonials((prev) => prev.filter((t) => t._id !== id));
      toast.success("🗑️ Testimonial deleted successfully!");
      console.log("✅ Deleted testimonial ID:", id);
    } catch (err) {
      console.error("❌ Delete Error:", err.response || err);

      if (err.response?.status === 401) {
        handleAuthError();
      } else {
        toast.error(err.response?.data?.message || "Failed to delete testimonial");
      }
    }
  };

  // Handle row click to open modal
  const handleRowClick = (t) => {
    setSelectedTestimonial(t);
    setOpenModal(true);
  };

  // Render status chip
  const statusChip = (active) =>
    active ? (
      <Chip
        variant="gradient"
        color="green"
        size="sm"
        value="Approved"
        icon={<CheckCircleIcon className="h-4 w-4" />}
        className="w-fit"
      />
    ) : (
      <Chip
        variant="gradient"
        color="amber"
        size="sm"
        value="Pending"
        icon={<ClockIcon className="h-4 w-4" />}
        className="w-fit"
      />
    );

  // Render star rating
  const renderStars = (rating) => {
    const r = Number(rating) || 0;
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <StarIcon
            key={i}
            className={`h-5 w-5 ${i < r ? "text-amber-500" : "text-gray-300"}`}
          />
        ))}
      </div>
    );
  };

  // Stats card component
  const StatsCard = ({ title, value, color, icon: Icon }) => (
    <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <CardBody className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <Typography variant="small" className="font-normal text-gray-600">
              {title}
            </Typography>
            <Typography variant="h4" color={color} className="mt-1">
              {value}
            </Typography>
          </div>
          <div className={`p-3 rounded-lg bg-${color}-50`}>
            <Icon className={`h-6 w-6 text-${color}-500`} />
          </div>
        </div>
      </CardBody>
    </Card>
  );

  // Render modal
  const renderModal = () => {
    if (!selectedTestimonial) return null;

    const t = selectedTestimonial;
    const isPending = !t.isActive;

    return (
      <Dialog open={openModal} handler={() => setOpenModal(false)} size="md">
        <DialogHeader className="flex items-center justify-between border-b border-gray-200 pb-4">
          <Typography variant="h5" color="blue-gray">
            Testimonial Details
          </Typography>
          <IconButton
            variant="text"
            size="sm"
            onClick={() => setOpenModal(false)}
          >
            <XMarkIcon className="h-5 w-5" />
          </IconButton>
        </DialogHeader>

        <DialogBody className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Couple Info */}
          <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-rose-50 to-amber-50 rounded-lg">
            <Avatar
              src={t.image?.url || "/img/avatar.png"}
              alt={safeText(t.name)}
              size="xl"
              className="ring-4 ring-white shadow-lg"
            />
            <div className="flex-1">
              <Typography variant="h6" color="blue-gray" className="mb-1">
                {safeText(t.name, "Anonymous Couple")}
              </Typography>
              {t.submittedBy && t.submittedBy !== "Guest" && (
                <Typography variant="small" color="gray" className="mb-2">
                  Submitted by: {safeText(t.submittedBy, "Guest")}
                </Typography>
              )}
              {statusChip(t.isActive)}
            </div>
          </div>

          {/* Wedding Date & Submitted Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <Typography
                variant="small"
                className="font-semibold text-blue-gray-700 mb-1"
              >
                Wedding Date
              </Typography>
              <Typography variant="small" color="blue-gray">
                {safeText(t.weddingDate, "—")}
              </Typography>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <Typography
                variant="small"
                className="font-semibold text-blue-gray-700 mb-1"
              >
                Submitted On
              </Typography>
              <Typography variant="small" color="blue-gray">
                {new Date(t.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Typography>
            </div>
          </div>

          {/* Rating */}
          <div className="p-4 bg-amber-50 rounded-lg">
            <Typography
              variant="small"
              className="font-semibold text-blue-gray-700 mb-2"
            >
              Rating
            </Typography>
            {renderStars(t.rating)}
          </div>

          {/* Message */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <Typography
              variant="small"
              className="font-semibold text-blue-gray-700 mb-2"
            >
              Message
            </Typography>
            <div className="max-h-48 overflow-y-auto pr-2">
              <Typography
                variant="small"
                color="blue-gray"
                className="whitespace-pre-wrap break-words leading-relaxed"
              >
                {t.message || "—"}
              </Typography>
            </div>
          </div>
        </DialogBody>

        <DialogFooter className="border-t border-gray-200 pt-4 space-x-2">
          {isPending && (
            <Button
              color="green"
              onClick={() => {
                handleApprove(t._id);
                setOpenModal(false);
              }}
              className="flex items-center gap-2"
            >
              <CheckCircleIcon className="h-4 w-4" />
              Approve
            </Button>
          )}
          <Button
            variant="outlined"
            color="blue-gray"
            onClick={() => setOpenModal(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </Dialog>
    );
  };

  // Calculate stats
  const totalCount = testimonials.length;
  const pendingCount = testimonials.filter((t) => !t.isActive).length;
  const approvedCount = testimonials.filter((t) => t.isActive).length;

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardBody>
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <ArrowPathIcon className="h-12 w-12 animate-spin text-amber-500 mx-auto mb-4" />
                <Typography variant="h6" color="gray">
                  Loading testimonials...
                </Typography>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardBody className="flex flex-col items-center justify-center space-y-4 py-20">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mb-2" />
          <Alert color="red" className="max-w-md">
            {error}
          </Alert>
          <Button onClick={() => fetchTestimonials()} color="amber">
            <ArrowPathIcon className="h-4 w-4 mr-2 inline" />
            Try Again
          </Button>
        </CardBody>
      </Card>
    );
  }

  // Main render
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Total Testimonials"
          value={totalCount}
          color="blue"
          icon={StarIcon}
        />
        <StatsCard
          title="Pending Review"
          value={pendingCount}
          color="amber"
          icon={ClockIcon}
        />
        <StatsCard
          title="Approved"
          value={approvedCount}
          color="green"
          icon={CheckCircleIcon}
        />
      </div>

      {/* Main Table Card */}
      <Card className="w-full">
        <CardHeader
          floated={false}
          shadow={false}
          className="rounded-none bg-gradient-to-r from-rose-50 to-amber-50"
        >
          <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
            <div>
              <Typography variant="h5" color="blue-gray">
                Manage Testimonials
              </Typography>
              <Typography color="gray" className="mt-1 font-normal">
                Review, approve, or delete customer testimonials
              </Typography>
            </div>

            <Button
              size="sm"
              color="amber"
              onClick={() => fetchTestimonials(true)}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <ArrowPathIcon
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                label="Search testimonials..."
                icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant={statusFilter === "all" ? "filled" : "outlined"}
                color="blue-gray"
                onClick={() => setStatusFilter("all")}
              >
                All ({totalCount})
              </Button>
              <Button
                size="sm"
                variant={statusFilter === "pending" ? "filled" : "outlined"}
                color="amber"
                onClick={() => setStatusFilter("pending")}
              >
                Pending ({pendingCount})
              </Button>
              <Button
                size="sm"
                variant={statusFilter === "approved" ? "filled" : "outlined"}
                color="green"
                onClick={() => setStatusFilter("approved")}
              >
                Approved ({approvedCount})
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardBody className="overflow-x-auto px-0">
          <table className="w-full min-w-max table-auto text-left">
            <thead>
              <tr>
                {TABLE_HEAD.map((head) => (
                  <th
                    key={head}
                    className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4"
                  >
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-bold leading-none"
                    >
                      {head}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredTestimonials.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <StarIcon className="h-16 w-16 text-gray-300 mb-4" />
                      <Typography variant="h6" color="gray">
                        No testimonials found
                      </Typography>
                      <Typography variant="small" color="gray" className="mt-2">
                        {searchQuery || statusFilter !== "all"
                          ? "Try adjusting your filters"
                          : "Testimonials will appear here once submitted"}
                      </Typography>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTestimonials.map((t, index) => {
                  const isPending = !t.isActive;
                  const isLast = index === filteredTestimonials.length - 1;
                  const classes = isLast
                    ? "p-4"
                    : "p-4 border-b border-blue-gray-50";

                  return (
                    <tr
                      key={t._id}
                      className="hover:bg-blue-gray-50/50 cursor-pointer transition-colors"
                      onClick={() => handleRowClick(t)}
                    >
                      {/* Couple */}
                      <td className={classes}>
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={t.image?.url || "/img/avatar.png"}
                            alt={safeText(t.name)}
                            size="md"
                            className="ring-2 ring-rose-100"
                          />
                          <div>
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-semibold"
                            >
                              {safeText(t.name, "Anonymous Couple")}
                            </Typography>
                            {t.submittedBy && t.submittedBy !== "Guest" && (
                              <Typography
                                variant="small"
                                color="gray"
                                className="text-xs"
                              >
                                by {safeText(t.submittedBy, "Guest")}
                              </Typography>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Wedding Date */}
                      <td className={classes}>
                        <Typography variant="small" color="blue-gray">
                          {safeText(t.weddingDate, "—")}
                        </Typography>
                      </td>

                      {/* Rating */}
                      <td className={classes}>{renderStars(t.rating)}</td>

                      {/* Message Preview */}
                      <td className={classes}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="max-w-xs truncate"
                          title={t.message}
                        >
                          {safeText(t.message, "—")}
                        </Typography>
                      </td>

                      {/* Submitted Date */}
                      <td className={classes}>
                        <Typography variant="small" color="blue-gray">
                          {new Date(t.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </Typography>
                      </td>

                      {/* Status */}
                      <td className={classes}>{statusChip(t.isActive)}</td>

                      {/* Actions */}
                      <td
                        className={classes}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-2">
                          {isPending && (
                            <>
                              <Tooltip content="Approve">
                                <IconButton
                                  size="sm"
                                  variant="gradient"
                                  color="green"
                                  onClick={(e) => handleApprove(t._id, e)}
                                >
                                  <CheckCircleIcon className="h-4 w-4" />
                                </IconButton>
                              </Tooltip>

                              <Tooltip content="Reject & Delete">
                                <IconButton
                                  size="sm"
                                  variant="gradient"
                                  color="red"
                                  onClick={(e) => handleDelete(t._id, e)}
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}

                          {!isPending && (
                            <Tooltip content="Delete">
                              <IconButton
                                size="sm"
                                variant="outlined"
                                color="red"
                                onClick={(e) => handleDelete(t._id, e)}
                              >
                                <TrashIcon className="h-4 w-4" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>

      {/* Modal */}
      {renderModal()}
    </div>
  );
}