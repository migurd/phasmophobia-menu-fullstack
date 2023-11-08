// main.js
import isAdmin from './queries/isAdmin.js';
import auth from './firebase/authService.js';

document.addEventListener('DOMContentLoaded', () => {
  // Set up an observer to track the user's authentication state.
  auth.onAuthStateChanged(async(user) => {
    if (user) {
      // console.log(window.location.pathname);
      let isAdminValue = await isAdmin(user.email);
      // logic so admins cant visit users and users cant visit admins
      if(isAdminValue && window.location.pathname.includes('/html/admin'))
        return;
      if(!isAdminValue && window.location.pathname.includes('/html/user'))
        return;
      if(isAdminValue && window.location.pathname.includes('html/user/'))
        window.location.href = '/html/admin/admin_menu.html';
      else if(!isAdminValue && window.location.pathname.includes('html/admin/'))
        window.location.href = '/html/user/user_menu.html';
      else if(isAdminValue)
        window.location.href = '/html/admin/admin_menu.html';
      else
        window.location.href = '/html/user/user_menu.html';
    } else {
      window.location.href = '/html/login.html';
    }
  });
});