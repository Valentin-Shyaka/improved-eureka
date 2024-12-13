
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';


const firebaseConfig = {
  apiKey: "AIzaSyCLGPmzjhLGNDFQ8Fl2v4BA7kTdXhk5_40",
  authDomain: "twitter-acc3f.firebaseapp.com",
  projectId: "twitter-acc3f",
  storageBucket: "twitter-acc3f.appspot.com",
  messagingSenderId: "603016029478",
  appId: "1:603016029478:web:58dc3e243fff123ecbcde7",
  measurementId: "G-P1TN2J5WZ9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);