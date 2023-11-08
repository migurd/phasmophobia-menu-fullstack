import { signOut } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";
import auth from './firebase/authService.js';

const btnSignOut = document.querySelector('.btnSignOut');

btnSignOut.addEventListener('click', () => {
  auth.onAuthStateChanged(async (user) => {
    if (user === null) {
      // alert(`You aren't logged in ${user}`);
      window.location.href = '../login.html';
    }
    else {
      try {
        await signOut(auth);
        // Sign-out successful.
        alert(`Session was closed successfully from ${user.email}`);
        window.location.href = '../login.html';
      }catch(error) {
        // An error happened.
        console.log(error);
        alert(`Session couldn't be closed.`);
      };
    }
  });
});