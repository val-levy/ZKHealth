// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCcFZzUPRRlbjTxa9jZ_e3OVFwiiwW761o",
  authDomain: "zkhealth.firebaseapp.com",
  projectId: "zkhealth",
  storageBucket: "zkhealth.firebasestorage.app",
  messagingSenderId: "462264889059",
  appId: "1:462264889059:web:4eada5d7678a195b2f1fd6",
  measurementId: "G-9WRVNKVSFC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);