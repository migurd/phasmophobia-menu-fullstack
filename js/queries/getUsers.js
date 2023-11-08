import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";
import db from '../firebase/firestore.js';

const getUsers = async () => {
  let users = [];
  try {
    const querySnapshot = await getDocs(collection(db, "Users"));
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      // console.log(doc.id, " => ", doc.data());
      users.push(doc.data());
    });
  }
  catch(error) {
    console.log(`The error is ${error}`);
  }
  return users;
}

export default getUsers;