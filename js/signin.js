import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";
import auth from './firebase/authService.js';
import isAdmin from './queries/isAdmin.js';
import getUser from './queries/getUser.js';

let txtEmail = document.querySelector('#txtEmail');
let txtPassword = document.querySelector('#txtPassword');
let btnLogin = document.querySelector('.btnLogin');

document.addEventListener('DOMContentLoaded', () => {
  // const ola = await getUser("angelqui@gmail.com");
  // console.log(ola.role);
  // Set up an observer to track the user's authentication state.
  auth.onAuthStateChanged(async(user) => {
    if (!user)
      console.log('User is signed out');
    else {
      // alert(isAdmin('microinformaticamx@gmail.com'));
      if(await isAdmin(user.email)) window.location.href = '/html/admin/admin_menu.html';
      else window.location.href = '/html/user/user_menu.html';
    }
  });
});

btnLogin.addEventListener('click', async () => {
  signInWithEmailAndPassword(auth, txtEmail.value, txtPassword.value)
  .then(async(userCredential) => {
    // Signed in 
    const user = userCredential.user;
    // alert(`Starting session as ${user.email}`);
    // Make logic that will detect if the user is either an admin or a normal user,
    // itll be directd to /html/admin/admin_menu.html if its an admin
    // itll be directd to /html/user/user.menu.html if its a user
    
    // IT TOOK ME TWENTY YEARS TO REALIZE IT WAS THE FREAKING AWAIT
    if(await isAdmin(user.email)) {
      debugger;
      window.location.href = '/html/admin/admin_menu.html';
    }
    else {
      debugger;
      window.location.href = '/html/user/user_menu.html';
    } 


  })
  .catch((error) => {
    // const errorCode = error.code;
    // const errorMessage = error.message;
    alert('Insert a valid user and password');
  });
});