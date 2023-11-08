import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";
import db from '../firebase/firestore.js';

// let userCollection = [];

const getUser = async (email) => {
  try {
    const docRef = doc(db, "Users", email);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // console.log("Document data:", docSnap.data());
      return docSnap.data();
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error; // Rethrow the error to be handled by the caller if needed.
  }
};

export default getUser;