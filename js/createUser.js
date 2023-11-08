import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";
import auth from './firebase/authService.js';
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js"; // import this so we can create documents in the db
import db from "./firebase/firestore.js"; // db
import itemsCollection from './queries/getItems.js';
import updateFile from "./updateImage.js";

let txtEmail = document.querySelector('#txtEmail');
let txtPassword = document.querySelector('#txtPassword');
let btnSignUp = document.querySelector('.btnSignUp');

// enum for roles
const roles = {
  admin: 0,
  user: 1,
};

// Create an array to store items with ID, data, and quantity (defaulting to 0)
const userItems = [];

// meant to fill user_items field, so we can join in up with items later
itemsCollection.forEach((item) => {
  // console.log(item._document.data.value.mapValue.fields.name.stringValue);
  userItems.push({
    id: item._document.data.value.mapValue.fields.id.integerValue,
    // name: item._document.data.value.mapValue.fields.name.stringValue, // we might not need the name, cuz it can be changed
    // data: item,
    quantity: 0,
    qty_loadout: 0,
  });
});

// IMGS LOGIC
const btnPostFile = document.getElementById('btnPostFile');
const postImage = document.querySelector('.postImage');
const imageUrlInput = document.querySelector('#menu input[type="text"]');

// Add an event listener to the URL input
imageUrlInput.addEventListener('input', function() {
  const imageUrl = this.value.trim();
  if (imageUrl) {
    postImage.src = imageUrl; // Update the image source with the URL
  }
});

// Add an event listener to the file input
btnPostFile.addEventListener('change', function() {
  const file = this.files[0]; // Get the selected file
  if (file) {
    const fileURL = URL.createObjectURL(file); // Create a URL for the selected file
    postImage.src = fileURL; // Update the image source
    imageUrlInput.value = ''; // Clear the URL input
  }
});

// we verify if the user is logged, if it is, we redirect bro
document.addEventListener('DOMContentLoaded', () => {
  handleAuthStateChange((user) => {
    if (user) {
      // User is signed in, redirect to the dashboard
      if(isAdmin)
        window.location.href = '/html/admin/admin_menu.html';
      else
        window.location.href = '/html/user/user_menu.html';
    } else {
      // No user is signed in, redirect to the login page
      window.location.href = '/html/login.html';
    }
  });
});



btnSignUp.addEventListener('click', () => {
  // first we ensure the image is valid
  const selectedFile = btnPostFile.files[0];
  let imageUrl = imageUrlInput.value.trim();

  let fileName = null;
  if(!selectedFile)
    fileName = imageUrl;
  else
    fileName = selectedFile.name;

  if(fileName || isURLValid(imageUrl))
  {
    // afterwards we can check if the email and password can be created
    createUserWithEmailAndPassword(auth, txtEmail.value, txtPassword.value)
      .then(async (userCredential) => {
        // Signed in 
        const user = userCredential.user;
        // the user has been created, now we have to update the database and create a new document
        // but before doing that we need to import the current items, so user can have them in user_items
        
        // we create the file we want to upload as document
        const docData = {
          email: user.email,
          money: 0,
          role: roles.user, // 1
          level: 1,
          image: fileName,
          user_items: userItems,
        };

        // const loadOut = {
        //   email: user.email,
        //   user_items: userItems,
        // }

        if (selectedFile) {
          await updateFile('pfp',selectedFile,fileName);
        } else if (imageUrl) {
          // await updateFile('pfp',selectedFile,fileName);
          
        } else {
          // Handle no selection or invalid input
          alert(`File wasn't chosen.`);
          return;
        }

        // document is created if everything is aight
        await setDoc(doc(db, "Users", user.email), docData);
        // await setDoc(doc(db, "Loadouts", user.email), loadOut); // WE HAVE TO CREATE A NEW DOCUMENT CALLED LOADOUT PER CLIENT ONCE A USER IS CREATED, SO THEY HAVE THEIR LOADOUT, or we could create a qty_loadout field 👍

        alert(`The user ${user.email} was created successfully!`);
        window.location.href = '/html/login.html';
      })
      .catch((error) => {
        console.error(error);
        alert(`User couldn't be created.`);
      });
    }
    else {
      alert("Fill in the fields properly");
    }
});

function isURLValid(url) {
  try {
    const parsedURL = new URL(url);
    // Check if the URL has a valid scheme (e.g., http, https)
    return ['http:', 'https:'].includes(parsedURL.protocol);
  } catch (error) {
    // URL parsing failed, indicating an invalid URL
    return false;
  }
}