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
    <div className="w-full max-w-md mx-auto p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 text-xs font-semibold">

      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="p-3 bg-blue-500/10 text-blue-600 rounded-2xl">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white">Phone Verification (2FA)</h3>
          <p className="text-xs text-slate-400 font-normal">Powered by Twilio Verify API</p>
        </div>
      </div>

      {/* Alert Messages */}
      {errorMsg && (
        <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 font-bold flex items-start gap-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 font-bold flex items-start gap-2">
          <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Verification Completed State */}
      {isVerified ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-14 h-14 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} />
          </div>
          <h4 className="text-sm font-black text-slate-900 dark:text-white">Verification Complete!</h4>
          <p className="text-xs text-slate-500 font-mono">{getFullPhoneNumber()}</p>
        </div>
      ) : (
        <>
          {/* STEP 1: Phone Number Input */}
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label className="text-[10.5px] uppercase tracking-wider text-slate-400 font-black block mb-1.5">
                  Mobile Number *
                </label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-700 dark:text-slate-200 shrink-0"
                  >
                    <option value="+91">🇮🇳 +91 (India)</option>
                    <option value="+1">🇺🇸 +1 (USA)</option>
                    <option value="+44">🇬🇧 +44 (UK)</option>
                    <option value="+971">🇦🇪 +971 (UAE)</option>
                  </select>

                  <div className="relative flex-1">
                    <input
                      type="tel"
                      required
                      placeholder="98765 43210"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-2xl font-mono text-sm font-bold text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <Phone size={15} className="absolute left-3 top-3.5 text-slate-400" />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || mobileNumber.replace(/\D/g, '').length < 10}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs"
              >
                {loading ? 'Sending OTP...' : 'Send OTP via SMS'}
                {!loading && <ArrowRight size={15} />}
              </button>
            </form>
          )}

          {/* STEP 2: 6-Digit OTP Code Verification */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">OTP SENT TO</span>
                  <span className="font-mono font-black text-slate-900 dark:text-white text-xs">{getFullPhoneNumber()}</span>
                </div>
                <button
                  type="button"
                  onClick={handleEditPhone}
                  className="text-xs text-blue-600 font-bold hover:underline"
                >
                  Edit
                </button>
              </div>

              <div>
                <label className="text-[10.5px] uppercase tracking-wider text-slate-400 font-black block mb-1.5">
                  Enter 6-Digit OTP Code *
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="• • • • • •"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-2xl font-mono text-center text-lg font-black tracking-[0.5em] text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading || otpCode.length !== 6}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs"
              >
                {loading ? 'Verifying...' : 'Verify OTP Code'}
              </button>

              {/* Resend OTP Option */}
              <div className="text-center pt-2">
                {countdown > 0 ? (
                  <span className="text-slate-400 text-xs font-medium">
                    Resend OTP available in <strong className="text-slate-700 dark:text-slate-300 font-mono">{countdown}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={loading}
                    className="text-blue-600 hover:text-blue-700 font-bold flex items-center justify-center gap-1 mx-auto text-xs"
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