import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  registeradmin, 
  clearAlladminErrors, 
  clearAlladminMessages,
  clearRegistrationState  // ✅ IMPORTANT: Add this import
} from '../../store/slices/adminSlice';

export function SignUp() {
  const [formData, setFormData] = useState({
    adminName: '',
    adminEmailId: '',
    adminPassword: '',
    confirmPassword: '',
    termsAccepted: false,
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isRegistered } = useSelector((state) => state.admin);

  // Handle success → go directly to login
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAlladminErrors());
    }

    if (isRegistered) {
      toast.success('Registration successful! You can now log in.');
      
      // Clear registration state and redirect to login
      setTimeout(() => {
        dispatch(clearAlladminMessages());
        dispatch(clearRegistrationState()); // ✅ Clear registration state
        navigate('/auth/sign-in', { replace: true });
      }, 1500); // Small delay to show success message
    }
  }, [error, isRegistered, dispatch, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.adminName.trim()) return toast.error('Please enter your name');
    if (!formData.adminEmailId.trim()) return toast.error('Please enter your email');
    if (!formData.adminPassword) return toast.error('Please create a password');

    if (!/\S+@\S+\.\S+/.test(formData.adminEmailId)) {
      return toast.error('Please enter a valid email address');
    }

    if (formData.adminPassword !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    if (formData.adminPassword.length < 8) {
      return toast.error('Password must be at least 8 characters');
    }

    if (!formData.termsAccepted) {
      return toast.error('Please accept the Terms and Conditions');
    }

    const registrationData = {
      adminName: formData.adminName.trim(),
      adminEmailId: formData.adminEmailId.trim(),
      adminPassword: formData.adminPassword,
    };

    dispatch(registeradmin(registrationData));
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#E9DDCF] overflow-hidden">
      <ToastContainer position="top-right" autoClose={4000} theme="light" />

      <div className="flex flex-col md:flex-row items-center justify-center p-6 gap-16 max-w-7xl mx-auto flex-1">

        {/* Left: Branding */}
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-red-700 mb-6">
            वसुधैव कुटुंबकम्
          </h1>
          <p className="text-xl md:text-2xl text-red-800 leading-relaxed">
            Vedic Indian Vivah - Authentic Holy Alliances of
            <br />
            <span className="text-red-900 font-semibold">North American Matrimony</span>
          </p>
        </div>

        {/* Right: Sign Up Form */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 w-full max-w-md">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-red-700">CREATE YOUR ACCOUNT</h2>
            <p className="text-gray-600 mt-2">Join our sacred matrimony platform</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            <input
              type="text"
              name="adminName"
              placeholder="Full Name"
              value={formData.adminName}
              onChange={handleChange}
              required
              className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:border-pink-600 focus:outline-none transition"
            />

            <input
              type="email"
              name="adminEmailId"
              placeholder="Email Address"
              value={formData.adminEmailId}
              onChange={handleChange}
              required
              className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:border-pink-600 focus:outline-none transition"
            />

            <input
              type="password"
              name="adminPassword"
              placeholder="Create Password"
              value={formData.adminPassword}
              onChange={handleChange}
              required
              className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:border-pink-600 focus:outline-none transition"
            />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:border-pink-600 focus:outline-none transition"
            />

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleChange}
                required
                className="mt-1 w-5 h-5 text-pink-600 rounded cursor-pointer"
              />
              <label className="text-sm text-gray-700">
                I agree to the <Link to="/terms" className="text-pink-600 font-bold underline hover:text-pink-700">Terms & Conditions</Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-600 to-red-500 text-white font-bold text-lg py-4 rounded-xl 
                       hover:shadow-2xl transform hover:-translate-y-1 transition-all disabled:opacity-60"
            >
              {loading ? 'Creating Account...' : 'SIGN UP'}
            </button>

            <p className="text-center text-gray-600 mt-6">
              Already have an account?{' '}
              <Link to="/auth/sign-in" className="text-pink-600 font-bold hover:text-pink-700">
                Login here
              </Link>
            </p>
          </form>

          <p className="text-center text-xs text-gray-500 mt-10 border-t pt-6">
            Your data is secure and never shared with third parties.
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUp;