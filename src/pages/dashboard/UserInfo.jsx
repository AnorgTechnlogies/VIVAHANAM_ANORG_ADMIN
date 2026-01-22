import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { 
  Search, Users, ChevronLeft, ChevronRight, Eye, Filter, X, 
  AlertCircle, RefreshCw, Trash2, CheckCircle 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BASE_URL = '/api/admin';

const AdminUsersDashboard = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [limit] = useState(10);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filters, setFilters] = useState({
    gender: '',
    religion: '',
    maritalStatus: '',
    userType: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const navigate = useNavigate();
  const { isAuthenticated, token } = useSelector((state) => state.admin);

  // Simple notification system
  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 4000);
  };

  // Simple confirmation dialog
  const ConfirmDialog = ({ isOpen, onConfirm, onCancel, user }) => {
    if (!isOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Confirm Delete</h3>
          </div>
          
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete user: <strong>{user?.name}</strong> ({user?.vivId})?<br/>
            This action cannot be undone!
          </p>
          
          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    user: null
  });

  const fetchUsers = async (page = 1, search = '', silent = false) => {
    try {
      if (!silent) setLoading(true);
      
      const authToken = token || localStorage.getItem('adminToken');

      if (!isAuthenticated || !authToken) {
        showNotification('error', 'Please log in to view users.');
        navigate('/admin/login', { replace: true });
        return;
      }

      const queryParams = new URLSearchParams({
        page,
        limit,
        search: encodeURIComponent(search),
      });

      const fetchUrl = `/api/admin/users?${queryParams.toString()}`;

      const res = await fetch(fetchUrl, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken.trim()}`,
        },
        credentials: 'include',
      });

      if (res.status === 403 || res.status === 401) {
        localStorage.removeItem('adminToken');
        showNotification('error', 'Session expired. Please log in again.');
        navigate('/admin/login', { replace: true });
        return;
      }

      const data = await res.json();

      if (!data.success) {
        showNotification('error', data.message || 'Failed to fetch users');
        return;
      }

      setUsers(data.data.users || []);
      setFilteredUsers(data.data.users || []);
      setTotalPages(data.data.pagination.totalPages || 1);
      setTotalUsers(data.data.pagination.total || 0);
      setCurrentPage(data.data.pagination.page || 1);

    } catch (err) {
      showNotification('error', 'Failed to load users');
    } finally {
      if (!silent) setLoading(false);
      setIsVisible(true);
    }
  };

  const deleteUser = async (id) => {
    try {
      const authToken = token || localStorage.getItem('adminToken');
      
      if (!authToken) {
        showNotification('error', 'Please log in to perform this action.');
        navigate('/admin/login');
        return;
      }

      const deleteUrl = `/api/admin/user/${id}`;
      const res = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken.trim()}`,
        },
        credentials: 'include',
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('adminToken');
        showNotification('error', 'Session expired. Please log in again.');
        navigate('/admin/login');
        return;
      }

      const data = await res.json();

      if (!data.success) {
        showNotification('error', data.message || 'Delete failed');
        return;
      }

      // Update UI
      setUsers(prev => prev.filter(user => user._id !== id));
      setFilteredUsers(prev => prev.filter(user => user._id !== id));
      
      if (selectedUser && selectedUser._id === id) {
        setSelectedUser(null);
      }
      
      setTotalUsers(prev => prev - 1);
      
      // Show success notification
      showNotification('success', `User ${data.data?.deletedUserVivId || 'deleted'} removed successfully`);

    } catch (err) {
      showNotification('error', 'Network error');
    }
  };

  const handleDeleteClick = (user) => {
    setConfirmDialog({
      isOpen: true,
      user
    });
  };

  const handleConfirmDelete = () => {
    if (confirmDialog.user) {
      deleteUser(confirmDialog.user._id);
    }
    setConfirmDialog({ isOpen: false, user: null });
  };

  const handleCancelDelete = () => {
    setConfirmDialog({ isOpen: false, user: null });
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers(currentPage, searchTerm);
    } else {
      showNotification('error', 'Please log in to view users.');
      navigate('/admin/login');
    }
  }, [currentPage, isAuthenticated]);

  useEffect(() => {
    const filtered = users.filter((user) => {
      if (filters.gender && user.gender !== filters.gender) return false;
      if (filters.religion && user.religion !== filters.religion) return false;
      if (filters.maritalStatus && user.maritalStatus !== filters.maritalStatus) return false;
      if (filters.userType && user.userType !== filters.userType) return false;
      return true;
    });
    setFilteredUsers(filtered);
  }, [filters, users]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers(1, searchTerm);
  };

  const UserDetailModal = ({ user, onClose }) => {
    if (!user) return null;

    const modalRef = useRef();

    useEffect(() => {
      modalRef.current?.focus();
    }, []);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <div
          ref={modalRef}
          tabIndex={-1}
          onKeyDown={handleKeyDown}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 relative max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold text-amber-900 mb-6">User Details - {user.vivId}</h2>
          <div className="space-y-6">
            {user.profileImage && (
              <div className="flex justify-center">
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-amber-600"
                />
              </div>
            )}
            <Section title="Basic Information">
              <InfoRow label="VIV ID" value={user.vivId} />
              <InfoRow label="Name" value={user.name} />
              <InfoRow label="Email" value={user.email} />
              <InfoRow label="Mobile" value={user.mobileNo || 'N/A'} />
              <InfoRow label="Gender" value={user.gender || 'N/A'} />
              <InfoRow
                label="Date of Birth"
                value={user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'N/A'}
              />
              <InfoRow label="User Type" value={user.userType || 'N/A'} />
              <InfoRow label="Verified" value={user.isVerified ? '✅ Yes' : '❌ No'} />
              <InfoRow label="Profile Completed" value={user.profileCompleted ? '✅ Yes' : '❌ No'} />
            </Section>
            {/* ... (rest of the sections - keep as is) ... */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
              >
                Close
              </button>
              <button
                onClick={() => handleDeleteClick(user)}
                className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen py-8 md:py-16 lg:py-3 px-4 sm:px-6 lg:px-8 overflow-hidden">
      
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border transform transition-all duration-300 max-w-md ${
          notification.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-3">
            {notification.type === 'success' ? 
              <CheckCircle className="w-5 h-5" /> : 
              <AlertCircle className="w-5 h-5" />
            }
            <span className="font-medium">{notification.message}</span>
            <button
              onClick={() => setNotification({ show: false, type: '', message: '' })}
              className="ml-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      
      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        user={confirmDialog.user}
      />

      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-amber-400/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${5 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>
      <div className="absolute top-20 right-10 w-64 h-64 bg-gradient-to-br from-red-300/20 to-orange-300/20 rounded-full blur-3xl animate-pulse-slow"></div>
      <div
        className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-br from-amber-300/20 to-yellow-300/20 rounded-full blur-3xl animate-pulse-slow"
        style={{ animationDelay: '1s' }}
      ></div>

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className={`text-center mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
          <div className="inline-flex items-center space-x-3 ">
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-amber-900 mb-4">User Management</h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">Manage all registered users. Total Users: {totalUsers}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or VIV ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-3 bg-white/70 border-2 border-amber-200 rounded-lg focus:border-amber-500 focus:outline-none transition-colors"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
          >
            Search
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
          >
            <Filter size={20} />
            Filters
          </button>
          <button
            onClick={() => {
              setRefreshing(true);
              fetchUsers(currentPage, searchTerm).finally(() => setRefreshing(false));
            }}
            className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {showFilters && (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-amber-200 p-6 mb-6 grid grid-cols-1 sm:grid-cols-5 gap-4">
            <select
              value={filters.gender}
              onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
              className="border-2 border-amber-200 rounded-lg px-4 py-2 focus:border-amber-500 focus:outline-none"
            >
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
      
            <select
              value={filters.userType}
              onChange={(e) => setFilters({ ...filters, userType: e.target.value })}
              className="border-2 border-amber-200 rounded-lg px-4 py-2 focus:border-amber-500 focus:outline-none"
            >
              <option value="">All User Types</option>
              <option value="Self">Self</option>
              <option value="Parent">Parent</option>
              <option value="Sibling">Sibling</option>
              <option value="Relative">Relative</option>
            </select>
            <button
              onClick={() => setFilters({ gender: '', religion: '', maritalStatus: '', userType: '' })}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Reset Filters
            </button>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
          </div>
        )}

        {!loading && (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-amber-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-amber-700 to-amber-800 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">VIV ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold hidden md:table-cell">Gender</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold hidden md:table-cell">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Verified</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-gray-500">
                        {searchTerm ? 'No matching users.' : 'No users found.'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr
                        key={user._id}
                        className="hover:bg-amber-50/50 transition-colors cursor-pointer"
                        onClick={() => setSelectedUser(user)}
                      >
                        <td className="px-6 py-4 font-medium text-amber-900">{user.vivId}</td>
                        <td className="px-6 py-4 text-gray-700">
                          <div className="flex items-center gap-3">
                            {user.profileImage && (
                              <img
                                src={user.profileImage}
                                alt={user.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            )}
                            <span>{user.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-700">{user.email}</td>
                        <td className="px-6 py-4 text-gray-700 hidden md:table-cell">{user.gender || '—'}</td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                              user.profileCompleted
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {user.profileCompleted ? 'Complete' : 'Incomplete'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                              user.isVerified ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {user.isVerified ? '✓ Verified' : '✗ Not Verified'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedUser(user);
                              }}
                              className="text-amber-600 hover:text-amber-800 transition-colors p-2 rounded-lg hover:bg-amber-50"
                              title="View Details"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(user);
                              }}
                              className="text-red-600 hover:text-red-800 transition-colors p-2 rounded-lg hover:bg-red-50"
                              title="Delete User"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {filteredUsers.length > 0 && (
              <div className="bg-gray-50 px-6 py-4 border-t flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalUsers)} of{' '}
                  {totalUsers} users
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <ChevronLeft size={18} />
                    Previous
                  </button>
                  <span className="px-4 py-2 bg-amber-600 text-white rounded-lg">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    Next
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedUser && <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
    </div>
  );
};

const Section = ({ title, children }) => (
  <div className="border-t pt-4">
    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
      <div className="w-1 h-6 bg-amber-600 rounded"></div>
      {title}
    </h3>
    <div className="grid grid-cols-2 gap-4">{children}</div>
  </div>
);

const InfoRow = ({ label, value }) => (
  <div>
    <p className="text-sm text-gray-500 mb-1">{label}</p>
    <p className="text-gray-900 font-medium">{value || 'N/A'}</p>
  </div>
);

export default AdminUsersDashboard;