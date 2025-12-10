import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Search, Users, ChevronLeft, ChevronRight, Eye, Filter, X, AlertCircle, RefreshCw, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../dashboard/UserInfo.css'; // Ensure this file exists in src/pages/dashboard/

const BASE_URL = '/api/user';


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
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, token } = useSelector((state) => state.admin);

  const fetchUsers = async (page = 1, search = '', silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError('');

      // Use Redux token or fall back to localStorage
      const authToken = token || localStorage.getItem('adminToken');
      console.log('Fetch Token:', authToken); // Debug token

      if (!isAuthenticated || !authToken) {
        setError('Please log in to view users.');
        navigate('/admin/login', { replace: true });
        return;
      }

      const queryParams = new URLSearchParams({
        page,
        limit,
        search: encodeURIComponent(search),
      });

      const res = await fetch(`${BASE_URL}/users?${queryParams.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken.trim()}`,
          'client': 'not-browser',
        },
        credentials: 'include',
      });

      if (res.status === 403) {
        localStorage.removeItem('adminToken');
        setError('Session expired. Redirecting to login...');
        navigate('/admin/login', { replace: true });
        return;
      }

      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'Failed to fetch users');
        return;
      }

      setUsers(data.data.users || []);
      setFilteredUsers(data.data.users || []);
      setTotalPages(data.data.pagination.totalPages || 1);
      setTotalUsers(data.data.pagination.total || 0);
      setCurrentPage(data.data.pagination.page || 1);
    } catch (err) {
      setError(err.message || 'Failed to load users');
      console.error('Fetch Users Error:', err);
    } finally {
      if (!silent) setLoading(false);
      setIsVisible(true);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;

    try {
      const authToken = token || localStorage.getItem('adminToken');
      console.log('Delete Token:', authToken); // Debug token

      if (!isAuthenticated || !authToken) {
        setError('Please log in to perform this action.');
        navigate('/admin/login', { replace: true });
        return;
      }

      const res = await fetch(`${BASE_URL}/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken.trim()}`,
          'client': 'not-browser',
        },
        credentials: 'include',
      });

      if (res.status === 403) {
        localStorage.removeItem('adminToken');
        setError('Session expired. Redirecting to login...');
        navigate('/admin/login', { replace: true });
        return;
      }

      const data = await res.json();
      if (!data.success) {
        alert(`Delete failed: ${data.message || 'Unknown error'}`);
        return;
      }

      setUsers((prev) => prev.filter((user) => user._id !== id));
      setFilteredUsers((prev) => prev.filter((user) => user._id !== id));
      setSelectedUser(null);
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
      console.error('Delete User Error:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers(currentPage, searchTerm);
    } else {
      setError('Please log in to view users.');
      navigate('/admin/login', { replace: true });
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
        role="dialog"
        aria-labelledby="user-detail-modal"
        aria-modal="true"
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
            aria-label="Close modal"
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
            <Section title="Personal Details">
              <InfoRow label="Religion" value={user.religion || 'N/A'} />
              <InfoRow label="Mother Tongue" value={user.motherTongue || 'N/A'} />
              <InfoRow label="Marital Status" value={user.maritalStatus || 'N/A'} />
              <InfoRow label="Height" value={user.height || 'N/A'} />
              <InfoRow label="Physical Status" value={user.physicalStatus || 'N/A'} />
              <InfoRow label="Profile Bio" value={user.profileBio || 'N/A'} />
            </Section>
            <Section title="Education & Career">
              <InfoRow label="Education Level" value={user.educationLevel || 'N/A'} />
              <InfoRow label="Field of Study" value={user.fieldOfStudy || 'N/A'} />
              <InfoRow label="Occupation" value={user.occupation || 'N/A'} />
              <InfoRow label="Employer" value={user.employer || 'N/A'} />
              <InfoRow label="Annual Income" value={user.annualIncome || 'N/A'} />
            </Section>
            <Section title="Location Details">
              <InfoRow label="Country" value={user.country || 'N/A'} />
              <InfoRow label="State" value={user.state || 'N/A'} />
              <InfoRow label="District" value={user.district || 'N/A'} />
              <InfoRow label="City" value={user.city || 'N/A'} />
              <InfoRow label="Current City" value={user.currentCity || 'N/A'} />
              <InfoRow label="Native Place" value={user.nativePlace || 'N/A'} />
              <InfoRow label="Street Address" value={user.streetAddress || 'N/A'} />
              <InfoRow label="Address Line 2" value={user.addressLine2 || 'N/A'} />
              <InfoRow label="Zip Code" value={user.zipCode || 'N/A'} />
              <InfoRow label="Citizenship Status" value={user.citizenshipStatus || 'N/A'} />
            </Section>
            <Section title="Astrological Information">
              <InfoRow label="Birth Time" value={user.birthTime || 'N/A'} />
              <InfoRow label="Place of Birth" value={user.placeOfBirth || 'N/A'} />
              <InfoRow label="Zodiac Sign" value={user.zodiacSign || 'N/A'} />
              <InfoRow label="Gotra" value={user.gotra || 'N/A'} />
            </Section>
            <Section title="Family Information">
              <InfoRow label="Family Type" value={user.familyType || 'N/A'} />
              <InfoRow label="Family Status" value={user.familyStatus || 'N/A'} />
              <InfoRow label="Father's Name" value={user.fatherName || 'N/A'} />
              <InfoRow label="Father's Occupation" value={user.fatherOccupation || 'N/A'} />
              <InfoRow label="Father's Status" value={user.fatherStatus || 'N/A'} />
              <InfoRow label="Mother's Name" value={user.motherName || 'N/A'} />
              <InfoRow label="Mother's Occupation" value={user.motherOccupation || 'N/A'} />
              <InfoRow label="Mother's Status" value={user.motherStatus || 'N/A'} />
              <InfoRow label="Number of Brothers" value={user.numBrothers || 'N/A'} />
              <InfoRow label="Number of Sisters" value={user.numSisters || 'N/A'} />
              <InfoRow label="Siblings Marital Status" value={user.siblingsMaritalStatus || 'N/A'} />
              <InfoRow label="About Family" value={user.aboutFamily || 'N/A'} />
              <InfoRow label="Family Background" value={user.familyBackground || 'N/A'} />
            </Section>
            <Section title="Lifestyle">
              <InfoRow label="Hobbies" value={Array.isArray(user.hobbies) ? user.hobbies.join(', ') : 'N/A'} />
              <InfoRow label="Languages" value={Array.isArray(user.languages) ? user.languages.join(', ') : 'N/A'} />
            </Section>
            {user.partnerPreferences && (
              <Section title="Partner Preferences">
                <InfoRow
                  label="Age Range"
                  value={
                    user.partnerPreferences.ageRange
                      ? `${user.partnerPreferences.ageRange.min || 'N/A'} - ${user.partnerPreferences.ageRange.max || 'N/A'}`
                      : 'N/A'
                  }
                />
                <InfoRow
                  label="Preferred Religion"
                  value={
                    Array.isArray(user.partnerPreferences.preferredReligion)
                      ? user.partnerPreferences.preferredReligion.join(', ')
                      : 'N/A'
                  }
                />
                <InfoRow
                  label="Preferred Mother Tongue"
                  value={
                    Array.isArray(user.partnerPreferences.preferredMotherTongue)
                      ? user.partnerPreferences.preferredMotherTongue.join(', ')
                      : 'N/A'
                  }
                />
                <InfoRow
                  label="Preferred Education"
                  value={
                    Array.isArray(user.partnerPreferences.preferredEducation)
                      ? user.partnerPreferences.preferredEducation.join(', ')
                      : 'N/A'
                  }
                />
                <InfoRow
                  label="Preferred Occupation"
                  value={
                    Array.isArray(user.partnerPreferences.preferredOccupation)
                      ? user.partnerPreferences.preferredOccupation.join(', ')
                      : 'N/A'
                  }
                />
                <InfoRow
                  label="Preferred Location"
                  value={
                    Array.isArray(user.partnerPreferences.preferredLocation)
                      ? user.partnerPreferences.preferredLocation.join(', ')
                      : 'N/A'
                  }
                />
                <InfoRow
                  label="Preferred Languages"
                  value={
                    Array.isArray(user.partnerPreferences.preferredLanguages)
                      ? user.partnerPreferences.preferredLanguages.join(', ')
                      : 'N/A'
                  }
                />
                <InfoRow
                  label="Cultural Background"
                  value={
                    Array.isArray(user.partnerPreferences.culturalBackground)
                      ? user.partnerPreferences.culturalBackground.join(', ')
                      : 'N/A'
                  }
                />
                <InfoRow
                  label="Preferred Caste"
                  value={
                    Array.isArray(user.partnerPreferences.preferredCaste)
                      ? user.partnerPreferences.preferredCaste.join(', ')
                      : 'N/A'
                  }
                />
                <InfoRow
                  label="Income Range"
                  value={
                    user.partnerPreferences.incomeRange
                      ? `${user.partnerPreferences.incomeRange.min || 'N/A'} - ${user.partnerPreferences.incomeRange.max || 'N/A'}`
                      : 'N/A'
                  }
                />
                <InfoRow
                  label="Height Range"
                  value={
                    user.partnerPreferences.preferredHeight
                      ? `${user.partnerPreferences.preferredHeight.min || 'N/A'} - ${user.partnerPreferences.preferredHeight.max || 'N/A'}`
                      : 'N/A'
                  }
                />
              </Section>
            )}
            <Section title="Privacy Settings">
              <InfoRow label="Show Email" value={user.showEmail ? '✅ Yes' : '❌ No'} />
              {/* <InfoRow label="Show Mobile" value={user.showMobile ? '✅ Yes' : '❌ No'} /> */}
              <InfoRow label="Profile Visibility" value={user.profileVisibility || 'N/A'} />
              <InfoRow label="Photo Visibility" value={user.photoVisibility || 'N/A'} />
            </Section>
            {user.documents && Array.isArray(user.documents) && user.documents.length > 0 && (
              <Section title="Documents">
                <div className="col-span-2 grid grid-cols-2 gap-4">
                  {user.documents.map((doc, index) => (
                    <a
                      key={index}
                      href={doc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Document {index + 1}
                    </a>
                  ))}
                </div>
              </Section>
            )}
            <Section title="Account Information">
              <InfoRow label="Created At" value={new Date(user.createdAt).toLocaleString()} />
              <InfoRow label="Updated At" value={new Date(user.updatedAt).toLocaleString()} />
            </Section>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
              >
                Close
              </button>
              <button
                onClick={() => deleteUser(user._id)}
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
    <div className="relative min-h-screen py-12 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
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
          <div className="inline-flex items-center space-x-3 mb-6">
            <div className="h-1 w-12 bg-gradient-to-r from-amber-500 to-red-600"></div>
            <span className="text-amber-700 text-lg font-semibold tracking-wider uppercase">Admin Panel</span>
            <div className="h-1 w-12 bg-gradient-to-l from-amber-500 to-red-600"></div>
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
              value={filters.religion}
              onChange={(e) => setFilters({ ...filters, religion: e.target.value })}
              className="border-2 border-amber-200 rounded-lg px-4 py-2 focus:border-amber-500 focus:outline-none"
            >
              <option value="">All Religions</option>
              <option value="Hindu">Hindu</option>
              <option value="Muslim">Muslim</option>
              <option value="Christian">Christian</option>
              <option value="Sikh">Sikh</option>
            </select>
            <select
              value={filters.maritalStatus}
              onChange={(e) => setFilters({ ...filters, maritalStatus: e.target.value })}
              className="border-2 border-amber-200 rounded-lg px-4 py-2 focus:border-amber-500 focus:outline-none"
            >
              <option value="">All Marital Status</option>
              <option value="Never Married">Never Married</option>
              <option value="Divorced">Divorced</option>
              <option value="Widowed">Widowed</option>
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

        {error && (
          <div className="max-w-xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
          </div>
        )}

        {!loading && !error && (
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
                              className="text-amber-600 hover:text-amber-800 transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteUser(user._id);
                              }}
                              className="text-red-600 hover:text-red-800 transition-colors"
                              title="Delete"
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