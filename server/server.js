import dotenv from 'dotenv';
import path from 'path';
import express from 'express';
import cors from 'cors';
import axios from 'axios';

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });

const app = express();
app.use(cors());
app.use(express.json());

const otpStore = {};

app.get('/', (req, res) => res.send({ status: "Hackathon Backend Running! 🚀" }));

// 1. Send OTP via Fast2SMS
const handleSendOtp = async (req, res) => {
    const phoneNumber = req.body.phoneNumber || req.body.phone || '';
    const cleanNumber = phoneNumber.replace('+91', '').replace(/\D/g, '').trim();
    
    // Generate 6-digit random OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // DEV MODE: Log OTP to console
    console.log(`\n🔑 DEV MODE: OTP for ${phoneNumber} (${cleanNumber}) is -> [ ${generatedOtp} ]\n`);
    otpStore[phoneNumber] = generatedOtp;
    if (cleanNumber) otpStore[cleanNumber] = generatedOtp;

    try {
        // Send request to Fast2SMS
        const fast2smsUrl = "https://www.fast2sms.com/dev/bulkV2";
        const apiKey = process.env.FAST2SMS_API_KEY;

        if (apiKey) {
            await axios.post(fast2smsUrl, {
                variables_values: generatedOtp,
                route: "otp",
                numbers: cleanNumber // 10-digit number for Fast2SMS
            }, {
                headers: { "authorization": apiKey }
            });
            console.log(`✅ Real OTP SMS sent to ${cleanNumber} via Fast2SMS`);
        } else {
            console.log(`⚠️ FAST2SMS_API_KEY not set in .env -> Using DEV MODE`);
        }

        res.status(200).json({ success: true, message: "OTP Sent successfully!", otp: generatedOtp });
    } catch (error) {
        console.error("❌ SMS Error:", error.response?.data || error.message);
        // Fallback to DEV MODE success so frontend flow isn't blocked
        res.status(200).json({ success: true, message: "OTP Sent (Dev Mode)", otp: generatedOtp });
    }
};

app.post('/send-otp', handleSendOtp);
app.post('/api/send-otp', handleSendOtp);

// 2. Verify OTP
const handleVerifyOtp = (req, res) => {
    const phoneNumber = req.body.phoneNumber || req.body.phone || '';
    const cleanNumber = phoneNumber.replace('+91', '').replace(/\D/g, '').trim();
    const otpCode = req.body.otpCode || req.body.otp || req.body.code || '';
    
    const storedOtp = otpStore[phoneNumber] || otpStore[cleanNumber];

    if (storedOtp && storedOtp === otpCode) {
        delete otpStore[phoneNumber];
        delete otpStore[cleanNumber];
        console.log(`✅ Phone ${phoneNumber} Verified successfully!`);
        res.status(200).json({ success: true, message: "Verified!" });
    } else {
        res.status(400).json({ success: false, message: "Invalid OTP" });
    }
};

app.post('/verify-otp', handleVerifyOtp);
app.post('/api/verify-otp', handleVerifyOtp);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Hackathon Backend running on http://localhost:${PORT}`);
});
