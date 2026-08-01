// Inside ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import api from '../../api';
// ... Keep your icon imports
import { Camera, User, Phone, LogOut, Lock, ChevronDown } from 'lucide-react';


const ProfilePage = ({ isProfileMode = false, userData, onSave, onLogout }) => {
  const [mode, setMode] = useState(isProfileMode);
   
  // Pre-fill with data from Google Auth
  const [name, setName] = useState(userData?.name || "");
  const [photoUrl, setPhotoUrl] = useState(userData?.photoUrl || ""); 
  const [gender, setGender] = useState(userData?.gender || ""); 
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState(userData?.phone?.replace('+91', '') || "");

  const handleNameChange = (e) => {
    const val = e.target.value.replace(/[^a-zA-Z\s]/g, ''); // Allow only letters and spaces
    setName(val);
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, ''); // Allow only digits
    if (val.length <= 10) {
      setPhone(val);
    }
  };

  const handleCountryCodeChange = (e) => {
    const val = e.target.value;
    if (/^\+?\d*$/.test(val) && val.length <= 5) {
      setCountryCode(val);
    }
  };

  const isFormValid = name.trim().length >= 2 && gender !== "" && phone.length === 10 && countryCode.length >= 2;
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isFormValid) {
      try {
        const fullPhone = `${countryCode}${phone}`;
        const response = await api.post('/auth/update-profile', {
          userId: userData._id,
          name,
          gender,
          phone: fullPhone
        });

        if (response.data.success) {
          localStorage.setItem('swilaUser', JSON.stringify(response.data.user));
          if (onSave) onSave(response.data.user);
        }
      } catch (error) {
        console.error("Error saving profile", error);
      }
    }
  };

  // ... The rest of your JSX remains exactly the same! Keep your beautiful UI. 

  
  const handleLogout = () => {
    setMode(false); 
    if (onLogout) onLogout();
  };

  return (
    // FIX 1: h-[100dvh] change to min-h-[100dvh] . 
    // FIX 2: overflow-hidden change to overflow-y-auto  (for scrolling).
    // FIX 3: pb-32 (big padding) give, so   under bottombar the card never covered.
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-gradient-to-b from-[#7FE2E3] via-[#9DCBF7] to-[#C69CF7] px-5 py-10 pb-32 overflow-y-auto">
      
      {/* 
        FIX 4: h-[580px] change to min-h-[580px] . 
        now even if the screen small the card tetap and can scroll to bottom . 
      */}
      <div className="w-full max-w-[360px] min-h-[580px] bg-white/90 backdrop-blur-sm rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] px-6 py-6 flex flex-col my-auto mt-4">
        
        <div className="flex-shrink-0 mb-4">
          <h2 className="text-[22px] font-bold text-[#475270] text-center leading-tight">
            {mode ? "Your Profile" : "Complete Profile"}
          </h2>
          <p className="text-slate-500 text-[13px] text-center mt-1">
            {mode ? "Update your personal details below." : "Just a couple of details left."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between">
          
          <div className="space-y-4">
            {/* Profile Picture */}
            <div className="flex justify-center mb-2">
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#9DCBF7] to-[#C69CF7] flex items-center justify-center border-[3px] border-white shadow-sm overflow-hidden">
                {photoUrl ? (
                  <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-white" />
                )}
                <button 
                  type="button" 
                  className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-md border border-slate-100 active:scale-95 transition-transform"
                >
                  <Camera className="w-3.5 h-3.5 text-slate-600" />
                </button>
              </div>
            </div>

            {/* Name Input */}
            <div className="space-y-1">
              <label className="text-[12px] font-semibold text-slate-700 ml-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  {gender === 'Female' ? (
                    <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="10" r="5"></circle><line x1="12" y1="15" x2="12" y2="22"></line><line x1="9" y1="19" x2="15" y2="19"></line></svg>
                  ) : gender === 'Male' ? (
                    <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="10" cy="14" r="5"></circle><line x1="13.54" y1="10.46" x2="21" y2="3"></line><polyline points="16 3 21 3 21 8"></polyline></svg>
                  ) : (
                    <User className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <input 
                  type="text" 
                  value={name}
                  onChange={handleNameChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#9DCBF7]/40 focus:border-[#9DCBF7] transition-all text-slate-800 text-[14px]"
                  placeholder="Your Name"
                />
              </div>
            </div>

            {/* Gender Field */}
            <div className="space-y-1">
              <div className="flex items-center justify-between ml-1 mr-1">
                <label className="text-[12px] font-semibold text-slate-700">Gender</label>
                {mode && (
                  <span className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold bg-slate-100 px-2 py-0.5 rounded-md">
                    <Lock className="w-2.5 h-2.5" /> Cannot change
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {['Male', 'Female', 'Other'].map((g) => {
                  const isSelected = gender === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      disabled={mode}
                      onClick={() => !mode && setGender(g)}
                      className={`py-2 px-2 rounded-2xl text-[13px] font-semibold transition-all ${
                        isSelected 
                          ? 'bg-gradient-to-br from-[#9DCBF7] to-[#C69CF7] text-white shadow-sm border-2 border-transparent' 
                          : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                      } ${mode && !isSelected ? 'opacity-40 cursor-not-allowed' : ''} 
                        ${mode && isSelected ? 'cursor-default' : ''}`}
                    >
                      {g} 
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Phone Number Input */}
            <div className="space-y-1">
              <label className="text-[12px] font-semibold text-slate-700 ml-1">Phone Number</label>
              <div className="flex gap-2">
                <div className="relative w-[75px] flex-shrink-0">
                  <input 
                    type="text"
                    value={countryCode}
                    onChange={handleCountryCodeChange}
                    className="w-full h-full bg-white border border-slate-200 rounded-2xl px-2 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#9DCBF7]/40 focus:border-[#9DCBF7] text-slate-800 text-[14px] font-medium transition-all text-center"
                    placeholder="+91"
                  />
                </div>

                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Phone className="w-4 h-4 text-slate-400" />
                  </div>
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={handlePhoneChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#9DCBF7]/40 focus:border-[#9DCBF7] transition-all text-slate-800 text-[14px]"
                    placeholder="00000 00000"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Button Section */}
          <div className="mt-6 space-y-3">
            <button 
              type="submit"
              disabled={!isFormValid}
              className={`w-full py-3.5 rounded-full font-semibold transition-all duration-300 ${
                isFormValid 
                  ? 'bg-gradient-to-r from-[#7FE2E3] via-[#9DCBF7] to-[#C69CF7] text-white shadow-md shadow-[#9DCBF7]/30 hover:brightness-105 active:scale-[0.98]' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {mode ? "Save Changes" : "Save & Enter App"}
            </button>

            {mode ? (
              <button 
                type="button"
                onClick={handleLogout}
                className="w-full py-3.5 rounded-full font-semibold flex items-center justify-center gap-2 bg-white border border-rose-200 text-rose-500 hover:bg-rose-50 active:scale-[0.98] transition-all duration-300"
              >
                <LogOut className="w-4 h-4" /> Log Out
              </button>
            ) : (
              // Empty placeholder space
              <div className="h-[50px] w-full"></div> 
            )}
          </div>
        </form>
      </div>
    </div>      
  );
};

export default ProfilePage;
