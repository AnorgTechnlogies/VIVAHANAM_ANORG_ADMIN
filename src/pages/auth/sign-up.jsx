import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { registerDoctor } from '../../store/slices/doctorSlice';

export function SignUp() {
  const [formData, setFormData] = useState({
    doctorName: '',
    doctorEmailId: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
    profileImage: null
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isRegistered } = useSelector((state) => state.doctor);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
    if (isRegistered) {
      toast.success('Registration successful!');
      navigate('/dashboard');
    }
  }, [error, isRegistered, navigate]);

  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'profileImage' ? files[0] : value)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.doctorName || !formData.doctorEmailId || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!formData.termsAccepted) {
      toast.error('Please accept the Terms and Conditions');
      return;
    }

    const registrationData = new FormData();
    registrationData.append('adminName', formData.doctorName);
    registrationData.append('adminEmailId', formData.doctorEmailId);
    registrationData.append('adminPassword', formData.password);
    registrationData.append('adminLocation', "LocationData");
    registrationData.append('adminMobileNo', "9171976922");
    if (formData.profileImage) {
      registrationData.append('adminImagelink', formData.profileImage);
    }

    dispatch(registerDoctor(registrationData));
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
        {/* Left side - Welcome Section */}
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

        {/* Right side - Sign Up Form */}
        <div className="flex-1 bg-white/95 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-xl max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-red-700 text-3xl mb-2.5 font-bold">
              CREATE YOUR ACCOUNT
            </h1>
            <p className="text-gray-600">Join our sacred matrimony platform</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Admin Name</label>
              <input
                type="text"
                name="doctorName"
                placeholder="Enter your name"
                value={formData.doctorName}
                onChange={handleChange}
                required
                className="p-4 border-2 border-gray-200 rounded-xl text-base transition-colors focus:border-pink-600 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Email Address</label>
              <input
                type="email"
                name="doctorEmailId"
                placeholder="Enter your email"
                value={formData.doctorEmailId}
                onChange={handleChange}
                required
                className="p-4 border-2 border-gray-200 rounded-xl text-base transition-colors focus:border-pink-600 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Password</label>
              <input
                type="password"
                name="password"
                placeholder="Create password"
                value={formData.password}
                onChange={handleChange}
                required
                className="p-4 border-2 border-gray-200 rounded-xl text-base transition-colors focus:border-pink-600 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="p-4 border-2 border-gray-200 rounded-xl text-base transition-colors focus:border-pink-600 focus:outline-none"
              />
            </div>

            <div className="flex items-start gap-2 mt-2">
              <input
                type="checkbox"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleChange}
                className="mt-1 w-4 h-4 cursor-pointer"
                required
              />
              <label className="text-sm text-gray-700 cursor-pointer">
                I agree to the{" "}
                <Link to="/terms" className="text-pink-600 hover:text-pink-700 underline font-semibold">
                  Terms and Conditions
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-pink-600 to-red-400 text-white border-none p-4 rounded-xl text-lg font-bold cursor-pointer hover:-translate-y-0.5 transition-transform disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Creating Account..." : "SIGN UP"}
            </button>

            <div className="text-center mt-2">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link to="/auth/sign-in" className="text-pink-600 font-bold hover:text-pink-700">
                  Login
                </Link>
              </p>
            </div>
          </form>

          <div className="mt-8 pt-5 border-t border-gray-200 text-center text-xs text-gray-400 leading-relaxed">
            <p>
              By signing up you accept Terms & Conditions, Privacy Policy and
              Cookie Policy. However we do not use any third party vendor to
              share your data and its safe with us.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;