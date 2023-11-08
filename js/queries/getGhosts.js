import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";
import db from '../firebase/firestore.js';

const getGhosts = async () => {
  let users = [];
  try {
    const querySnapshot = await getDocs(collection(db, "Ghosts"));
    querySnapshot.forEach((doc) => {
      users.push(doc.data());
    });
  }
  catch(error) {
    console.log(`The error is ${error}`);
  }
  return users;
}

export default getGhosts;