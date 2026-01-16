import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp, Users, CreditCard, CheckCircle, Clock, Star, Heart, Sparkles, Shield,
  MessageCircle, UserCheck, AlertTriangle, Search, RefreshCw, X, MapPin, PhoneCall, MailIcon,
  Activity, DollarSign, Award, ShieldCheck, Wifi, WifiOff, Circle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_KEY;

// Enhanced Modal Component with Tabs - Clean UI
const DetailModal = ({ title, children, onClose, tabs, activeTab, onTabChange }) => {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
      animation: 'fadeIn 0.3s ease-out'
    }} onClick={onClose}>
      <div style={{
        background: 'white', borderRadius: '20px', padding: '0', maxWidth: '900px',
        width: '95%', maxHeight: '95vh', overflow: 'hidden', position: 'relative',
        boxShadow: '0 25px 50px rgba(0,0,0,0.25)', border: '1px solid #fef3c7',
        animation: 'slideUp 0.4s ease-out'
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: '24px 32px 0', borderBottom: '1px solid #f3f4f6',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1f2937' }}>
            {title}
          </h2>
          <button onClick={onClose} style={{
            background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '50%',
            width: '36px', height: '36px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer'
          }}>
            <X size={20} color="#92400e" />
          </button>
        </div>

        {/* Tabs */}
        {tabs && (
          <div style={{
            display: 'flex', gap: '0', padding: '0 32px', borderBottom: '1px solid #f3f4f6',
            background: '#f9fafb'
          }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                style={{
                  padding: '16px 24px', background: 'transparent', border: 'none',
                  borderBottom: activeTab === tab.id ? '3px solid #f59e0b' : '3px solid transparent',
                  color: activeTab === tab.id ? '#f59e0b' : '#6b7280',
                  fontWeight: activeTab === tab.id ? 700 : 600,
                  cursor: 'pointer', fontSize: '14px',
                  transition: 'all 0.2s ease'
                }}
              >
                {tab.label} {tab.count !== undefined && `(${tab.count})`}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div style={{ padding: '24px 32px 32px', maxHeight: 'calc(95vh - 120px)', overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

// Enhanced New User Popup Component
const NewUserPopup = ({ user, onClose, onViewDetails, autoClose = true }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300);
      }, 8000);

      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const handleViewDetails = () => {
    setVisible(false);
    onViewDetails(user);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', top: '20px', right: '20px', 
      background: 'white', borderRadius: '12px', padding: '16px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.2)', border: '2px solid #10b981',
      zIndex: 10000, minWidth: '300px', 
      animation: 'slideInRight 0.3s ease-out',
      transform: visible ? 'translateX(0)' : 'translateX(100%)',
      transition: 'transform 0.3s ease-out'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            background: '#d1fae5', padding: '8px', borderRadius: '8px'
          }}>
            <UserCheck size={20} color="#10b981" />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#1f2937' }}>
              New User Registered!
            </h4>
            <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
              Just now
            </p>
          </div>
        </div>
        <button onClick={handleClose} style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          padding: '4px', borderRadius: '4px'
        }}>
          <X size={16} color="#6b7280" />
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '8px', background: '#fffbeb',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid #fef3c7', fontSize: '16px', fontWeight: 700, color: '#92400e'
        }}>
          {user.name?.[0]?.toUpperCase() || user.firstName?.[0]?.toUpperCase() || 'U'}
        </div>
        <div style={{ flex: 1 }}>
          <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#1f2937' }}>
            {user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'New User'}
          </h5>
          <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
            {user.email || 'No email provided'}
          </p>
          {user.vivId && (
            <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#9ca3af' }}>
              ID: {user.vivId}
            </p>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button 
          onClick={handleViewDetails}
          style={{
            flex: 1, padding: '8px 12px', background: '#f59e0b', color: 'white',
            border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          View Details
        </button>
        <button 
          onClick={handleClose}
          style={{
            padding: '8px 12px', background: '#f3f4f6', color: '#6b7280',
            border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Dismiss
        </button>
      </div>

      {/* Progress bar for auto-close */}
      {autoClose && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: '#e5e7eb',
          borderRadius: '0 0 12px 12px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            background: '#10b981',
            animation: 'progressBar 8s linear forwards'
          }} />
        </div>
      )}
    </div>
  );
};

// Enhanced User Profile Card Component
const UserProfileCard = ({ user, onVerify, showVerifyButton = false, showOnlineStatus = false }) => {
  const [expanded, setExpanded] = useState(false);

  // Enhanced online status with real-time data
  const isUserOnlineNow = (user) => {
    if (user.isOnlineNow || user.onlineStatus === 'online') return true;
    
    if (user.sessionInfo && user.sessionInfo.lastActive) {
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
      return new Date(user.sessionInfo.lastActive) > twoMinutesAgo;
    }
    
    if (!user.lastLogin) return false;
    const lastLogin = new Date(user.lastLogin);
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    
    const isNotLoggedOut = !user.lastLogout || new Date(user.lastLogout) < lastLogin;
    
    return lastLogin > twoMinutesAgo && isNotLoggedOut;
  };

  const isOnlineNow = showOnlineStatus && isUserOnlineNow(user);
  const isCurrentlyActive = user.isCurrentlyActive;

  const getStatusBadge = () => {
    if (!user.isVerified) return { text: 'Unverified', color: '#dc2626', bg: '#fef2f2' };
    if (!user.profileCompleted) return { text: 'Incomplete', color: '#d97706', bg: '#fffbeb' };
    if (isOnlineNow) return { text: 'Online Now', color: '#059669', bg: '#ecfdf5' };
    if (isCurrentlyActive) return { text: 'Active', color: '#10b981', bg: '#ecfdf5' };
    if (user.userType === 'premium') return { text: 'Premium', color: '#7c3aed', bg: '#faf5ff' };
    return { text: 'Offline', color: '#6b7280', bg: '#f9fafb' };
  };

  const status = getStatusBadge();

  return (
    <div style={{
      background: 'white', 
      border: isOnlineNow ? '2px solid #10b981' : '1px solid #f3f4f6',
      borderRadius: '12px',
      padding: '20px', 
      marginBottom: '16px', 
      cursor: expanded ? 'default' : 'pointer',
      transition: 'all 0.2s ease', 
      boxShadow: isOnlineNow ? '0 4px 12px rgba(16, 185, 129, 0.15)' : '0 1px 3px rgba(0,0,0,0.05)',
      position: 'relative'
    }}
    onClick={() => !expanded && setExpanded(!expanded)}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = isOnlineNow 
        ? '0 8px 25px rgba(16, 185, 129, 0.2)' 
        : '0 4px 12px rgba(0,0,0,0.1)';
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = isOnlineNow 
        ? '0 4px 12px rgba(16, 185, 129, 0.15)' 
        : '0 1px 3px rgba(0,0,0,0.05)';
      e.currentTarget.style.transform = 'translateY(0)';
    }}>
      
      {/* Online Status Indicator */}
      {isOnlineNow && (
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          width: '12px',
          height: '12px',
          background: '#10b981',
          borderRadius: '50%',
          border: '2px solid white',
          boxShadow: '0 0 0 2px #10b981',
          animation: 'pulse 2s infinite'
        }} />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flex: 1 }}>
          <div style={{
            width: '60px', 
            height: '60px', 
            borderRadius: '12px', 
            background: '#fffbeb',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            border: isOnlineNow ? '2px solid #10b981' : '2px solid #fef3c7',
            fontSize: '20px', 
            fontWeight: 700, 
            color: '#92400e',
            position: 'relative'
          }}>
            {user.name?.[0]?.toUpperCase() || user.firstName?.[0]?.toUpperCase() || 'U'}
            {isOnlineNow && (
              <div style={{
                position: 'absolute',
                bottom: '-4px',
                right: '-4px',
                width: '16px',
                height: '16px',
                background: '#10b981',
                borderRadius: '50%',
                border: '2px solid white'
              }} />
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#1f2937', margin: 0 }}>
                {user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User'}
              </h4>
              {user.isVerified && (
                <ShieldCheck size={16} color="#059669" style={{ marginTop: '2px' }} />
              )}
              <span style={{
                padding: '4px 8px', 
                background: '#fffbeb', 
                color: '#92400e',
                borderRadius: '6px', 
                fontSize: '11px', 
                fontWeight: 700
              }}>
                {user.vivId || 'N/A'}
              </span>
              <span style={{
                padding: '4px 8px', 
                background: status.bg, 
                color: status.color,
                borderRadius: '6px', 
                fontSize: '11px', 
                fontWeight: 700,
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px'
              }}>
                {isOnlineNow ? <Wifi size={12} /> : (isCurrentlyActive ? <Circle size={12} /> : <WifiOff size={12} />)}
                {status.text}
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '14px', color: '#6b7280' }}>
              {user.email && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MailIcon size={14} /> {user.email}
                </span>
              )}
              {user.mobileNo && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <PhoneCall size={14} /> {user.mobileNo}
                </span>
              )}
              {user.city && user.state && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={14} /> {user.city}, {user.state}
                </span>
              )}
              {user.lastLogin && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={14} /> Last active: {formatTimeAgo(user.lastLogin)}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Status and actions section */}
        <div style={{ textAlign: 'right', minWidth: '120px' }}>
          <div style={{
            padding: '6px 12px', 
            background: isOnlineNow ? '#ecfdf5' : (user.isVerified ? '#f3f4f6' : '#fef2f2'),
            color: isOnlineNow ? '#059669' : (user.isVerified ? '#6b7280' : '#dc2626'), 
            borderRadius: '20px',
            fontSize: '12px', 
            fontWeight: 700, 
            marginBottom: '8px'
          }}>
            {isOnlineNow ? 'Online' : (user.isVerified ? 'Verified' : 'Pending')}
          </div>
          {showVerifyButton && !user.isVerified && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onVerify(user._id);
              }}
              style={{
                padding: '6px 12px', 
                background: '#059669', 
                color: 'white',
                border: 'none', 
                borderRadius: '8px', 
                fontWeight: 600, 
                cursor: 'pointer',
                fontSize: '12px', 
                marginBottom: '8px'
              }}
            >
              Verify
            </button>
          )}
          <div style={{ fontSize: '12px', color: '#9ca3af' }}>
            {isOnlineNow ? (
              <span style={{ color: '#059669', fontWeight: 600 }}>● Online now</span>
            ) : user.lastLogin ? (
              `Last: ${formatTimeAgo(user.lastLogin)}`
            ) : (
              'Never logged in'
            )}
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{ 
          marginTop: '16px', 
          paddingTop: '16px', 
          borderTop: '1px solid #f3f4f6',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
            <button 
              onClick={() => setExpanded(false)}
              style={{
                padding: '4px 8px', 
                background: '#f3f4f6', 
                border: 'none',
                borderRadius: '6px', 
                fontSize: '12px', 
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
          
          {/* Online status section */}
          <div style={{
            background: isOnlineNow ? '#ecfdf5' : (isCurrentlyActive ? '#f0f9ff' : '#f3f4f6'),
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '16px',
            border: `1px solid ${isOnlineNow ? '#a7f3d0' : (isCurrentlyActive ? '#bae6fd' : '#e5e7eb')}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: isOnlineNow ? '#10b981' : (isCurrentlyActive ? '#0ea5e9' : '#6b7280'),
                animation: isOnlineNow ? 'pulse 2s infinite' : 'none'
              }} />
              <span style={{ 
                fontWeight: 600, 
                color: isOnlineNow ? '#065f46' : (isCurrentlyActive ? '#0369a1' : '#4b5563'),
                fontSize: '14px'
              }}>
                {isOnlineNow ? 'Currently Online' : (isCurrentlyActive ? 'Active Session' : 'Currently Offline')}
              </span>
            </div>
            {user.lastLogin && (
              <div style={{ 
                fontSize: '12px', 
                color: isOnlineNow ? '#047857' : (isCurrentlyActive ? '#0284c7' : '#6b7280'),
                marginTop: '4px'
              }}>
                Last activity: {new Date(user.lastLogin).toLocaleString()}
                {user.lastLogout && (
                  <span style={{ marginLeft: '8px' }}>
                    (Last logout: {new Date(user.lastLogout).toLocaleString()})
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Rest of the user details */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {user.gender && (
              <div>
                <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600 }}>Gender</label>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>{user.gender}</div>
              </div>
            )}
            {user.age && (
              <div>
                <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600 }}>Age</label>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>{user.age} years</div>
              </div>
            )}
            {user.religion && (
              <div>
                <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600 }}>Religion</label>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>{user.religion}</div>
              </div>
            )}
            {user.occupation && (
              <div>
                <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600 }}>Occupation</label>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>{user.occupation}</div>
              </div>
            )}
            {user.lastLogin && (
              <div>
                <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600 }}>Last Login</label>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>
                  {new Date(user.lastLogin).toLocaleString()}
                  {isOnlineNow && (
                    <span style={{ 
                      marginLeft: '8px', 
                      padding: '2px 6px', 
                      background: '#d1fae5', 
                      color: '#065f46',
                      borderRadius: '4px', 
                      fontSize: '10px', 
                      fontWeight: 700 
                    }}>
                      Online Now
                    </span>
                  )}
                </div>
              </div>
            )}
            {user.userType && (
              <div>
                <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600 }}>User Type</label>
                <div style={{ 
                  padding: '4px 8px', 
                  background: user.userType === 'premium' ? '#fef3c7' : '#f3f4f6',
                  color: user.userType === 'premium' ? '#92400e' : '#6b7280',
                  borderRadius: '6px', fontSize: '12px', fontWeight: 700, width: 'fit-content'
                }}>
                  {user.userType || 'Basic'}
                </div>
              </div>
            )}
          </div>
          
          {user.profileBio && (
            <div style={{ marginTop: '12px' }}>
              <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600 }}>Bio</label>
              <div style={{ fontSize: '14px', marginTop: '4px', lineHeight: '1.5' }}>
                {user.profileBio}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Payment Detail Card Component
const PaymentDetailCard = ({ payment }) => {
  return (
    <div style={{
      background: 'white', border: '1px solid #f3f4f6', borderRadius: '12px',
      padding: '20px', marginBottom: '16px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#1f2937', margin: '0 0 4px 0' }}>
            {payment.userName || payment.userVivId || 'Unknown User'}
          </h4>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>{payment.userVivId || 'No VIV ID'}</div>
        </div>
        <div style={{
          padding: '6px 12px', background: payment.payment_status === 'COMPLETED' ? '#ecfdf5' : '#fef2f2',
          color: payment.payment_status === 'COMPLETED' ? '#059669' : '#dc2626',
          borderRadius: '20px', fontSize: '12px', fontWeight: 700
        }}>
          {payment.payment_status === 'COMPLETED' ? 'Paid' : 'Pending'}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
        <div>
          <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600 }}>Plan</label>
          <div style={{ 
            padding: '4px 8px', background: '#fffbeb', color: '#92400e',
            borderRadius: '6px', fontSize: '12px', fontWeight: 700, width: 'fit-content', marginTop: '4px'
          }}>
            {payment.plan_name || 'Unknown Plan'}
          </div>
        </div>
        <div>
          <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600 }}>Amount</label>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#059669', marginTop: '4px' }}>
            ${payment.payment_amount?.toLocaleString() || '0'}
          </div>
        </div>
        <div>
          <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600 }}>Date</label>
          <div style={{ fontSize: '14px', fontWeight: 600, marginTop: '4px' }}>
            {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : 'Unknown Date'}
          </div>
        </div>
        <div>
          <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600 }}>Frequency</label>
          <div style={{ fontSize: '14px', fontWeight: 600, marginTop: '4px' }}>
            {payment.plan_frequency || 'One-time'}
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Stats Card Component
const ClickableStatCard = ({ title, value, icon: Icon, change, subtitle, alert, onClick, isNew = false, isOnline = false }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: hovered ? '0 12px 30px rgba(245, 158, 11, 0.2)' : '0 2px 12px rgba(0, 0, 0, 0.08)',
        transform: hovered ? 'translateY(-6px) scale(1.02)' : 'translateY(0)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: alert ? '2px solid #dc2626' : isNew ? '2px solid #10b981' : isOnline ? '2px solid #10b981' : '2px solid #fef3c7',
        minHeight: '140px',
        cursor: 'pointer',
        userSelect: 'none'
      }}
    >
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        height: '4px',
        background: alert 
          ? 'linear-gradient(90deg, #dc2626, #ef4444)' 
          : isNew 
          ? 'linear-gradient(90deg, #10b981, #34d399)'
          : isOnline
          ? 'linear-gradient(90deg, #10b981, #34d399)'
          : 'linear-gradient(90deg, #f59e0b, #fbbf24)'
      }} />

      {alert && (
        <div style={{ position: 'absolute', top: '12px', right: '12px', background: '#dc2626', color: 'white', padding: '4px 8px',
          borderRadius: '6px', fontSize: '10px', fontWeight: 700 }}>
          ACTION NEEDED
        </div>
      )}

      {isNew && (
        <div style={{ 
          position: 'absolute', 
          top: '12px', 
          right: '12px', 
          background: '#10b981', 
          color: 'white', 
          padding: '4px 8px',
          borderRadius: '6px', 
          fontSize: '10px', 
          fontWeight: 700,
          animation: 'pulse 2s infinite'
        }}>
          NEW!
        </div>
      )}

      {isOnline && (
        <div style={{ 
          position: 'absolute', 
          top: '12px', 
          right: '12px', 
          background: '#10b981', 
          color: 'white', 
          padding: '4px 8px',
          borderRadius: '6px', 
          fontSize: '10px', 
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <Wifi size={10} />
          LIVE
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <p style={{ 
              fontSize: '14px', 
              fontWeight: 600, 
              marginBottom: '8px', 
              color: alert ? '#dc2626' : isNew ? '#10b981' : isOnline ? '#10b981' : '#92400e' 
            }}>
              {title}
            </p>
            <h3 style={{ 
              fontSize: '32px', 
              fontWeight: 800, 
              margin: '4px 0', 
              color: alert ? '#dc2626' : isNew ? '#10b981' : isOnline ? '#10b981' : '#1f2937' 
            }}>
              {typeof value === 'number' ? value.toLocaleString() : value || 0}
            </h3>
            {subtitle && <p style={{ fontSize: '12px', marginTop: '6px', color: '#6b7280' }}>{subtitle}</p>}
          </div>
          <div style={{ 
            background: alert ? '#fef2f2' : isNew ? '#d1fae5' : isOnline ? '#d1fae5' : '#fffbeb', 
            padding: '12px', 
            borderRadius: '12px',
            border: alert ? '1px solid #fecaca' : isNew ? '1px solid #a7f3d0' : isOnline ? '1px solid #a7f3d0' : '1px solid #fef3c7'
          }}>
            <Icon size={24} color={alert ? '#dc2626' : isNew ? '#10b981' : isOnline ? '#10b981' : '#f59e0b'} strokeWidth={2} />
          </div>
        </div>
        {change && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            marginTop: '12px', 
            fontSize: '12px', 
            fontWeight: 600,
            background: alert ? '#fef2f2' : isNew ? '#d1fae5' : isOnline ? '#d1fae5' : '#fffbeb', 
            padding: '4px 10px', 
            borderRadius: '8px', 
            width: 'fit-content',
            color: alert ? '#dc2626' : isNew ? '#10b981' : isOnline ? '#10b981' : '#92400e'
          }}>
            <TrendingUp size={14} />
            <span>+{change}%</span> vs last month
          </div>
        )}
      </div>
    </div>
  );
};

// Quick Action Button Component
const QuickActionButton = ({ icon: Icon, label, onClick, variant = "primary", count }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px',
        background: variant === 'alert' ? '#fef2f2' : '#fffbeb',
        border: variant === 'alert' ? '1px solid #fecaca' : '1px solid #fef3c7',
        borderRadius: '10px', color: variant === 'alert' ? '#dc2626' : '#92400e',
        fontWeight: 600, fontSize: '13px', cursor: 'pointer',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all 0.2s ease',
        boxShadow: hovered ? '0 4px 12px rgba(245, 158, 11, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
        position: 'relative'
      }}
    >
      <Icon size={16} />
      {label}
      {count > 0 && (
        <span style={{
          position: 'absolute', top: '-6px', right: '-6px', background: '#dc2626',
          color: 'white', borderRadius: '50%', width: '20px', height: '20px',
          fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700
        }}>
          {count}
        </span>
      )}
    </button>
  );
};

// Enhanced time formatting function
const formatTimeAgo = (date) => {
  if (!date) return 'Never';
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return new Date(date).toLocaleDateString();
};

// Main Home Component
const Home = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [modal, setModal] = useState({ open: false, type: null, data: null });
  const [activeTab, setActiveTab] = useState('all');
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [newUserPopup, setNewUserPopup] = useState(null);
  const [lastChecked, setLastChecked] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000);
  const navigate = useNavigate();

  // Enhanced dashboard fetch with better error handling
  const fetchDashboard = useCallback(async (isBackgroundRefresh = false) => {
    try {
      if (!isBackgroundRefresh) {
        setError(null);
        refreshing ? setRefreshing(true) : setLoading(true);
      }

      const res = await axios.get(`${BASE_URL}/stats`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        }
      });

      setData(res.data.data);
      
      if (!isBackgroundRefresh) {
        await checkForNewUsers(res.data.data);
      }
      
    } catch (err) {
      if (!isBackgroundRefresh) {
        if (err.code === 'ERR_NETWORK') {
          setError("Cannot connect to server. Is the backend running on port 8000?");
        } else {
          setError(err.response?.data?.message || "Failed to load dashboard");
        }
        console.error("Dashboard fetch error:", err);
      }
    } finally {
      if (!isBackgroundRefresh) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [refreshing]);

  // Enhanced new user checking
  const checkForNewUsers = useCallback(async (currentData) => {
    try {
      const today = new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      const res = await axios.get(`${BASE_URL}/users?type=newToday&limit=10`, {
        withCredentials: true
      });
      
      const newUsers = res.data.data?.users || [];
      
      if (newUsers.length > 0) {
        const latestUser = newUsers[0];
        setNewUserPopup(latestUser);
        
        console.log(`🎉 New user registered: ${latestUser.name || latestUser.email}`);
      }
      
      setLastChecked(new Date());
    } catch (err) {
      console.error("Error checking for new users:", err);
    }
  }, [lastChecked]);

  // Enhanced user fetching with proper filtering for ACTIVE NOW and NEW TODAY
  const fetchUsers = useCallback(async (type = 'all') => {
    try {
      setUsersLoading(true);
      
      console.log(`🔍 Fetching users with type: ${type}`);

      let endpoint = `${BASE_URL}/users`;
      let params = { type };
      
      if (modal.type === 'users' && modal.cardType) {
        params.type = modal.cardType;
      }

      const res = await axios.get(endpoint, {
        params,
        withCredentials: true
      });
      
      let fetchedUsers = res.data.data?.users || [];
      
      // Filter for newToday specifically
      if (type === 'newToday') {
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        fetchedUsers = fetchedUsers.filter(user => {
          const userCreated = new Date(user.createdAt);
          return userCreated >= startOfToday;
        });
        console.log(`📅 Filtered ${fetchedUsers.length} users created today`);
      }
      
      // Filter for activeNow - users active in last 2 minutes
      if (type === 'active' || type === 'online') {
        const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
        fetchedUsers = fetchedUsers.filter(user => {
          const hasRecentLogin = user.lastLogin && new Date(user.lastLogin) > twoMinutesAgo;
          const isNotLoggedOut = !user.lastLogout || new Date(user.lastLogout) < new Date(user.lastLogin);
          
          const isOnlineInData = user.isOnlineNow || user.onlineStatus === 'online';
          
          return (hasRecentLogin && isNotLoggedOut) || isOnlineInData;
        });
        console.log(`🟢 Filtered ${fetchedUsers.length} active users (last 2 minutes)`);
      }
      
      console.log(`✅ Successfully fetched ${fetchedUsers.length} users for type: ${type}`);
      
      setUsers(fetchedUsers);
    } catch (err) {
      console.error("❌ Error fetching users:", err);
      
      // Fallback: Try the old endpoint with manual filtering
      try {
        console.log("🔄 Attempting fallback strategy...");
        const fallbackRes = await axios.get(`${BASE_URL}/users`, {
          withCredentials: true
        });
        
        let fallbackUsers = fallbackRes.data.data?.users || [];
        
        // Manual filtering as fallback with proper date filtering
        switch (type) {
          case 'pending':
            fallbackUsers = fallbackUsers.filter(user => !user.isVerified);
            break;
          case 'active':
          case 'online':
            const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
            fallbackUsers = fallbackUsers.filter(user => {
              const hasRecentLogin = user.lastLogin && new Date(user.lastLogin) > twoMinutesAgo;
              const isNotLoggedOut = !user.lastLogout || new Date(user.lastLogout) < new Date(user.lastLogin);
              const isOnlineInData = user.isOnlineNow || user.onlineStatus === 'online';
              
              return (hasRecentLogin && isNotLoggedOut) || isOnlineInData;
            });
            break;
          case 'premium':
            fallbackUsers = fallbackUsers.filter(user => user.userType === 'premium');
            break;
          case 'newToday':
            const today = new Date();
            const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            fallbackUsers = fallbackUsers.filter(user => {
              const userCreated = new Date(user.createdAt);
              return userCreated >= startOfToday;
            });
            break;
          default:
            // Keep all users
            break;
        }
        
        console.log(`🔄 Fallback: Found ${fallbackUsers.length} users for type: ${type}`);
        setUsers(fallbackUsers);
      } catch (fallbackErr) {
        console.error("❌ Fallback also failed:", fallbackErr);
        setUsers([]);
      }
    } finally {
      setUsersLoading(false);
    }
  }, [modal.type, modal.cardType]);

  // Enhanced bulk verification
  const bulkVerifyUsers = useCallback(async (userIds) => {
    try {
      const res = await axios.post(`${BASE_URL}/users/bulk-actions`, 
        { 
          action: "verify", 
          userIds 
        },
        { withCredentials: true }
      );
      
      console.log(`✅ ${res.data.data?.modifiedCount || userIds.length} users verified successfully`);
      
      // Refresh the users list
      if (modal.type === 'verifications' || activeTab === 'pending') {
        await fetchUsers('pending');
      }
      
      // Refresh dashboard stats
      await fetchDashboard();
      
      return res.data;
    } catch (err) {
      console.error("❌ Error bulk verifying users:", err);
      throw err;
    }
  }, [modal.type, activeTab, fetchUsers, fetchDashboard]);

  const handleVerifyUser = useCallback(async (userId) => {
    try {
      await bulkVerifyUsers([userId]);
    } catch (err) {
      console.error("Error verifying user:", err);
      alert('Failed to verify user. Please try again.');
    }
  }, [bulkVerifyUsers]);

  const handleBulkVerifyAll = useCallback(async () => {
    if (users.length === 0) return;
    
    const userIds = users.map(user => user._id);
    try {
      await bulkVerifyUsers(userIds);
    } catch (err) {
      console.error("Error bulk verifying all users:", err);
      alert('Failed to verify users. Please try again.');
    }
  }, [users, bulkVerifyUsers]);

  // Handle new user popup actions
  const handleViewNewUserDetails = useCallback((user) => {
    setNewUserPopup(null);
    setModal({ 
      open: true, 
      type: 'users', 
      cardType: 'newToday',
      tabs: [
        { id: 'newToday', label: 'New Today', count: data?.userStats?.newToday }
      ]
    });
    setActiveTab('newToday');
    fetchUsers('newToday');
  }, [data, fetchUsers]);

  // Enhanced auto-refresh system
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    let intervalId;

    if (autoRefresh) {
      intervalId = setInterval(() => {
        fetchDashboard(true);
      }, refreshInterval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoRefresh, refreshInterval, fetchDashboard]);

  // Enhanced modal handlers with proper card type detection
  const handleCardClick = useCallback(async (cardType) => {
    let modalData = { type: 'users', cardType };
    
    switch (cardType) {
      case 'totalUsers':
        modalData.tabs = [
          { id: 'all', label: 'All Users', count: data?.userStats?.totalUsers }
        ];
        break;
      case 'premiumUsers':
        modalData.tabs = [
          { id: 'premium', label: 'Premium Users', count: data?.userStats?.premiumUsers }
        ];
        break;
      case 'activeNow':
        modalData.tabs = [
          { id: 'online', label: 'Online Now', count: data?.userStats?.onlineNow }
        ];
        break;
      case 'newToday':
        modalData.tabs = [
          { id: 'newToday', label: 'New Today', count: data?.userStats?.newToday }
        ];
        break;
      case 'pendingVerifications':
        modalData.type = 'verifications';
        modalData.tabs = [
          { id: 'pending', label: 'Profile Incompleted', count: data?.adminStats?.pendingVerifications }
        ];
        break;
      case 'totalRevenue':
      case 'monthlyRevenue':
        modalData.type = 'revenue';
        modalData.tabs = [
          { id: 'overview', label: 'Revenue Overview' },
          { id: 'payments', label: 'Recent Payments', count: data?.recentPayments?.length }
        ];
        break;
      default:
        modalData.tabs = [
          { id: 'all', label: 'All Users', count: data?.userStats?.totalUsers }
        ];
    }

    setModal({ open: true, ...modalData });
    setActiveTab(modalData.tabs?.[0]?.id || 'all');
    
    if (modalData.type === 'users') {
      let fetchType = modalData.cardType;
      if (modalData.cardType === 'activeNow') {
        fetchType = 'online';
      }
      await fetchUsers(fetchType);
    } else if (modalData.type === 'verifications') {
      await fetchUsers(modalData.tabs[0].id);
    }
  }, [data, fetchUsers]);

  const handleTabChange = useCallback(async (tabId) => {
    setActiveTab(tabId);
    if (modal.type === 'users' || modal.type === 'verifications') {
      await fetchUsers(tabId);
    }
  }, [modal.type, fetchUsers]);

  const renderModalContent = () => {
    if (!modal.open) return null;

    switch (modal.type) {
      case 'users':
        return renderUsersContent();
      case 'revenue':
        return renderRevenueContent();
      case 'verifications':
        return renderVerificationsContent();
      default:
        return <div>Content not available</div>;
    }
  };

  const renderUsersContent = () => {
    if (usersLoading) {
      return (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>
          <RefreshCw size={48} className="animate-spin" color="#f59e0b" style={{ margin: '0 auto 16px' }} />
          <p>Loading users...</p>
        </div>
      );
    }

    const getModalTitle = () => {
      switch (modal.cardType) {
        case 'totalUsers': return 'All Users';
        case 'premiumUsers': return 'Premium Users';
        case 'activeNow': return 'Online Users (Real-time)';
        case 'newToday': return 'New Users Today';
        default: return 'Users';
      }
    };
    
    const getDescription = () => {
      switch (modal.cardType) {
        case 'newToday': 
          return `Users registered today (${new Date().toLocaleDateString()})`;
        case 'activeNow':
          return 'Users active in the last 2 minutes (Real-time tracking)';
        case 'premiumUsers':
          return 'Users with active premium plans';
        default:
          return 'All registered users';
      }
    };

    const showOnlineStatus = modal.cardType === 'activeNow';

    // Count actual online users
    const onlineUsersCount = users.filter(user => {
      const isOnlineNow = showOnlineStatus && (
        user.isOnlineNow || 
        user.onlineStatus === 'online' ||
        (user.lastLogin && new Date(user.lastLogin) > new Date(Date.now() - 2 * 60 * 1000) &&
         (!user.lastLogout || new Date(user.lastLogout) < new Date(user.lastLogin)))
      );
      return isOnlineNow;
    }).length;

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1f2937', margin: 0 }}>
              {getModalTitle()}
            </h3>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
              {getDescription()}
              {modal.cardType === 'activeNow' && (
                <span style={{ marginLeft: '8px', fontWeight: 600, color: '#059669' }}>
                  • {onlineUsersCount} currently online
                </span>
              )}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: '#6b7280', fontSize: '14px' }}>
              {users.length} users found
            </span>
            {modal.cardType === 'activeNow' && (
              <span style={{ 
                padding: '4px 8px', 
                background: '#ecfdf5', 
                color: '#059669',
                borderRadius: '6px', 
                fontSize: '12px', 
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Wifi size={12} />
                Live
              </span>
            )}
          </div>
        </div>

        {users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>
            <Users size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <h3>No users found</h3>
            <p>There are no users matching your criteria.</p>
          </div>
        ) : modal.cardType === 'activeNow' && onlineUsersCount === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>
            <WifiOff size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <h3>No users currently online</h3>
            <p>All users matching your criteria are currently offline.</p>
            <p style={{ fontSize: '12px', marginTop: '8px' }}>
              Showing {users.length} users who were recently active.
            </p>
          </div>
        ) : (
          <div>
            {users.map(user => (
              <UserProfileCard 
                key={user._id} 
                user={user} 
                onVerify={handleVerifyUser}
                showVerifyButton={activeTab === 'pending'}
                showOnlineStatus={showOnlineStatus}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderRevenueContent = () => {
    return (
      <div>
        {activeTab === 'overview' ? (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              <div style={{ background: '#fffbeb', padding: '20px', borderRadius: '12px', border: '1px solid #fef3c7' }}>
                <div style={{ fontSize: '14px', color: '#92400e', fontWeight: 600 }}>Total Revenue</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#1f2937' }}>
                  ${data?.paymentStats?.totalRevenue?.toLocaleString() || '0'}
                </div>
              </div>
              <div style={{ background: '#f0f9ff', padding: '20px', borderRadius: '12px', border: '1px solid #bae6fd' }}>
                <div style={{ fontSize: '14px', color: '#0369a1', fontWeight: 600 }}>Monthly Revenue</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#1f2937' }}>
                  ${data?.paymentStats?.monthlyRevenue?.toLocaleString() || '0'}
                </div>
              </div>
              <div style={{ background: '#f0fdf4', padding: '20px', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: '14px', color: '#166534', fontWeight: 600 }}>Successful Payments</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#1f2937' }}>
                  {data?.paymentStats?.successfulPayments || 0}
                </div>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Plan Distribution</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {Object.entries(data?.planDistribution || {}).map(([plan, count]) => (
                  <div key={plan} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600 }}>{plan}</span>
                    <span style={{ color: '#6b7280' }}>{count} users</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Recent Payments</h3>
            {data?.recentPayments?.length > 0 ? (
              data.recentPayments.map(payment => (
                <PaymentDetailCard key={payment.id} payment={payment} />
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>
                <CreditCard size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                <h3>No payments found</h3>
                <p>There are no recent payments to display.</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderVerificationsContent = () => {
    if (usersLoading) {
      return (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>
          <RefreshCw size={48} className="animate-spin" color="#f59e0b" style={{ margin: '0 auto 16px' }} />
          <p>Loading verification data...</p>
        </div>
      );
    }

    return (
      <div>
        {activeTab === 'pending' ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1f2937' }}>
                Profile Incompleted ({users.length})
              </h3>
              {users.length > 0 && (
                <button 
                  onClick={handleBulkVerifyAll}
                  style={{
                    padding: '8px 16px', background: '#059669', color: 'white',
                    border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  Verify All ({users.length})
                </button>
              )}
            </div>

            {users.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>
                <CheckCircle size={48} color="#059669" style={{ margin: '0 auto 16px' }} />
                <h3>All users are verified!</h3>
                <p>Great job keeping up with verifications.</p>
              </div>
            ) : (
              <div>
                {users.map(user => (
                  <UserProfileCard 
                    key={user._id} 
                    user={user} 
                    onVerify={handleVerifyUser}
                    showVerifyButton={true}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>
            <AlertTriangle size={48} color="#dc2626" style={{ margin: '0 auto 16px' }} />
            <h3>No reported profiles</h3>
            <p>There are no reported profiles at this time.</p>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#fff' }}>
        <RefreshCw size={48} className="animate-spin" color="#f59e0b" />
        <span style={{ marginLeft: 16, fontSize: '18px', color: '#92400e' }}>Loading Dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 30, textAlign: 'center' }}>
        <AlertTriangle size={64} color="#dc2626" />
        <h2 style={{ color: '#dc2626', margin: '16px 0' }}>Error</h2>
        <p>{error}</p>
        <button onClick={fetchDashboard} style={{ 
          marginTop: 16, padding: '12px 24px', background: '#f59e0b', 
          color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer',
          fontWeight: 600
        }}>
          Retry
        </button>
      </div>
    );
  }

  const d = data || {
    userStats: { totalUsers: 0, premiumUsers: 0, activeNow: 0, newToday: 0, realTimeOnline: 0 },
    paymentStats: { totalRevenue: 0, monthlyRevenue: 0, successfulPayments: 0 },
    adminStats: { pendingVerifications: 0 },
    recentPayments: [],
    planDistribution: {},
    recentTestimonials: []
  };

  return (
    <div style={{ minHeight: '100vh', background: 'white', fontFamily: '"Inter", sans-serif' }}>
      {/* Header */}
      <div style={{
        background: 'white', padding: '16px 30px', borderBottom: '2px solid #fffbeb',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={28} color="#f59e0b" />
            <span style={{ fontSize: '20px', fontWeight: 800, color: '#1f2937' }}>MatrimonyAdmin</span>
          </div>
          <div style={{
            display: 'flex', gap: '8px', background: '#f9fafb', padding: '8px 12px',
            borderRadius: '10px', alignItems: 'center', minWidth: '300px'
          }}>
            <Search size={16} color="#6b7280" />
            <input 
              type="text" 
              placeholder="Search anything..." 
              style={{ 
                border: 'none', 
                background: 'transparent', 
                outline: 'none', 
                width: '100%',
                fontSize: '14px'
              }} 
            />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Auto-refresh toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>Auto-refresh</span>
            <button 
              onClick={() => setAutoRefresh(!autoRefresh)}
              style={{
                padding: '6px 12px', 
                background: autoRefresh ? '#10b981' : '#f3f4f6',
                color: autoRefresh ? 'white' : '#6b7280',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {autoRefresh ? 'ON' : 'OFF'}
            </button>
          </div>
          
          <button 
            onClick={fetchDashboard} 
            style={{
              padding: '8px 16px', background: '#fffbeb', border: '1px solid #fef3c7',
              borderRadius: '8px', color: '#92400e', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <RefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%', background: '#fffbeb',
            border: '2px solid #fef3c7', display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer'
          }}>
            <Shield size={18} color="#f59e0b" />
          </div>
        </div>
      </div>

      <div style={{ padding: '30px', maxWidth: '1600px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#1f2937', marginBottom: '8px' }}>
            Dashboard Overview
          </h1>
          <p style={{ fontSize: '16px', color: '#6b7280' }}>
            Welcome back, Admin! Last updated: {new Date().toLocaleString()}
            {autoRefresh && <span style={{ color: '#10b981', marginLeft: '8px' }}>● Auto-refresh enabled</span>}
          </p>
        </div>

        {/* Quick Actions */}
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="#f59e0b" /> Quick Actions
          </h2>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <QuickActionButton 
              icon={UserCheck} 
              label="Verify Profiles" 
              count={d.adminStats.pendingVerifications}
              variant={d.adminStats.pendingVerifications > 0 ? "alert" : "primary"} 
              onClick={() => handleCardClick('pendingVerifications')}
            />
          </div>
        </section>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '32px' }}>
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '24px' }}>
              <ClickableStatCard 
                title="Total Users" 
                value={d.userStats.totalUsers} 
                icon={Users} 
                change={18} 
                subtitle="All registered members" 
                onClick={() => handleCardClick('totalUsers')}
              />
              <ClickableStatCard 
                title="Premium Members" 
                value={d.userStats.premiumUsers} 
                icon={Award} 
                change={25} 
                subtitle="Active paid plans" 
                onClick={() => handleCardClick('premiumUsers')}
              />
              <ClickableStatCard 
                title="Total Revenue" 
                value={d.paymentStats.totalRevenue} 
                icon={DollarSign} 
                change={32} 
                subtitle="All-time earnings" 
                onClick={() => handleCardClick('totalRevenue')}
              />
              <ClickableStatCard 
                title="This Month Revenue" 
                value={d.paymentStats.monthlyRevenue} 
                icon={CreditCard} 
                change={28} 
                subtitle="Current month" 
                onClick={() => handleCardClick('monthlyRevenue')}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
              <ClickableStatCard 
                title="Profile Incompleted" 
                value={d.adminStats.pendingVerifications} 
                icon={UserCheck} 
                alert={d.adminStats.pendingVerifications > 0}
                onClick={() => handleCardClick('pendingVerifications')}
              />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <ClickableStatCard 
              title="Online Now" 
              value={d.userStats.onlineNow} 
              icon={Activity} 
              subtitle={`${d.userStats.realTimeOnline || 0} real-time`} 
              onClick={() => handleCardClick('activeNow')}
              isOnline={true}
            />
            <ClickableStatCard 
              title="New Today" 
              value={d.userStats.newToday} 
              icon={TrendingUp} 
              subtitle="Fresh registrations" 
              onClick={() => handleCardClick('newToday')}
              isNew={d.userStats.newToday > 0}
            />
          </div>
        </div>

        {/* Main Content */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px', alignItems: 'start' }}>
          {/* Recent Payments */}
          <div style={{ 
            background: 'white', 
            borderRadius: '16px', 
            padding: '24px', 
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)', 
            border: '1px solid #f3f4f6',
            height: '500px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '20px',
              flexShrink: 0
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={20} color="#f59e0b" /> Recent Payments
              </h3>
              <button 
                onClick={() => handleCardClick('totalRevenue')}
                style={{
                  padding: '8px 16px', 
                  background: '#fffbeb', 
                  border: '1px solid #fef3c7',
                  borderRadius: '8px', 
                  color: '#92400e', 
                  fontWeight: 600, 
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                View All
              </button>
            </div>
            
            {/* Scrollable payments container */}
            <div style={{ 
              flex: 1, 
              overflowY: 'auto',
              paddingRight: '8px'
            }}>
              {d.recentPayments?.length > 0 ? (
                d.recentPayments.map((p) => (
                  <PaymentDetailCard key={p.id} payment={p} />
                ))
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '40px 20px', 
                  color: '#6b7280',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <CreditCard size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                  <p>No recent payments</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Success Stories */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Heart size={20} color="#f59e0b" /> Latest Success Stories
              </h3>
              {d.recentTestimonials?.length > 0 ? (
                d.recentTestimonials.map((t) => (
                  <div 
                    key={t.id} 
                    style={{ 
                      padding: '12px 0', 
                      borderBottom: '1px solid #f3f4f6',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => navigate('/testimonials')}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#fffbeb';
                      e.currentTarget.style.paddingLeft = '8px';
                      e.currentTarget.style.paddingRight = '8px';
                      e.currentTarget.style.marginLeft = '-8px';
                      e.currentTarget.style.marginRight = '-8px';
                      e.currentTarget.style.borderRadius = '8px';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.paddingLeft = '0';
                      e.currentTarget.style.paddingRight = '0';
                      e.currentTarget.style.marginLeft = '0';
                      e.currentTarget.style.marginRight = '0';
                      e.currentTarget.style.borderRadius = '0';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong style={{ fontSize: '14px' }}>{t.name}</strong>
                      <div>{[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < (t.rating || 5) ? '#f59e0b' : '#e5e7eb'} color="#f59e0b" />)}</div>
                    </div>
                    <p style={{ 
                      fontSize: '13px', 
                      color: '#6b7280', 
                      margin: '8px 0',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      whiteSpace: 'normal',
                      lineHeight: '1.4'
                    }}>{t.message}</p>
                    <small style={{ color: '#9ca3af' }}>Married on {t.weddingDate || 'Unknown Date'}</small>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                  <Heart size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                  <p>No success stories yet</p>
                </div>
              )}
            </div>

            {/* Plan Distribution */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
                <Award size={18} color="#f59e0b" style={{ display: 'inline', marginRight: '8px' }} />
                Active Plan Distribution
              </h4>
              {Object.entries(d.planDistribution).length > 0 ? (
                Object.entries(d.planDistribution).map(([plan, count]) => {
                  const total = Object.values(d.planDistribution).reduce((a, b) => a + b, 0);
                  const percent = Math.round((count / total) * 100);
                  return (
                    <div 
                      key={plan} 
                      style={{ 
                        marginBottom: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => navigate(`/userinfo?plan=${plan}`)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateX(8px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ 
                          padding: '4px 8px', 
                          background: '#fffbeb', 
                          color: '#92400e',
                          borderRadius: '6px', 
                          fontSize: '11px', 
                          fontWeight: 700,
                          wordWrap: 'break-word',
                          maxWidth: '70%'
                        }}>
                          {plan}
                        </span>
                        <span style={{ fontWeight: 600, fontSize: '12px' }}>{count} ({percent}%)</span>
                      </div>
                      <div style={{ height: '6px', background: '#f3f4f6', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${percent}%`, height: '100%', background: 'linear-gradient(90deg, #f59e0b, #fbbf24)', borderRadius: '3px' }} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                  <Award size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                  <p>No plan data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Modal */}
      {modal.open && (
        <DetailModal 
          title={
            modal.type === 'users' ? 'User Management' :
            modal.type === 'revenue' ? 'Revenue Analytics' :
            modal.type === 'verifications' ? 'Verification Center' : 'Details'
          }
          onClose={() => setModal({ open: false, type: null, data: null })}
          tabs={modal.tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        >
          {renderModalContent()}
        </DetailModal>
      )}

      {/* New User Popup */}
      {newUserPopup && (
        <NewUserPopup 
          user={newUserPopup}
          onClose={() => setNewUserPopup(null)}
          onViewDetails={handleViewNewUserDetails}
          autoClose={true}
        />
      )}

      {/* Enhanced CSS animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes progressBar {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default Home;