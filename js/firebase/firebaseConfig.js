// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCJUCBdhLPdmLBXanaBLAVuIVuZYPdcpIc",
  authDomain: "phasmobackend.firebaseapp.com",
  projectId: "phasmobackend",
  storageBucket: "phasmobackend.appspot.com",
  messagingSenderId: "479450033455",
  appId: "1:479450033455:web:196a37fdfe31e7356005da"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;