// import auth from './firebase/authService.js';
import { doc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js"; // import this so we can create documents in the db
import db from "../firebase/firestore.js"; // db
import getNextItemAvailableId from '../queries/getNextItemAvailableId.js';
import getUsers from '../queries/getUsers.js';
import updateFile from "../updateImage.js";

const btnCreate = document.querySelector('.btn');

// img
const btnPostFile = document.getElementById('btnPostFile');
const postImage = document.querySelector('.postImage');
const imageUrlInput = document.querySelector('#menu input[type="text"]');

// input
const txtName = document.querySelector('#txtName');
const txtDescription = document.querySelector('#txtDescription');
const txtPrice = document.querySelector('#txtPrice');
const cbTier = document.querySelector('#cbTier');
let counter = 0;

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

btnCreate.addEventListener('click', async () => {
  // first we ensure the image is valid
  const selectedFile = btnPostFile.files[0];
  let imageUrl = imageUrlInput.value.trim();
  let fileName = null;
  if(!selectedFile)
    fileName = imageUrl;
  else
    fileName = selectedFile.name;

  const nextId = await getNextItemAvailableId() + counter; // yeah
  counter++;
  const docData = {
    id: nextId,
    name: txtName.value,
    description: txtDescription.value,
    price: Number(txtPrice.value),
    tier: Number(cbTier.value),
    image: fileName,
    status: 1,
  };

  // console.log(docData);

  if (selectedFile) {
    // const fileRef = storageRef.child(fileName);
    updateFile('items',selectedFile,fileName);
  } else if (imageUrl) {
    if(!isURLValid(imageUrl)) {
      alert(`Select a valid URL.`);
      return;
    }
    // updateFile('items',selectedFile,fileName,true);
    // we dont need to upload it
  } else {
    // Handle no selection or invalid input
    alert(`File wasn't chosen.`);
    return;
  }

  if(areFieldsFilledIn())
  {
  // document is created if everything is aight
    await setDoc(doc(db, "Items", `${docData.id}`), docData); // update items

    // once we achieved our goal of creating an item, we have to update
    // the items field for every user, so they all have it
    let userItems = await getUsers();

    userItems.forEach((item) => {
      item.user_items.push({
        id: nextId,
        // name: txtName.value,
        quantity: 0,
        qty_loadout: 0,
      });
    });

    // user items is our item updated properly, so we just change it in the database
    // IMPORTANT, we also update the load out, so the loadout includes that the user has access to
    userItems.forEach(async (item) => {
      const currUser = doc(db, "Users", item.email);
      // const currUserLoadout = doc(db, "Loadout", item.email);

      await updateDoc(currUser, {
        user_items: item.user_items,
      });

      // await updateDoc(currUserLoadout, {
      //   user_items: item.user_items,
      // });

    });

    alert(`The item ${docData.id} was added successfully!`);
    cleanForm();
  }
  else {
    console.log("Error included in the function to verify the fields are filled in");
  }
});

const areFieldsFilledIn = () => {
  if(
    txtName.value.trim() !== '' &&
    txtDescription.value.trim() !== '' &&
    txtPrice.value > 0
    ) {
      if(!isInteger(txtPrice.value))
      {
        alert("Prices only accept integers.");
        return false;
      }
      return true;
    }
  alert("Please, fill in all the fields.");
  return false;
};

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

function isInteger(value) {
  // Remove leading and trailing spaces from the input
  value = value.trim();

  // Check if the input is a non-empty string that consists of digits and doesn't contain a decimal point
  return value !== '' && /^[0-9]+$/.test(value) && !value.includes('.');
}

const cleanForm = () => {
  txtName.value = '';
  txtDescription.value = '';
  txtPrice.value = '';
  cbTier.selectedIndex = 0;

  postImage.src = '../../img/items.jpg';
  imageUrlInput.value = ''; // Clear the URL input
  btnPostFile.value = '';
}