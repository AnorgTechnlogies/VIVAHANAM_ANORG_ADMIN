import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { login, clearAlladminErrors, clearAlladminMessages } from '../../store/slices/adminSlice';

export function SignIn() {
  const [formData, setFormData] = useState({
    adminEmailId: '',
    adminPassword: '',
    rememberMe: false,
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated, message, token } = useSelector((state) => state.admin);

  useEffect(() => {
    // Load saved email if rememberMe was previously set
    const savedData = localStorage.getItem('rememberMe');
    if (savedData) {
      setFormData((prev) => ({ ...prev, adminEmailId: JSON.parse(savedData).adminEmailId }));
    }
    // Handle errors
    if (error) {
      toast.error(error);
      dispatch(clearAlladminErrors());
    }
    // Handle successful login
    if (message && isAuthenticated && token) {
      localStorage.setItem('adminToken', token); // Store token
      console.log('Stored Token:', token); // Debug
      toast.success(message);
      dispatch(clearAlladminMessages());
      navigate('/dashboard');
    }
  }, [error, message, isAuthenticated, token, navigate, dispatch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate inputs
    if (!formData.adminEmailId || !formData.adminPassword) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.adminEmailId)) {
      toast.error('Please enter a valid email address');
      return;
    }
    // Handle rememberMe
    if (formData.rememberMe) {
      localStorage.setItem('rememberMe', JSON.stringify({ adminEmailId: formData.adminEmailId }));
    } else {
      localStorage.removeItem('rememberMe');
    }
    // Dispatch login action
    dispatch(login(formData.adminEmailId, formData.adminPassword));
  };

  return (
    <div className="min-h-screen flex flex-col font-sans relative overflow-hidden bg-[#E9DDCF]">
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
      />
      <div className="flex flex-col md:flex-row items-center justify-center p-5 md:gap-20 max-w-6xl mx-auto flex-1">
        <div className="flex-1 text-center px-4">
          <div className="text-5xl md:text-6xl font-bold mb-6 text-red-700">
            वसुधैव कुटुंबकम्
          </div>
          <div className="text-lg md:text-xl mb-4 text-red-800 leading-relaxed">
            Vedic Indian Vivah - Authentic Holy Alliances of
            <br />
            <span className="text-red-900">North American Matrimony</span>
          </div>
        </div>
        <div className="flex-1 bg-white/95 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-xl max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-red-700 text-3xl mb-2.5 font-bold">
              WELCOME BACK!
            </h1>
            <p className="text-gray-600">वसुधैव कुटुंबकम्</p>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Email Address</label>
              <input
                type="email"
                name="adminEmailId"
                placeholder="Enter your email"
                value={formData.adminEmailId}
                onChange={handleChange}
                required
                className="p-4 border-2 border-gray-200 rounded-xl text-base transition-colors focus:border-pink-600 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Password</label>
              <input
                type="password"
                name="adminPassword"
                placeholder="Enter your password"
                value={formData.adminPassword}
                onChange={handleChange}
                required
                className="p-4 border-2 border-gray-200 rounded-xl text-base transition-colors focus:border-pink-600 focus:outline-none"
              />
            </div>
            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span className="text-gray-700">Keep me logged in</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-pink-600 hover:text-pink-700 font-semibold underline"
              >
                Forgot Password?
              </Link>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-pink-600 to-red-400 text-white border-none p-4 rounded-xl text-lg font-bold cursor-pointer hover:-translate-y-0.5 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Logging in...
                </span>
              ) : (
                'LOGIN'
              )}
            </button>
            <div className="text-center mt-2">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link to="/auth/sign-up" className="text-pink-600 font-bold hover:text-pink-700">
                  Sign Up
                </Link>
              </p>
            </div>
          </form>
          <div className="mt-8 pt-5 border-t border-gray-200 text-center text-xs text-gray-400 leading-relaxed">
            <p>
              By signing in you accept Terms & Conditions, Privacy Policy and Cookie Policy. However we do not use any
              third party vendor to share your data and its safe with us.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignIn;