// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCDYHgGBygZDblXBzs8zp1JcpjhSGl7GsI",
  authDomain: "college-erp-system-df02d.firebaseapp.com",
  projectId: "college-erp-system-df02d",
  storageBucket: "college-erp-system-df02d.firebasestorage.app",
  messagingSenderId: "446689800344",
  appId: "1:446689800344:web:b29c861c697da3bb7560ed",
  measurementId: "G-W3NXZPWKG4"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
