import React, { useEffect, useState } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  Lock,
  Mail,
  ArrowLeft,
  Loader2,
  ChevronRight,
  Shield,
  User2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const LoginSignup = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            setCanResend(true);
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);

      return () => clearInterval(countdown);
    }
  }, [timer]);

  const navigate = useNavigate();
  const slideVariants = {
    enter: { x: 100, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -100, opacity: 0 },
  };

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://192.168.83.1:8000/login",
        {
          username: email, // Backend expects 'username' field
          password,
        }
      );

      // Check if login was successful based on your backend response
      if (response.data.success) {
        setStep(3);
        // Start the OTP timer when moving to verification step
        setTimer(180); // 3 minutes
        setCanResend(false);
      }
    } catch (err) {
      // Handle different error response formats from your FastAPI backend
      let errorMessage = "Something went wrong.";
      
      if (err.response?.data?.detail) {
        // Handle FastAPI HTTPException format
        if (typeof err.response.data.detail === 'object' && err.response.data.detail.message) {
          errorMessage = err.response.data.detail.message;
        } else if (typeof err.response.data.detail === 'string') {
          errorMessage = err.response.data.detail;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const validateOtp = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://192.168.83.1:8000/verify-2fa",
        {
          username: email, // Backend expects 'username' field
          code: verificationCode,
        }
      );

      // Destructure the response data
      const { 
        access_token, 
        username, 
        isAdmin, 
        Pinned_chats, 
        Previous_chats 
      } = response.data;

      // Save multiple items to localStorage
      localStorage.setItem("token", access_token);
      localStorage.setItem("username", username);
      localStorage.setItem("isAdmin", JSON.stringify(isAdmin));
      localStorage.setItem("pinnedChats", JSON.stringify(Pinned_chats));
      localStorage.setItem("previousChats", JSON.stringify(Previous_chats));

      window.location.href = 'http://localhost:8080/';
    } catch (err) {
      // Handle error response from your backend
      let errorMessage = "Invalid verification code or server error.";
      
      if (err.response?.data?.detail) {
        if (typeof err.response.data.detail === 'string') {
          errorMessage = err.response.data.detail;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    // Only allow resend if timer is 0 and canResend is true
    if (timer === 0 && canResend) {
      try {
        setLoading(true);
        setError("");

        // Fixed: Use query parameter as expected by your backend
        const response = await axios.post(
          `http://192.168.83.1:8000/resend_otp?user_trying_to_login=${encodeURIComponent(email)}`
        );

        // Check if resend was successful
        if (response.data.success) {
          // Reset timer and prevent immediate resend
          setTimer(180); // 3 minutes
          setCanResend(false);
          
          console.log('OTP Resent Successfully', response.data);
        }
      } catch (err) {
        // Handle any errors during OTP resend
        let errorMessage = 'Failed to resend OTP';
        
        if (err.response?.data?.detail?.message) {
          errorMessage = err.response.data.detail.message;
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        setError(errorMessage);
        console.error('OTP Resend Error:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            key="username"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="w-full space-y-6"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-gray-100">
                MetaCommerce AI
              </h2>
              <p className="text-gray-400">Enter your username</p>
            </div>

            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                setStep(2);
              }}
            >
              {error && (
                <div className="p-3 text-center text-red-300 border border-red-800 rounded-lg bg-red-900/40">
                  {error}
                </div>
              )}

              <div className="relative">
                <input
                  type="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 pl-12 text-gray-100 border rounded-lg bg-gray-800/50 border-blue-900/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500"
                  placeholder="Username here"
                  required
                />
                <User2 className="absolute w-4 h-4 text-blue-400 -translate-y-1/2 left-4 top-1/2" />
              </div>

              <button
                type="submit"
                className="flex items-center justify-center w-full gap-2 py-3 text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-blue-900 to-blue-700 group hover:shadow-lg hover:shadow-blue-900/20"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <span>Continue</span>
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
              <div className="flex justify-center align-center">
                <button className="text-blue-400 transition-colors hover:text-blue-300" onClick={()=>{navigate('/signup')}}>
                  Don't have an account? Sign up
                </button>
              </div>
              
            </form>
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            key="password"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="w-full space-y-6"
          >
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 text-gray-400 transition-colors hover:text-blue-300"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-gray-100">Secure Access</h2>
              <p className="text-gray-400">Enter your credentials</p>
            </div>

            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}
            >
              {error && (
                <div className="p-3 text-center text-red-300 border border-red-800 rounded-lg bg-red-900/40">
                  {error}
                </div>
              )}

              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pl-12 text-gray-100 border rounded-lg bg-gray-800/50 border-blue-900/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500"
                  placeholder="Enter secure password"
                  required
                />
                <Lock className="absolute w-4 h-4 text-blue-400 -translate-y-1/2 left-4 top-1/2" />
              </div>

              <button
                type="submit"
                className="flex items-center justify-center w-full gap-2 py-3 text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-blue-900 to-blue-700 group hover:shadow-lg hover:shadow-blue-900/20"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <span>Verify Credentials</span>
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            key="verification"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="w-full space-y-6"
          >
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-2 text-gray-400 transition-colors hover:text-blue-300"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
        
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-gray-100">Two-Factor Authentication</h2>
              <p className="text-gray-400">
                Enter verification code sent to
                <br />
                <span className="text-blue-300 text-1xl">{email}</span>
              </p>
            </div>
        
            <div className="space-y-4">
              {error && (
                <div className="p-3 text-center text-red-300 border border-red-800 rounded-lg bg-red-900/40">
                  {error}
                </div>
              )}
        
              <div className="flex justify-center gap-2">
                {[...Array(6)].map((_, i) => (
                  <input
                    key={i}
                    type="text"
                    maxLength={1}
                    className="w-10 h-10 text-xl text-center text-blue-100 border rounded-lg bg-gray-800/50 border-blue-900/50 sm:w-12 sm:h-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={verificationCode[i] || ""}
                    onChange={(e) => {
                      const newCode = verificationCode.split("");
                      newCode[i] = e.target.value;
                      setVerificationCode(newCode.join(""));
                      if (e.target.value && e.target.nextElementSibling) {
                        e.target.nextElementSibling.focus();
                      }
                    }}
                  />
                ))}
              </div>
        
              <button
                onClick={validateOtp}
                className="flex items-center justify-center w-full gap-2 py-3 text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-blue-900 to-blue-700 group hover:shadow-lg hover:shadow-blue-900/20"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <span>Verify & Access Platform</span>
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
        
              <div className="flex items-center justify-between">
                <button 
                  onClick={handleResendOtp}
                  disabled={timer > 0}
                  className={`w-full text-sm transition-colors 
                    ${timer > 0 
                      ? 'text-gray-600 cursor-not-allowed' 
                      : 'text-blue-400 hover:text-blue-300 hover:underline'
                    }`}
                >
                  {timer > 0 
                    ? `Resend OTP in ${timer} seconds` 
                    : 'Resend Verification Code'
                  }
                </button>
              </div>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  // Mobile background component
  const MobileBackground = () => (
    <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-blue-900 opacity-90" />
  );

  return (
    <div className="flex flex-col w-full min-h-screen overflow-hidden bg-black lg:flex-row">
      {/* Visual Side - Hidden on mobile, shown on desktop */}
      <div className="relative flex items-center justify-center w-full min-h-screen p-6 lg:w-1/2 sm:p-8">
        {/* Show gradient background only on mobile */}
        <div className="block lg:hidden">
          <MobileBackground />
        </div>

        <div className="relative w-full max-w-md p-8 mx-auto border shadow-2xl shadow-blue-900/20 border-blue-900/10 rounded-xl">
          <div className="mb-12">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2"
            >
              <Shield className="w-8 h-8 text-blue-400" />
              <h1 className="text-3xl font-bold text-gray-100">
                Here Technologies
              </h1>
            </motion.div>
          </div>

          <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
        </div>
      </div>
      <div className="relative hidden w-1/2 shadow-lg center w-1/2overflow-hidden bg-gradient-to-br from-black via-gray-900 to-blue-900 lg:block">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="relative w-full">
            <motion.div
              animate={{
                rotate: 360,
                scale: [1, 1.1, 1],
              }}
              transition={{
                rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
              }}
              className="absolute inset-0 text-center rounded-full opacity-20 blur-2xl"
            />
            <img src="/bottt_image.png" alt="" className="w-full filter drop-shadow-lg" />
          </div>
        </motion.div>

        {/* Animated Lines */}
        <div className="absolute inset-0">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{
                duration: 3,
                delay: i * 0.4,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-30"
              style={{ top: `${20 + i * 15}%` }}
            />
          ))}
        </div>

        {/* blue glow effects */}
        <div className="absolute w-64 h-64 bg-blue-600 rounded-full top-1/4 left-1/4 filter blur-3xl opacity-10"></div>
        <div className="absolute bg-blue-800 rounded-full bottom-1/3 right-1/3 w-80 h-80 filter blur-3xl opacity-10"></div>
      </div>
    </div>
  );
};

export default LoginSignup;