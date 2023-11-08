import { getFirestore } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";
import app from './firebaseConfig.js';

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export default db;