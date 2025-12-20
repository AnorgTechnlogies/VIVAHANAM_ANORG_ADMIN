import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Trash2, Eye, FileText, Calendar, Download,
  CreditCard, DollarSign, Package, Filter, X,
  Loader2, AlertCircle, ChevronLeft, ChevronRight, Search,
  User, Mail, Calendar as CalendarIcon
} from 'lucide-react';

const API_BASE_URL =  import.meta.env.VITE_API_KEY;

const MatchmakingPayuser = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 1
  });

  // Filters
  const [filters, setFilters] = useState({
    year: '',
    month: '',
    vivId: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token') || localStorage.getItem('adminToken');
  };

  // Fetch all plan purchases with filters
  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = getAuthToken();
      if (!token) {
        setError('Authentication token not found. Please login again.');
        setLoading(false);
        return;
      }

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (filters.year) params.append('year', filters.year);
      if (filters.month) params.append('month', filters.month);
      if (filters.vivId) params.append('vivId', filters.vivId);

      const response = await axios.get(`${API_BASE_URL}/plan-purchases?${params.toString()}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setPayments(response.data.data.transactions || []);
        setPagination(response.data.data.pagination || {
          page: 1,
          limit: 25,
          total: 0,
          totalPages: 1
        });
      } else {
        setError(response.data.message || 'Failed to fetch data');
      }
    } catch (err) {
      console.error('❌ Error fetching payments:', err);
      if (err.response) {
        setError(err.response.data?.message || `Error ${err.response.status}: ${err.response.statusText}`);
      } else if (err.request) {
        setError('Network error. Please check your connection.');
      } else {
        setError(err.message || 'Failed to fetch payment data');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentData();
  }, [pagination.page, filters.year, filters.month, filters.vivId]);

  // Format currency
  const formatCurrency = (amount, currency = 'USD') => {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  // Handle delete with confirmation
  const handleDeleteClick = (payment) => {
    setSelectedPayment(payment);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPayment) return;

    try {
      setDeletingId(selectedPayment._id);
      const token = getAuthToken();
      if (!token) {
        alert('Authentication token not found. Please login again.');
        return;
      }

      const response = await axios.delete(`${API_BASE_URL}/delete/${selectedPayment._id}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        alert('Payment record deleted successfully!');
        fetchPaymentData();
        setShowDeleteModal(false);
        setSelectedPayment(null);
      } else {
        alert(response.data.message || 'Failed to delete payment');
      }
    } catch (err) {
      console.error('❌ Delete error:', err);
      if (err.response) {
        alert(err.response.data?.message || `Error ${err.response.status}: ${err.response.statusText}`);
      } else if (err.request) {
        alert('Network error. Please check your connection.');
      } else {
        alert(err.message || 'Failed to delete payment');
      }
    } finally {
      setDeletingId(null);
    }
  };

  // Download PDF
  const handleDownloadPDF = async (transactionId) => {
    try {
      const token = getAuthToken();
      if (!token) {
        alert('Please login to download invoice');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/pdf/${transactionId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob'
      });

      // Create blob and download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice_${transactionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('❌ PDF download error:', err);
      alert('Failed to download PDF. Please try again.');
    }
  };

  // View details (expand row)
  const [expandedRow, setExpandedRow] = useState(null);
  const toggleRowDetails = (transactionId) => {
    setExpandedRow(expandedRow === transactionId ? null : transactionId);
  };

  // Filter handlers
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1 on filter change
  };

  const clearFilters = () => {
    setFilters({ year: '', month: '', vivId: '' });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Generate year and month options
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  // Pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  // Loading component
  if (loading && payments.length === 0) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '60vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <Loader2 size={40} className="animate-spin" style={{ color: '#3b82f6' }} />
        <span style={{ color: '#6b7280', fontSize: '16px' }}>Loading payment records...</span>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h2 style={{ marginBottom: '8px', fontSize: '28px', fontWeight: '700', color: '#111827' }}>
            Matchmaking Plan Purchases
          </h2>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
            Manage all user plan purchases and transactions
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              background: showFilters ? '#3b82f6' : 'white',
              color: showFilters ? 'white' : '#3b82f6',
              border: '1px solid #3b82f6',
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <Filter size={18} />
            Filters
          </button>
          <button
            onClick={fetchPaymentData}
            style={{
              background: '#10b981',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#111827' }}>Filter Records</h3>
            <button
              onClick={clearFilters}
              style={{
                background: 'transparent',
                border: '1px solid #dc2626',
                color: '#dc2626',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Clear All
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                VIV ID
              </label>
              <input
                type="text"
                value={filters.vivId}
                onChange={(e) => handleFilterChange('vivId', e.target.value.toUpperCase())}
                placeholder="Enter VIV ID"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                Year
              </label>
              <select
                value={filters.year}
                onChange={(e) => handleFilterChange('year', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  background: 'white'
                }}
              >
                <option value="">All Years</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                Month
              </label>
              <select
                value={filters.month}
                onChange={(e) => handleFilterChange('month', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  background: 'white'
                }}
              >
                <option value="">All Months</option>
                {months.map(month => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <AlertCircle size={20} color="#dc2626" style={{ marginRight: '8px' }} />
            <div style={{ fontWeight: '600', color: '#dc2626' }}>Error!</div>
          </div>
          <p style={{ marginBottom: '12px', color: '#991b1b' }}>{error}</p>
          <button
            onClick={fetchPaymentData}
            style={{
              background: 'transparent',
              border: '1px solid #dc2626',
              color: '#dc2626',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Summary Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{
          border: '1px solid #3b82f6',
          borderRadius: '12px',
          padding: '20px',
          background: 'white',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              padding: '12px',
              borderRadius: '8px',
              marginRight: '16px'
            }}>
              <CreditCard size={24} color="#3b82f6" />
            </div>
            <div>
              <div style={{ color: '#6b7280', fontSize: '14px', marginBottom: '4px' }}>Total Purchases</div>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#111827' }}>
                {pagination.total}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History Table */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        <div style={{
          background: 'white',
          borderBottom: '1px solid #e5e7eb',
          padding: '16px 24px'
        }}>
          <h5 style={{ margin: 0, fontWeight: '600', color: '#111827' }}>All Plan Purchases</h5>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>User</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Plan</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Amount</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Profiles</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Date</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Validity</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '60px 24px' }}>
                    <div style={{ color: '#6b7280', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                      <FileText size={56} color="#9ca3af" />
                      <div>
                        <p style={{ margin: 0, fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
                          No payment records found
                        </p>
                        <p style={{ margin: 0, fontSize: '14px', color: '#9ca3af' }}>
                          {Object.values(filters).some(f => f) ? 'Try adjusting your filters.' : 'No purchases have been made yet.'}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <React.Fragment key={payment._id}>
                    <tr style={{ 
                      borderBottom: '1px solid #f3f4f6',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onClick={() => toggleRowDetails(payment._id)}
                    >
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {payment.user?.profileImage ? (
                            <img 
                              src={payment.user.profileImage} 
                              alt={payment.user.name}
                              style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                          ) : (
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              background: '#e5e7eb',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#6b7280',
                              fontWeight: '600'
                            }}>
                              {payment.user?.name?.charAt(0) || 'U'}
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight: '600', color: '#111827', fontSize: '14px' }}>
                              {payment.user?.name || 'N/A'}
                            </div>
                            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                              {payment.user?.vivId || payment.userVivId || 'N/A'}
                            </div>
                            {payment.user?.email && (
                              <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                                {payment.user.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ fontWeight: '600', color: '#111827' }}>
                          {payment.planName || 'N/A'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                          {payment.planCode || 'N/A'}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', fontWeight: '600', color: '#111827' }}>
                        {formatCurrency(payment.amount, payment.currency)}
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ fontWeight: '600', color: '#111827' }}>
                          {payment.purchasedProfiles || payment.creditsAllocated || 0}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div>{formatDate(payment.completedAt || payment.createdAt)}</div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        {payment.userPlan?.validForDays ? (
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                              {payment.userPlan.validForDays} days
                            </div>
                            {payment.userPlan.expiresAt && (
                              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                                Exp: {new Date(payment.userPlan.expiresAt).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: '#9ca3af' }}>N/A</span>
                        )}
                      </td>
                      <td style={{ padding: '16px 24px' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleDownloadPDF(payment._id)}
                            title="Download PDF"
                            style={{
                              background: 'transparent',
                              border: '1px solid #10b981',
                              color: '#10b981',
                              padding: '8px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => {
                              e.target.style.background = '#10b981';
                              e.target.style.color = 'white';
                            }}
                            onMouseOut={(e) => {
                              e.target.style.background = 'transparent';
                              e.target.style.color = '#10b981';
                            }}
                          >
                            <Download size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(payment)}
                            title="Delete Record"
                            disabled={deletingId === payment._id}
                            style={{
                              background: 'transparent',
                              border: '1px solid #dc2626',
                              color: '#dc2626',
                              padding: '8px',
                              borderRadius: '6px',
                              cursor: deletingId === payment._id ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s',
                              opacity: deletingId === payment._id ? 0.5 : 1
                            }}
                            onMouseOver={(e) => {
                              if (deletingId !== payment._id) {
                                e.target.style.background = '#dc2626';
                                e.target.style.color = 'white';
                              }
                            }}
                            onMouseOut={(e) => {
                              if (deletingId !== payment._id) {
                                e.target.style.background = 'transparent';
                                e.target.style.color = '#dc2626';
                              }
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {/* Expanded Details Row */}
                    {expandedRow === payment._id && (
                      <tr style={{ background: '#f9fafb' }}>
                        <td colSpan="7" style={{ padding: '24px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                            <div>
                              <h4 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Transaction Details</h4>
                              <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.8' }}>
                                <div><strong>Transaction ID:</strong> {payment._id}</div>
                                <div><strong>Payment Reference:</strong> {payment.paymentReference || 'N/A'}</div>
                                <div><strong>Payment Method:</strong> {payment.paymentGateway || 'N/A'}</div>
                                <div><strong>Status:</strong> <span style={{ 
                                  color: payment.status === 'COMPLETED' ? '#10b981' : '#f59e0b',
                                  fontWeight: '600'
                                }}>{payment.status || 'N/A'}</span></div>
                                <div><strong>Payment Date:</strong> {formatDate(payment.completedAt || payment.createdAt)}</div>
                              </div>
                            </div>
                            {payment.userPlan && (
                              <div>
                                <h4 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Plan Details</h4>
                                <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.8' }}>
                                  <div><strong>Plan Display Name:</strong> {payment.userPlan.displayName || 'N/A'}</div>
                                  <div><strong>Frequency:</strong> {payment.userPlan.frequency || 'N/A'}</div>
                                  <div><strong>Profiles Allocated:</strong> {payment.userPlan.profilesAllocated || 0}</div>
                                  <div><strong>Profiles Remaining:</strong> {payment.userPlan.profilesRemaining || 0}</div>
                                  <div><strong>Validity:</strong> {payment.userPlan.validForDays || 'N/A'} days</div>
                                  <div><strong>Expires At:</strong> {payment.userPlan.expiresAt ? new Date(payment.userPlan.expiresAt).toLocaleString() : 'N/A'}</div>
                                  <div><strong>Status:</strong> <span style={{ 
                                    color: payment.userPlan.isActive ? '#10b981' : '#6b7280',
                                    fontWeight: '600'
                                  }}>{payment.userPlan.isActive ? 'Active' : 'Expired'}</span></div>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div style={{
            background: 'white',
            borderTop: '1px solid #e5e7eb',
            padding: '16px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} entries
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                style={{
                  background: pagination.page === 1 ? '#f3f4f6' : 'transparent',
                  border: '1px solid #d1d5db',
                  color: pagination.page === 1 ? '#9ca3af' : '#374151',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: pagination.page === 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              <span style={{ margin: '0 16px', color: '#374151', fontSize: '14px' }}>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                style={{
                  background: pagination.page === pagination.totalPages ? '#f3f4f6' : 'transparent',
                  border: '1px solid #d1d5db',
                  color: pagination.page === pagination.totalPages ? '#9ca3af' : '#374151',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: pagination.page === pagination.totalPages ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedPayment && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{ margin: 0, fontWeight: '600', color: '#111827', fontSize: '18px' }}>
                Confirm Delete
              </h3>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedPayment(null);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#6b7280',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  fontSize: '20px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ marginBottom: '20px', color: '#4b5563', lineHeight: '1.5' }}>
              Are you sure you want to delete this payment record? This action cannot be undone.
            </p>
            <div style={{
              background: '#fef3c7',
              border: '1px solid #fbbf24',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <div style={{ marginBottom: '8px', fontSize: '14px' }}>
                <strong>User:</strong> {selectedPayment.user?.name || 'N/A'} ({selectedPayment.user?.vivId || selectedPayment.userVivId})
              </div>
              <div style={{ marginBottom: '8px', fontSize: '14px' }}>
                <strong>Plan:</strong> {selectedPayment.planName || 'N/A'}
              </div>
              <div style={{ fontSize: '14px' }}>
                <strong>Amount:</strong> {formatCurrency(selectedPayment.amount, selectedPayment.currency)}
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: '12px'
            }}>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedPayment(null);
                }}
                style={{
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  padding: '10px 24px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deletingId === selectedPayment._id}
                style={{
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  padding: '10px 24px',
                  borderRadius: '6px',
                  cursor: deletingId === selectedPayment._id ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  opacity: deletingId === selectedPayment._id ? 0.5 : 1
                }}
              >
                {deletingId === selectedPayment._id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        tr:hover {
          background-color: #f9fafb;
        }
      `}</style>
    </div>
  );
};

export default MatchmakingPayuser;
