// src/components/chatapp/AuthScreen.jsx
import React from "react";
import { useGoogleLogin } from '@react-oauth/google';
import logo from "../../assets/logo.png"; 

export default function AuthPage({ onLoginSuccess }) {
  // Trigger standard Google pop-up but tied to your custom button
  const login = useGoogleLogin({
    onSuccess: onLoginSuccess,
    onError: () => console.log('Login Failed'),
    flow: 'implicit' // Gets the token needed for backend
  });

 
  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-gradient-to-b from-[#7FE2E3] via-[#9DCBF7] to-[#C69CF7]">
      <div className="w-full max-w-sm flex flex-col items-center justify-center px-6 text-center">
        
        <img src={logo} alt="Logo" className="w-56 h-56 object-contain drop-shadow-2xl scale-150 mb-4" />

        <h1 className="mt-8 text-[28px] font-bold font-sans text-center text-[#475270] leading-tight">
          Welcome to Swila<br />Connect with ease
        </h1>

        <button
          type="button"
          onClick={() => login()} // Hooked up to Google Auth!
          className="mt-12 mb-10 w-full max-w-[320px] bg-white rounded-full shadow-[0_12px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.16)] active:scale-95 transition-all duration-200 flex items-center justify-center gap-3 py-4 px-6"
        >
          {/* Keep your Google SVG here exactly as you had it */}
          <span className="text-[17px] font-medium text-slate-800">
            Continue with Google
          </span>
        </button>
      </div>
    </div>
  );
}