import React, { useState, useEffect } from 'react';
import { Phone, ShieldCheck, ArrowRight, RotateCw, CheckCircle2, AlertCircle } from 'lucide-react';

/**
 * Modern Standalone Phone Authentication (Twilio Verify 2FA) Component
 * 
 * Props:
 * - backendUrl (optional): URL of Node.js backend (defaults to http://localhost:5000)
 * - onVerificationSuccess (optional): Callback function executed when OTP is verified
 */
export const PhoneAuth = ({ backendUrl = 'http://localhost:5000', onVerificationSuccess }) => {
  // Step 1 vs Step 2 UI State
  const [step, setStep] = useState(1); // 1 = Phone Input, 2 = OTP Input

  // Inputs
  const [countryCode, setCountryCode] = useState('+91');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');

  // Status & Feedback States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  // Countdown timer for Resend OTP
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // Clean full E.164 phone number construction
  const getFullPhoneNumber = () => {
    const cleaned = mobileNumber.trim().replace(/\D/g, '');
    return `${countryCode}${cleaned}`;
  };

  /**
   * Step 1: Send OTP to Phone Number
   */
  const handleSendOTP = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanedDigits = mobileNumber.trim().replace(/\D/g, '');
    if (!cleanedDigits || cleanedDigits.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    const fullPhone = getFullPhoneNumber();

    try {
      setLoading(true);
      const response = await fetch(`${backendUrl}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone, phoneNumber: fullPhone })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.errorMessage || data.message || data.error || 'Failed to send OTP code.');
      }

      setSuccessMsg(`OTP sent successfully to ${fullPhone}`);
      setStep(2);
      setCountdown(30); // 30 second resend timer
    } catch (err) {
      console.error('[Send OTP Error]:', err);
      setErrorMsg(err.message || 'Unable to send OTP. Please check your phone number and try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Step 2: Verify 6-digit OTP Code
   */
  const handleVerifyOTP = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanOtp = otpCode.trim().replace(/\D/g, '');
    if (cleanOtp.length !== 6) {
      setErrorMsg('Please enter a valid 6-digit OTP code.');
      return;
    }

    const fullPhone = getFullPhoneNumber();

    try {
      setLoading(true);
      const response = await fetch(`${backendUrl}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: fullPhone,
          phoneNumber: fullPhone,
          otp: cleanOtp,
          otpCode: cleanOtp
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.verified) {
        throw new Error(data.errorMessage || data.message || data.error || 'Invalid OTP code. Please check and try again.');
      }

      setIsVerified(true);
      setSuccessMsg('Phone number verified successfully!');
      if (onVerificationSuccess) {
        onVerificationSuccess({
          phoneNumber: fullPhone,
          verified: true
        });
      }
    } catch (err) {
      console.error('[Verify OTP Error]:', err);
      setErrorMsg(err.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset Form to edit phone number
   */
  const handleEditPhone = () => {
    setStep(1);
    setOtpCode('');
    setErrorMsg('');
    setSuccessMsg('');
  };

  return (
  return (
    <div className="w-full max-w-md mx-auto p-6 rounded-3xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] space-y-6 text-xs font-semibold text-white">

      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <div className="p-3 bg-blue-500/20 text-cyan-300 border border-blue-500/30 rounded-2xl">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h3 className="text-base font-black text-white">Phone Verification (2FA)</h3>
          <p className="text-xs text-gray-400 font-normal">Powered by Twilio Verify API</p>
        </div>
      </div>

      {/* Alert Messages */}
      {errorMsg && (
        <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold flex items-start gap-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold flex items-start gap-2">
          <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Verification Completed State */}
      {isVerified ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} />
          </div>
          <h4 className="text-sm font-black text-white">Verification Complete!</h4>
          <p className="text-xs text-gray-300 font-mono">{getFullPhoneNumber()}</p>
        </div>
      ) : (
        <>
          {/* STEP 1: Phone Number Input */}
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label className="text-[10.5px] uppercase tracking-wider text-gray-300 font-bold block mb-1.5">
                  Mobile Number *
                </label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl font-bold text-white shrink-0 focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    <option value="+91" className="bg-slate-900 text-white">🇮🇳 +91 (India)</option>
                    <option value="+1" className="bg-slate-900 text-white">🇺🇸 +1 (USA)</option>
                    <option value="+44" className="bg-slate-900 text-white">🇬🇧 +44 (UK)</option>
                    <option value="+971" className="bg-slate-900 text-white">🇦🇪 +971 (UAE)</option>
                  </select>

                  <div className="relative flex-1">
                    <input
                      type="tel"
                      required
                      placeholder="98765 43210"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl font-mono text-sm font-bold text-white placeholder-gray-400 focus:bg-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none transition-all shadow-inner"
                    />
                    <Phone size={15} className="absolute left-3 top-3.5 text-gray-400" />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || mobileNumber.replace(/\D/g, '').length < 10}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs cursor-pointer hover:scale-[1.02]"
              >
                {loading ? 'Sending OTP...' : 'Send OTP via SMS'}
                {!loading && <ArrowRight size={15} />}
              </button>
            </form>
          )}

          {/* STEP 2: 6-Digit OTP Code Verification */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="flex items-center justify-between bg-white/5 p-3 rounded-2xl border border-white/10">
                <div>
                  <span className="text-[10px] text-gray-400 block font-bold">OTP SENT TO</span>
                  <span className="font-mono font-bold text-white text-xs">{getFullPhoneNumber()}</span>
                </div>
                <button
                  type="button"
                  onClick={handleEditPhone}
                  className="text-xs text-cyan-300 font-bold hover:underline cursor-pointer"
                >
                  Edit
                </button>
              </div>

              <div>
                <label className="text-[10.5px] uppercase tracking-wider text-gray-300 font-bold block mb-1.5">
                  Enter 6-Digit OTP Code *
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="• • • • • •"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl font-mono text-center text-lg font-bold tracking-[0.5em] text-white placeholder-gray-400 focus:bg-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none transition-all shadow-inner"
                />
              </div>

              <button
                type="submit"
                disabled={loading || otpCode.length !== 6}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs cursor-pointer hover:scale-[1.02]"
              >
                {loading ? 'Verifying...' : 'Verify OTP Code'}
              </button>

              {/* Resend OTP Option */}
              <div className="text-center pt-2">
                {countdown > 0 ? (
                  <span className="text-gray-400 text-xs font-medium">
                    Resend OTP available in <strong className="text-white font-mono">{countdown}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={loading}
                    className="text-cyan-300 hover:text-cyan-200 font-bold flex items-center justify-center gap-1 mx-auto text-xs cursor-pointer"
                  >
                    <RotateCw size={13} /> Resend OTP Code
                  </button>
                )}
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
};