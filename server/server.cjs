/**
 * Twilio Programmable SMS API - Node.js / Express Backend (CommonJS Version)
 * 
 * Standalone 2FA Phone Number Verification service using Twilio Programmable SMS.
 * 
 * Run with: node server/server.cjs
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });
require('dotenv').config({ path: path.resolve(process.cwd(), 'server/.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend applications (Development + Production)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  'https://college-erp-system-eta.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS Policy restriction: Origin not allowed.'));
  },
  credentials: true
}));

app.use(express.json());

// Initialize and Validate Twilio Credentials
const accountSid = (process.env.TWILIO_ACCOUNT_SID || '').trim();
const authToken = (process.env.TWILIO_AUTH_TOKEN || '').trim();
const twilioPhoneNumber = (process.env.TWILIO_PHONE_NUMBER || '+17372212163').trim();

const isAccountSidValid = accountSid.startsWith('AC');
const isAuthTokenValid = Boolean(authToken && !authToken.includes('your_') && authToken.length > 5);
const isPhoneNumberValid = Boolean(twilioPhoneNumber && twilioPhoneNumber.startsWith('+'));

console.log(`Twilio Account SID configured: ${isAccountSidValid}`);
console.log(`Twilio Auth Token configured: ${isAuthTokenValid}`);
console.log(`Twilio Phone Number configured: ${isPhoneNumberValid}`);

const missingEnvVars = [];
if (!isAccountSidValid) missingEnvVars.push('TWILIO_ACCOUNT_SID (must start with AC)');
if (!isAuthTokenValid) missingEnvVars.push('TWILIO_AUTH_TOKEN');
if (!isPhoneNumberValid) missingEnvVars.push('TWILIO_PHONE_NUMBER');

if (missingEnvVars.length > 0) {
  console.warn(`⚠️ Missing or invalid Twilio environment variable(s): ${missingEnvVars.join(', ')}`);
}

let client = null;
if (isAccountSidValid && isAuthTokenValid) {
  try {
    const twilio = require('twilio');
    client = twilio(accountSid, authToken);
    console.log('✅ Twilio Programmable SMS SDK initialized successfully.');
  } catch (err) {
    console.error('❌ Twilio SDK initialization error:', err.message);
  }
}

// In-memory OTP storage: phone -> { code, expiresAt }
const otpStore = new Map();

/**
 * E.164 Phone Number Formatter & Validator Helper
 */
const normalizePhoneNumber = (phone) => {
  if (!phone) return null;
  let cleaned = String(phone).trim().replace(/[^\d+]/g, '');
  if (!cleaned.startsWith('+')) {
    if (cleaned.length === 10) {
      cleaned = `+91${cleaned}`;
    } else {
      cleaned = `+${cleaned}`;
    }
  }
  return cleaned;
};

// Healthcheck Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    twilioConfigured: isAccountSidValid && isAuthTokenValid && isPhoneNumberValid,
    message: 'Twilio Programmable SMS OTP Server is active.'
  });
});

/**
 * POST /send-otp (also supports /api/send-otp and /api/otp/send)
 * Body: { phone: "+919381887173" } or { phoneNumber: "+919381887173" }
 */
const sendOtpHandler = async (req, res) => {
  try {
    const rawPhone = req.body.phone || req.body.phoneNumber;
    const normalizedPhone = normalizePhoneNumber(rawPhone);

    if (!normalizedPhone || normalizedPhone.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format. Please provide a valid number with country code (e.g. +919381887173).'
      });
    }

    if (!isAccountSidValid || !isAuthTokenValid || !client) {
      const missing = [];
      if (!isAccountSidValid) missing.push('TWILIO_ACCOUNT_SID');
      if (!isAuthTokenValid) missing.push('TWILIO_AUTH_TOKEN');

      return res.status(500).json({
        success: false,
        message: `Failed to send OTP: Twilio credentials not configured on server. Missing: ${missing.join(', ')}`,
        errorCode: 'TWILIO_NOT_CONFIGURED'
      });
    }

    // Generate 6-digit numeric OTP code
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in-memory with 10 minute expiration
    const expiresAt = Date.now() + 10 * 60 * 1000;
    otpStore.set(normalizedPhone, { code: generatedOtp, expiresAt });

    console.log(`[Twilio Programmable SMS] Sending OTP to: ${normalizedPhone} from ${twilioPhoneNumber}`);

    const message = await client.messages.create({
      body: `Your OTP is ${generatedOtp}`,
      from: twilioPhoneNumber,
      to: normalizedPhone
    });

    console.log(`[Twilio Programmable SMS] SMS Sent successfully! Message SID: ${message.sid}, Status: ${message.status}`);

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      status: message.status || 'pending',
      to: normalizedPhone
    });
  } catch (error) {
    console.error('[Twilio Send OTP Error]:', error);

    return res.status(error.status || 500).json({
      success: false,
      message: 'Failed to send OTP',
      errorCode: error.code || 'TWILIO_ERROR',
      errorMessage: error.message || 'Twilio SMS send request failed.'
    });
  }
};

app.post('/send-otp', sendOtpHandler);
app.post('/api/send-otp', sendOtpHandler);
app.post('/api/otp/send', sendOtpHandler);

/**
 * POST /verify-otp (also supports /api/verify-otp and /api/otp/verify)
 * Body: { phone: "+919381887173", otp: "123456" } or { phoneNumber: "+919381887173", otpCode: "123456" }
 */
const verifyOtpHandler = async (req, res) => {
  try {
    const rawPhone = req.body.phone || req.body.phoneNumber;
    const rawOtp = req.body.otp || req.body.otpCode || req.body.code;
    const normalizedPhone = normalizePhoneNumber(rawPhone);

    if (!normalizedPhone) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: 'Phone number is required.'
      });
    }

    const otpCode = String(rawOtp || '').trim();
    if (!otpCode || otpCode.length !== 6) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: 'Please enter a valid 6-digit OTP code.'
      });
    }

    const record = otpStore.get(normalizedPhone);

    if (!record) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: 'No OTP requested for this phone number or it has expired.',
        status: 'failed',
        to: normalizedPhone
      });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(normalizedPhone);
      return res.status(400).json({
        success: false,
        verified: false,
        message: 'OTP code has expired. Please request a new OTP.',
        status: 'expired',
        to: normalizedPhone
      });
    }

    if (record.code !== otpCode) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: 'Invalid OTP code. Please check and try again.',
        status: 'invalid',
        to: normalizedPhone
      });
    }

    // OTP verified successfully - clear from store
    otpStore.delete(normalizedPhone);

    console.log(`[Twilio Programmable SMS] OTP verified successfully for: ${normalizedPhone}`);

    return res.status(200).json({
      success: true,
      verified: true,
      message: 'Phone number verified successfully!',
      status: 'approved',
      to: normalizedPhone
    });
  } catch (error) {
    console.error('[Twilio Verify OTP Error]:', error);

    return res.status(error.status || 500).json({
      success: false,
      verified: false,
      message: 'Failed to verify OTP',
      errorCode: error.code || 'TWILIO_ERROR',
      errorMessage: error.message || 'OTP verification failed.'
    });
  }
};

app.post('/verify-otp', verifyOtpHandler);
app.post('/api/verify-otp', verifyOtpHandler);
app.post('/api/otp/verify', verifyOtpHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Twilio Programmable SMS OTP Server active on http://localhost:${PORT}`);
});
