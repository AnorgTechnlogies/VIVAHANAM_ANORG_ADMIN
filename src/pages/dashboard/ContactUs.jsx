import React, { useState, useEffect } from "react";
import { Search, Mail, Phone, MessageSquare, Calendar, Trash2, X, AlertCircle, RefreshCw } from "lucide-react";

const API_BASE = "/api/admin";

const ContactusDetails = () => {
  const [submissions, setSubmissions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchSubmissions = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError("");

      const token = localStorage.getItem("adminToken") || document.cookie
        .split("; ")
        .find(row => row.startsWith("Authorization="))
        ?.split("=")[1]
        ?.replace("Bearer ", "");

      const res = await fetch(`${API_BASE}/contact-submissions`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setSubmissions(data.data);
      setFiltered(data.data);
    } catch (err) {
      setError(err.message || "Failed to load");
    } finally {
      if (!silent) setLoading(false);
      setIsVisible(true);
    }
  };

  const deleteSubmission = async (id) => {
    if (!window.confirm("Delete this submission?")) return;

    try {
      const token = localStorage.getItem("adminToken") || document.cookie
        .split("; ")
        .find(row => row.startsWith("Authorization="))
        ?.split("=")[1]
        ?.replace("Bearer ", "");

      const res = await fetch(`${API_BASE}/contact-submissions/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setSubmissions(prev => prev.filter(s => s._id !== id));
      setFiltered(prev => prev.filter(s => s._id !== id));
      setSelected(null);
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  // Search
  useEffect(() => {
    const term = search.toLowerCase();
    const result = submissions.filter(s =>
      s.name.toLowerCase().includes(term) ||
      s.email.toLowerCase().includes(term) ||
      (s.phone && s.phone.includes(term)) ||
      s.message.toLowerCase().includes(term)
    );
    setFiltered(result);
  }, [search, submissions]);

  // Initial load
  useEffect(() => {
    fetchSubmissions();
  }, []);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSubmissions(true); // silent refresh
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen py-12 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="absolute w-2 h-2 bg-amber-400/20 rounded-full animate-float"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${i * 0.7}s`, animationDuration: `${5 + Math.random() * 4}s` }}
          />
        ))}
      </div>

      <div className="absolute top-20 right-10 w-64 h-64 bg-gradient-to-br from-red-300/20 to-orange-300/20 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-br from-amber-300/20 to-yellow-300/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "1s" }}></div>

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"}`}>
          <div className="inline-flex items-center space-x-3 mb-6">
            <div className="h-1 w-12 bg-gradient-to-r from-amber-500 to-red-600"></div>
            <span className="text-amber-700 text-lg font-semibold tracking-wider uppercase">Admin Panel</span>
            <div className="h-1 w-12 bg-gradient-to-l from-amber-500 to-red-600"></div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-amber-900 mb-4">Contact Submissions</h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">Manage all inquiries received from the contact form.</p>
        </div>

        {/* Search + Refresh */}
        <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search name, email, phone, message..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/70 border-2 border-amber-200 rounded-lg focus:border-amber-500 focus:outline-none transition-colors"
            />
          </div>
          <button
            onClick={() => { setRefreshing(true); fetchSubmissions().finally(() => setRefreshing(false)); }}
            className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
          </div>
        )}

        {error && (
          <div className="max-w-xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Table */}
        {!loading && !error && (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-amber-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-amber-700 to-amber-800 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold hidden md:table-cell">Phone</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Submitted</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-gray-500">
                        {search ? "No matching submissions." : "No submissions yet."}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((s) => (
                      <tr key={s._id} className="hover:bg-amber-50/50 transition-colors cursor-pointer" onClick={() => setSelected(s)}>
                        <td className="px-6 py-4 font-medium text-amber-900">{s.name}</td>
                        <td className="px-6 py-4 text-gray-700">{s.email}</td>
                        <td className="px-6 py-4 text-gray-700 hidden md:table-cell">{s.phone || "—"}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{new Date(s.submittedAt).toLocaleString()}</td>
                        <td className="px-6 py-4 text-center">
                          <button onClick={(e) => { e.stopPropagation(); deleteSubmission(s._id); }} className="text-red-600 hover:text-red-800 transition-colors" title="Delete">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-amber-900 mb-6">Submission Details</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3"><Mail className="w-5 h-5 text-amber-600" /><div><p className="text-sm text-gray-500">Email</p><p className="font-medium">{selected.email}</p></div></div>
              <div className="flex items-center gap-3"><Phone className="w-5 h-5 text-amber-600" /><div><p className="text-sm text-gray-500">Phone</p><p className="font-medium">{selected.phone || "—"}</p></div></div>
              <div className="flex items-start gap-3"><MessageSquare className="w-5 h-5 text-amber-600 mt-0.5" /><div><p className="text-sm text-gray-500">Message</p><p className="font-medium whitespace-pre-wrap">{selected.message}</p></div></div>
              <div className="flex items-center gap-3"><Calendar className="w-5 h-5 text-amber-600" /><div><p className="text-sm text-gray-500">Submitted At</p><p className="font-medium">{new Date(selected.submittedAt).toLocaleString()}</p></div></div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setSelected(null)} className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">Close</button>
              <button onClick={() => deleteSubmission(selected._id)} className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Delete</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes float { 0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; } 50% { transform: translateY(-40px) translateX(30px); opacity: 0.6; } }
        @keyframes pulse-slow { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .animate-float { animation: float linear infinite; }
        .animate-pulse-slow { animation: pulse-slow 6s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default ContactusDetails;