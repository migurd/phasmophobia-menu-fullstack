// authService.js
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js';
import app from './firebaseConfig.js';

const auth = getAuth(app);

export default auth;