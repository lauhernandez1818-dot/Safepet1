import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

// Firebase configuration for safepet-94edd (provided)
const firebaseConfig = {
  apiKey: "AIzaSyBXuD7MTeovHzSGLP5RPsE1F764pia4O3c",
  authDomain: "safepet-94edd.firebaseapp.com",
  projectId: "safepet-94edd",
  storageBucket: "safepet-94edd.firebasestorage.app",
  messagingSenderId: "1042916460620",
  appId: "1:1042916460620:web:75d8c8795e418efc928ce9",
  measurementId: "G-WS2N9M08ZJ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
