import auth from "./firebase/authService.js";
import getUser from "./queries/getUser.js";
import getImageLink from "./queries/getImageLink.js";

const currUser = await new Promise((resolve, reject) => {
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      resolve(await getUser(user.email));
    } else {
      reject("User not found");
    }
  });
}).catch((error) => {
  console.error("An error occurred while getting the current user:", error);
  resolve(null);
});


const pfp = document.querySelector('.pfp-img');
const email = document.querySelector('.user-email');
const money = document.querySelector('.user-money');
const level = document.querySelector('.user-level');
const pfpLink = await getImageLink('pfp',currUser.image);

pfp.src = pfpLink;
email.innerHTML = currUser.email;
money.innerHTML = `$${currUser.money}`;
level.innerHTML = currUser.level;
