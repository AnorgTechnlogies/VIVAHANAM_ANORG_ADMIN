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
  Spinner,
  IconButton,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import {
  CheckCircleIcon,
  ClockIcon,
  TrashIcon,
  StarIcon,
  ArrowPathIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import axios from "axios";
import { toast } from "react-toastify";

const TABLE_HEAD = [
  "Couple Name",
  "Wedding Date",
  "Rating",
  "Message",
  "Submitted",
  "Status",
  "Actions",
];

/* -------------------------------------------------
   SAFE TEXT – never throws
   ------------------------------------------------- */
const safeText = (value, fallback = "—") => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed && trimmed.length < 300 && !trimmed.includes("cloudinary")) {
      return trimmed;
    }
  }
  return fallback;
};

/* -------------------------------------------------
   MAIN COMPONENT
   ------------------------------------------------- */
export default function TestimonialAdmin() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const API_URL = import.meta.env.VITE_API_KEY;

  /* -------------------------------------------------
     FETCH ALL
     ------------------------------------------------- */
  const fetchTestimonials = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError("");

    try {
      const res = await axios.get(
        `${API_URL}/api/testimonials/getAllTestimonialsAdmin`,
        { withCredentials: true }
      );

      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      setTestimonials(data);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load testimonials";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  /* -------------------------------------------------
     APPROVE
     ------------------------------------------------- */
  const handleApprove = async (id, e) => {
    if (e) e.stopPropagation();
    const already = testimonials.find((t) => t._id === id)?.isActive;
    if (already) {
      toast.warn("Already approved");
      return;
    }

    try {
      const res = await axios.patch(
        `${API_URL}/api/testimonials/approve/${id}`,
        {},
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
      );

      if (res.data.success) {
        setTestimonials((prev) =>
          prev.map((t) => (t._id === id ? { ...t, isActive: true } : t))
        );
        toast.success("Approved");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Approve failed");
    }
  };

  /* -------------------------------------------------
     DELETE (works for pending & approved)
     ------------------------------------------------- */
  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    const testimonial = testimonials.find((t) => t._id === id);
    const name = safeText(testimonial?.name, "this testimonial");

    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;

    try {
      await axios.delete(`${API_URL}/api/testimonials/deleteTestimonial/${id}`, {
        withCredentials: true,
      });

      setTestimonials((prev) => prev.filter((t) => t._id !== id));
      toast.success("Deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  /* -------------------------------------------------
     HANDLE ROW CLICK
     ------------------------------------------------- */
  const handleRowClick = (t) => {
    setSelectedTestimonial(t);
    setOpenModal(true);
  };

  /* -------------------------------------------------
     UI HELPERS
     ------------------------------------------------- */
  const statusChip = (active) =>
    active ? (
      <Chip
        variant="ghost"
        color="green"
        size="sm"
        value="Approved"
        icon={<CheckCircleIcon className="h-4 w-4" />}
      />
    ) : (
      <Chip
        variant="ghost"
        color="amber"
        size="sm"
        value="Pending"
        icon={<ClockIcon className="h-4 w-4" />}
      />
    );

  const renderStars = (rating) => {
    const r = Number(rating) || 0;
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <StarIcon
            key={i}
            className={`h-5 w-5 ${i < r ? "text-amber-500" : "text-gray-300"}`}
          />
        ))}
      </div>
    );
  };

  /* -------------------------------------------------
     SKELETON ROW
     ------------------------------------------------- */
  const SkeletonRow = () => (
    <tr>
      {TABLE_HEAD.map((_, i) => (
        <td key={i} className="p-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
        </td>
      ))}
    </tr>
  );

  /* -------------------------------------------------
     MODAL RENDER
     ------------------------------------------------- */
  const renderModal = () => {
    if (!selectedTestimonial) return null;

    const t = selectedTestimonial;
    const isPending = !t.isActive;

    return (
      <Dialog open={openModal} handler={() => setOpenModal(false)} size="sm">
        <DialogHeader className="flex flex-row items-center justify-between">
          <Typography variant="h6" color="blue-gray">
            Testimonial Details
          </Typography>
          <IconButton
            variant="text"
            size="sm"
            onClick={() => setOpenModal(false)}
            className="-mt-1"
          >
            <XMarkIcon className="h-4 w-4" />
          </IconButton>
        </DialogHeader>
        <DialogBody className="p-4 space-y-4 max-h-[60vh] overflow-y-auto overflow-x-hidden">
          <div className="flex items-center gap-3 mb-4">
            <Avatar
              src={t.image?.url || "/img/avatar.png"}
              alt={safeText(t.name)}
              size="lg"
              className="ring-2 ring-rose-100"
            />
            <div>
              <Typography variant="h6" color="blue-gray" className="font-medium">
                {safeText(t.name, "Anonymous Couple")}
              </Typography>
              {t.submittedBy && t.submittedBy !== "Guest" && (
                <Typography variant="small" color="gray">
                  Submitted by {safeText(t.submittedBy, "Guest")}
                </Typography>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Typography variant="small" color="blue-gray" className="font-medium">
              Wedding Date:
            </Typography>
            <Typography variant="small" color="gray">
              {safeText(t.weddingDate, "—")}
            </Typography>
          </div>

          <div className="space-y-2">
            <Typography variant="small" color="blue-gray" className="font-medium">
              Rating:
            </Typography>
            <div>{renderStars(t.rating)}</div>
          </div>

          <div className="space-y-2">
            <Typography variant="small" color="blue-gray" className="font-medium">
              Message:
            </Typography>
            <div className="bg-blue-gray-50 p-3 rounded-md max-h-40 overflow-y-auto overflow-x-hidden">
              <Typography 
                variant="small" 
                color="blue-gray"
                className="whitespace-pre-wrap break-words"
              >
                {t.message || "—"}
              </Typography>
            </div>
          </div>

          <div className="space-y-2">
            <Typography variant="small" color="blue-gray" className="font-medium">
              Submitted:
            </Typography>
            <Typography variant="small" color="gray">
              {new Date(t.createdAt).toLocaleDateString()}
            </Typography>
          </div>

          <div className="space-y-2">
            <Typography variant="small" color="blue-gray" className="font-medium">
              Status:
            </Typography>
            {statusChip(t.isActive)}
          </div>
        </DialogBody>
        <DialogFooter className="justify-end space-x-2">
          <Button
            variant="outlined"
            color="blue-gray"
            onClick={() => setOpenModal(false)}
            size="sm"
          >
            Close
          </Button>
        </DialogFooter>
      </Dialog>
    );
  };

  /* -------------------------------------------------
     RENDER
     ------------------------------------------------- */
  if (loading) {
    return (
      <Card className="h-full">
        <CardBody>
          <table className="w-full table-auto">
            <thead>
              <tr>
                {TABLE_HEAD.map((head) => (
                  <th key={head} className="p-4 text-left">
                    <Typography variant="small" className="font-normal opacity-70">
                      {head}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3].map((i) => (
                <SkeletonRow key={i} />
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardBody className="flex flex-col items-center justify-center space-y-4">
          <Alert color="red" className="max-w-md">
            {error}
          </Alert>
          <Button onClick={() => fetchTestimonials()} color="amber">
            Try Again
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="h-full w-full">
      {/* <CardHeader floated={false} shadow={false} className="rounded-none">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <Typography variant="h5" color="blue-gray">
              Manage Testimonials
            </Typography>
            <Typography color="gray" className="mt-1 font-normal">
              Review, approve, or delete user submissions
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
      </CardHeader> */}

      <CardBody className="px-0">
        <table className="w-full min-w-max table-auto text-left">
          <thead>
            <tr>
              {TABLE_HEAD.map((head) => (
                <th
                  key={head}
                  className="border-y border-blue-gray-100 bg-blue-gray-50 p-4"
                >
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal leading-none opacity-70"
                  >
                    {head}
                  </Typography>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {testimonials.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">
                  No testimonials yet.
                </td>
              </tr>
            ) : (
              testimonials.map((t) => {
                const isPending = !t.isActive;

                return (
                  <tr
                    key={t._id}
                    className="even:bg-blue-gray-50/50 hover:bg-blue-gray-50 cursor-pointer"
                    onClick={() => handleRowClick(t)}
                  >
                    {/* Couple */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={t.image?.url || "/img/avatar.png"}
                          alt={safeText(t.name)}
                          size="sm"
                          className="ring-2 ring-rose-100"
                        />
                        <div>
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-medium"
                          >
                            {safeText(t.name, "Anonymous Couple")}
                          </Typography>
                          {t.submittedBy && t.submittedBy !== "Guest" && (
                            <Typography
                              variant="small"
                              color="gray"
                              className="opacity-70"
                            >
                              by {safeText(t.submittedBy, "Guest")}
                            </Typography>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Wedding Date */}
                    <td className="p-4">
                      <Typography variant="small" color="blue-gray">
                        {safeText(t.weddingDate, "—")}
                      </Typography>
                    </td>

                    {/* Rating */}
                    <td className="p-4">{renderStars(t.rating)}</td>

                    {/* Message */}
                    <td className="p-4">
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="max-w-xs truncate"
                        title={t.message}
                      >
                        "{safeText(t.message, "—")}"
                      </Typography>
                    </td>

                    {/* Submitted */}
                    <td className="p-4">
                      <Typography variant="small" color="blue-gray">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </Typography>
                    </td>

                    {/* Status */}
                    <td className="p-4">{statusChip(t.isActive)}</td>

                    {/* Actions */}
                    <td
                      className="p-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-2">
                        {isPending && (
                          <>
                            <Tooltip content="Approve">
                              <IconButton
                                size="sm"
                                color="green"
                                onClick={(e) => handleApprove(t._id, e)}
                                className="p-2"
                              >
                                <CheckCircleIcon className="h-4 w-4" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip content="Reject & Delete">
                              <IconButton
                                size="sm"
                                color="red"
                                onClick={(e) => handleDelete(t._id, e)}
                                className="p-2"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}

                        {/* Delete for Approved */}
                        {!isPending && (
                          <Tooltip content="Delete">
                            <IconButton
                              size="sm"
                              color="red"
                              onClick={(e) => handleDelete(t._id, e)}
                              className="p-2"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </IconButton>
                          </Tooltip>
                        )}

                        {!isPending && (
                          <Typography
                            variant="small"
                            color="green"
                            className="text-xs font-medium ml-1"
                          >
                            Approved
                          </Typography>
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

      {renderModal()}
    </Card>
  );
}