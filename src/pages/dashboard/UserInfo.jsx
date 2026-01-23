import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { 
  Search, Users, ChevronLeft, ChevronRight, Eye, Filter, X, 
  AlertCircle, RefreshCw, Trash2, CheckCircle, Mail, Phone, MapPin,
  Calendar, User, Briefcase, GraduationCap, Home, Heart, Globe,
  Hash, Scale, Cake, UserCircle, BookOpen, Target, Map, Flag,
  DollarSign, Clock, Shield, Star, CreditCard, FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
      const formData = user.formData || {};
      if (filters.gender && formData.gender !== filters.gender) return false;
      if (filters.religion && formData.religion !== filters.religion) return false;
      if (filters.maritalStatus && formData.maritalStatus !== filters.maritalStatus) return false;
      if (filters.userType && formData.userType !== filters.userType) return false;
      return true;
    });
    setFilteredUsers(filtered);
  }, [filters, users]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers(1, searchTerm);
  };

  // Updated UserDetailModal Component
// Updated UserDetailModal Component
const UserDetailModal = ({ user, onClose }) => {
  if (!user) return null;

  const modalRef = useRef();
  const formData = user.formData || {};

  useEffect(() => {
    modalRef.current?.focus();
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
  };

  // Function to check if field has value
  const hasValue = (value) => {
    return value && value !== 'N/A' && value !== '' && value !== null && value !== undefined && value !== 'Not Filled';
  };

  // Format date properly
  const formatDate = (dateString) => {
    if (!hasValue(dateString)) return 'Not Filled';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Get all actual fields that users can fill (based on your database structure)
  const getAvailableFields = () => {
    const fields = [];
    
    // Basic Information (always available)
    fields.push({ label: 'VIV ID', value: user.vivId, icon: <Hash className="w-4 h-4" /> });
    fields.push({ label: 'Full Name', value: user.name, icon: <User className="w-4 h-4" /> });
    fields.push({ label: 'Email', value: user.email, icon: <Mail className="w-4 h-4" /> });
    
    // Only show fields that exist in formData
    if (hasValue(formData.mobileNo)) fields.push({ label: 'Mobile Number', value: formData.mobileNo, icon: <Phone className="w-4 h-4" /> });
    if (hasValue(formData.gender)) fields.push({ label: 'Gender', value: formData.gender });
    if (hasValue(formData.dateOfBirth)) fields.push({ label: 'Date of Birth', value: formatDate(formData.dateOfBirth), icon: <Calendar className="w-4 h-4" /> });
    if (hasValue(formData.maritalStatus)) fields.push({ label: 'Marital Status', value: formData.maritalStatus, icon: <Heart className="w-4 h-4" /> });
    if (hasValue(formData.religion)) fields.push({ label: 'Religion', value: formData.religion });
    if (hasValue(formData.userType)) fields.push({ label: 'User Type', value: formData.userType });
    
    // Personal Details
    if (hasValue(formData.firstName)) fields.push({ label: 'First Name', value: formData.firstName });
    if (hasValue(formData.middleName)) fields.push({ label: 'Middle Name', value: formData.middleName });
    if (hasValue(formData.lastName)) fields.push({ label: 'Last Name', value: formData.lastName });
    if (hasValue(formData.diet)) fields.push({ label: 'Diet', value: formData.diet });
    if (hasValue(formData.birthTime)) fields.push({ label: 'Birth Time', value: formData.birthTime, icon: <Clock className="w-4 h-4" /> });
    if (hasValue(formData.motherTongue)) fields.push({ label: 'Mother Tongue', value: formData.motherTongue });
    if (hasValue(formData.caste)) fields.push({ label: 'Caste', value: formData.caste });
    if (hasValue(formData.gotra)) fields.push({ label: 'Gotra', value: formData.gotra });
    if (hasValue(formData.zodiacsign)) fields.push({ label: 'Zodiac Sign', value: formData.zodiacsign });
    if (hasValue(formData.indianreligious)) fields.push({ label: 'Indian Religious', value: formData.indianreligious });
    if (hasValue(formData.profilebio)) fields.push({ label: 'Profile Bio', value: formData.profilebio });
    
    // Physical Details
    if (hasValue(formData.height)) fields.push({ label: 'Height', value: formData.height, icon: <Scale className="w-4 h-4" /> });
    if (hasValue(formData.weight)) fields.push({ label: 'Weight', value: formData.weight, icon: <Scale className="w-4 h-4" /> });
    if (hasValue(formData.complextion)) fields.push({ label: 'Complexion', value: formData.complextion });
    if (hasValue(formData.physicalstatus)) fields.push({ label: 'Physical Status', value: formData.physicalstatus });
    
    // Professional Details
    if (hasValue(formData.occupation)) fields.push({ label: 'Occupation', value: formData.occupation, icon: <Briefcase className="w-4 h-4" /> });
    if (hasValue(formData.fieldofstudy)) fields.push({ label: 'Field of Study', value: formData.fieldofstudy });
    if (hasValue(formData.educationlevel)) fields.push({ label: 'Education Level', value: formData.educationlevel, icon: <GraduationCap className="w-4 h-4" /> });
    if (hasValue(formData.employer)) fields.push({ label: 'Employer', value: formData.employer });
    if (hasValue(formData.annualIncome)) fields.push({ label: 'Annual Income', value: formData.annualIncome, icon: <DollarSign className="w-4 h-4" /> });
    
    // Location Details
    if (hasValue(formData.city)) fields.push({ label: 'City', value: formData.city, icon: <MapPin className="w-4 h-4" /> });
    if (hasValue(formData.state)) fields.push({ label: 'State', value: formData.state, icon: <MapPin className="w-4 h-4" /> });
    if (hasValue(formData.country)) fields.push({ label: 'Country', value: formData.country, icon: <Globe className="w-4 h-4" /> });
    if (hasValue(formData.zipcode)) fields.push({ label: 'Zip Code', value: formData.zipcode, icon: <Hash className="w-4 h-4" /> });
    if (hasValue(formData['street address'])) fields.push({ label: 'Street Address', value: formData['street address'] });
    if (hasValue(formData.addressline2)) fields.push({ label: 'Address Line 2', value: formData.addressline2 });
    if (hasValue(formData.nativeplace)) fields.push({ label: 'Native Place', value: formData.nativeplace });
    if (hasValue(formData.placeOfBirth)) fields.push({ label: 'Place of Birth', value: formData.placeOfBirth });
    
    // Account Settings
    if (hasValue(formData.profileVisibility)) fields.push({ label: 'Profile Visibility', value: formData.profileVisibility, icon: <Shield className="w-4 h-4" /> });
    if (hasValue(formData.photoVisibility)) fields.push({ label: 'Photo Visibility', value: formData.photoVisibility, icon: <Shield className="w-4 h-4" /> });
    if (hasValue(formData.citizenshipstatus)) fields.push({ label: 'Citizenship Status', value: formData.citizenshipstatus, icon: <Shield className="w-4 h-4" /> });
    
    // Preferences
    if (hasValue(formData.preferredReligion)) fields.push({ label: 'Preferred Religion', value: formData.preferredReligion, icon: <Target className="w-4 h-4" /> });
    if (hasValue(formData.preferredCaste)) fields.push({ label: 'Preferred Caste', value: formData.preferredCaste, icon: <Target className="w-4 h-4" /> });
    if (hasValue(formData.preferredMotherTongue)) fields.push({ label: 'Preferred Mother Tongue', value: formData.preferredMotherTongue, icon: <Target className="w-4 h-4" /> });
    if (hasValue(formData.preferredEducation)) fields.push({ label: 'Preferred Education', value: formData.preferredEducation, icon: <Target className="w-4 h-4" /> });
    if (hasValue(formData.preferredLocation)) fields.push({ label: 'Preferred Location', value: formData.preferredLocation, icon: <Target className="w-4 h-4" /> });
    if (hasValue(formData.preferredLanguages)) fields.push({ label: 'Preferred Languages', value: formData.preferredLanguages, icon: <Target className="w-4 h-4" /> });
    
    // Additional Information
    if (hasValue(formData.hobbies)) fields.push({ label: 'Hobbies', value: formData.hobbies, icon: <FileText className="w-4 h-4" /> });
    if (hasValue(formData.languages)) fields.push({ label: 'Languages Known', value: formData.languages, icon: <FileText className="w-4 h-4" /> });
    
    // Account & Subscription (from user object, not formData)
    if (hasValue(user.currentPlan)) fields.push({ label: 'Current Plan', value: user.currentPlan, icon: <CreditCard className="w-4 h-4" /> });
    if (hasValue(user.isPremium)) fields.push({ label: 'Plan Status', value: user.isPremium ? '🟢 Active' : '⚫ Inactive', icon: <CreditCard className="w-4 h-4" /> });
    if (user.planExpiresAt) fields.push({ label: 'Plan Expires', value: new Date(user.planExpiresAt).toLocaleDateString(), icon: <CreditCard className="w-4 h-4" /> });
    if (user.lastPlanActivated) fields.push({ label: 'Last Plan Activated', value: new Date(user.lastPlanActivated).toLocaleDateString(), icon: <CreditCard className="w-4 h-4" /> });
    if (hasValue(user.currentPlanProfilesUsed) && hasValue(user.currentPlanProfilesTotal)) {
      fields.push({ label: 'Profiles Used', value: `${user.currentPlanProfilesUsed}/${user.currentPlanProfilesTotal}`, icon: <CreditCard className="w-4 h-4" /> });
    }
    if (hasValue(user.currentPlanProfilesRemaining)) fields.push({ label: 'Profiles Remaining', value: user.currentPlanProfilesRemaining, icon: <CreditCard className="w-4 h-4" /> });
    
    return fields;
  };

  const availableFields = getAvailableFields();
  
  // Group fields by category for better organization
  const groupedFields = {
    'Account Info': availableFields.filter(f => 
      ['VIV ID', 'Full Name', 'Email', 'Mobile Number', 'User Type'].includes(f.label)
    ),
    'Personal Details': availableFields.filter(f => 
      ['Gender', 'Date of Birth', 'Age', 'Marital Status', 'Religion', 
       'First Name', 'Middle Name', 'Last Name', 'Diet', 'Birth Time',
       'Mother Tongue', 'Caste', 'Gotra', 'Zodiac Sign', 'Indian Religious',
       'Profile Bio'].includes(f.label)
    ),
    'Physical Details': availableFields.filter(f => 
      ['Height', 'Weight', 'Complexion', 'Physical Status'].includes(f.label)
    ),
    'Professional Details': availableFields.filter(f => 
      ['Occupation', 'Field of Study', 'Education Level', 'Employer', 'Annual Income'].includes(f.label)
    ),
    'Location Details': availableFields.filter(f => 
      ['City', 'State', 'Country', 'Zip Code', 'Street Address', 
       'Address Line 2', 'Native Place', 'Place of Birth'].includes(f.label)
    ),
    'Preferences': availableFields.filter(f => 
      ['Preferred Religion', 'Preferred Caste', 'Preferred Mother Tongue',
       'Preferred Education', 'Preferred Location', 'Preferred Languages'].includes(f.label)
    ),
    'Account Settings': availableFields.filter(f => 
      ['Profile Visibility', 'Photo Visibility', 'Citizenship Status'].includes(f.label)
    ),
    'Subscription': availableFields.filter(f => 
      ['Current Plan', 'Plan Status', 'Plan Expires', 'Last Plan Activated',
       'Profiles Used', 'Profiles Remaining'].includes(f.label)
    ),
    'Activities': availableFields.filter(f => 
      ['Hobbies', 'Languages Known'].includes(f.label)
    ),
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
        className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full p-6 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>
        
        <h2 className="text-2xl font-bold text-amber-900 mb-6 flex items-center gap-3">
          <Users className="w-8 h-8" />
          User Details - {user.vivId}
        </h2>
        
        <div className="space-y-6">
          {/* Profile Image Section */}
          {user.profileImage && (
            <div className="flex justify-center mb-4">
              <img
                src={user.profileImage}
                alt={user.name}
                className="w-40 h-40 rounded-full object-cover border-4 border-amber-600 shadow-lg"
              />
            </div>
          )}

          {/* Account Status Badges */}
          <div className="flex flex-wrap gap-3 mb-6">
            <span className={`inline-flex px-4 py-2 rounded-full font-medium ${
              user.isVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {user.isVerified ? '✅ Verified' : '❌ Not Verified'}
            </span>
            <span className={`inline-flex px-4 py-2 rounded-full font-medium ${
              user.profileCompleted ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {user.profileCompleted ? '📋 Profile Complete' : '📝 Profile Incomplete'}
            </span>
            <span className="inline-flex px-4 py-2 bg-purple-100 text-purple-800 rounded-full font-medium">
              👤 {hasValue(formData.userType) ? formData.userType : 'Self'}
            </span>
            <span className="inline-flex px-4 py-2 bg-amber-100 text-amber-800 rounded-full font-medium">
              📅 Registered: {new Date(user.createdAt).toLocaleDateString()}
            </span>
            <span className={`inline-flex px-4 py-2 rounded-full font-medium ${
              user.isOnlineNow ? 'bg-green-100 text-green-800' : 
              user.isCurrentlyActive ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {user.isOnlineNow ? '🟢 Online Now' : user.isCurrentlyActive ? '🟡 Active Recently' : '⚫ Offline'}
            </span>
          </div>

          {/* Dynamic Sections based on available fields */}
          {Object.entries(groupedFields).map(([sectionName, sectionFields]) => {
            if (sectionFields.length === 0) return null;
            
            return (
              <Section 
                key={sectionName} 
                title={sectionName} 
                icon={getSectionIcon(sectionName)}
              >
                {sectionFields.map((field, index) => (
                  <InfoRow 
                    key={index}
                    label={field.label} 
                    value={field.value} 
                    icon={field.icon}
                  />
                ))}
              </Section>
            );
          })}

          {/* Additional Images Section */}
          {(user.additionalImages && user.additionalImages.length > 0) && (
            <Section title="Additional Photos" icon={<FileText className="w-5 h-5" />}>
              <div className="col-span-3">
                <p className="text-sm text-gray-500 mb-2">Additional Photos:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {user.additionalImages.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`Additional ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                  ))}
                </div>
              </div>
            </Section>
          )}

          {/* Documents Section */}
          {(user.documents && user.documents.length > 0) && (
            <Section title="Uploaded Documents" icon={<FileText className="w-5 h-5" />}>
              <div className="col-span-3">
                <p className="text-sm text-gray-500 mb-2">Documents:</p>
                <div className="space-y-2">
                  {user.documents.map((doc, index) => (
                    <a
                      key={index}
                      href={doc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline p-2 bg-blue-50 rounded"
                    >
                      📄 Document {index + 1}
                    </a>
                  ))}
                </div>
              </div>
            </Section>
          )}

          {/* Account Activity Section */}
          <Section title="Account Activity" icon={<Calendar className="w-5 h-5" />}>
            <InfoRow label="Last Login" value={user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'} />
            <InfoRow label="Last Logout" value={user.lastLogout ? new Date(user.lastLogout).toLocaleString() : 'Not Available'} />
            <InfoRow label="Profile Created" value={new Date(user.createdAt).toLocaleString()} />
            <InfoRow label="Profile Updated" value={user.updatedAt ? new Date(user.updatedAt).toLocaleString() : 'Not Available'} />
            <InfoRow label="Current Status" value={user.isOnlineNow ? 'Online Now' : (user.isCurrentlyActive ? 'Active' : 'Offline')} />
          </Section>

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                handleDeleteClick(user);
              }}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
            >
              Delete User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get section icons
const getSectionIcon = (sectionName) => {
  switch(sectionName) {
    case 'Account Info': return <User className="w-5 h-5" />;
    case 'Personal Details': return <UserCircle className="w-5 h-5" />;
    case 'Physical Details': return <Scale className="w-5 h-5" />;
    case 'Professional Details': return <Briefcase className="w-5 h-5" />;
    case 'Location Details': return <MapPin className="w-5 h-5" />;
    case 'Preferences': return <Target className="w-5 h-5" />;
    case 'Account Settings': return <Shield className="w-5 h-5" />;
    case 'Subscription': return <CreditCard className="w-5 h-5" />;
    case 'Activities': return <FileText className="w-5 h-5" />;
    default: return <FileText className="w-5 h-5" />;
  }
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
            <Users className="w-12 h-12 text-amber-700" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-amber-900 mb-4">User Management</h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Manage all registered users. Total Users: <span className="font-bold text-amber-700">{totalUsers}</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, VIV ID, mobile..."
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
                    <th className="px-6 py-4 text-left text-sm font-semibold hidden lg:table-cell">Mobile</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold hidden lg:table-cell">Gender</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold hidden md:table-cell">City</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold hidden md:table-cell">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Verified</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-12 text-gray-500">
                        {searchTerm ? 'No matching users.' : 'No users found.'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const formData = user.formData || {};
                      return (
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
                                className="w-10 h-10 rounded-full object-cover border border-amber-300"
                              />
                            )}
                            <span>{user.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-700">{user.email}</td>
                        <td className="px-6 py-4 text-gray-700 hidden lg:table-cell">{formData.mobileNo || '—'}</td>
                        <td className="px-6 py-4 text-gray-700 hidden lg:table-cell">{formData.gender || '—'}</td>
                        <td className="px-6 py-4 text-gray-700 hidden md:table-cell">{formData.city || '—'}</td>
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
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
            {filteredUsers.length > 0 && (
              <div className="bg-gray-50 px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
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

// Updated Section Component
const Section = ({ title, children, icon }) => (
  <div className="border border-amber-200 rounded-xl p-6 bg-gradient-to-r from-amber-50 to-white">
    <h3 className="text-xl font-bold text-amber-800 mb-6 pb-3 border-b border-amber-300 flex items-center gap-3">
      {icon}
      {title}
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {children}
    </div>
  </div>
);

// Updated InfoRow Component
const InfoRow = ({ label, value, icon }) => {
  const hasValue = value && value !== 'N/A' && value !== '' && value !== null && value !== undefined && value !== 'Not Filled';
  
  return (
    <div className="p-3 rounded-lg bg-white border border-gray-100 hover:bg-amber-50 transition">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1 font-medium">
        {icon}
        {label}
      </div>
      <p className={`font-medium ${hasValue ? 'text-gray-900' : 'text-gray-400 italic'}`}>
        {hasValue ? value : 'Not Filled'}
      </p>
    </div>
  );
};

export default AdminUsersDashboard;