import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";
import db from "../firebase/firestore.js"; // db

let challenges = [];

const querySnapshot = await getDocs(collection(db, "Challenges"));
querySnapshot.forEach((doc) => {
  // doc.data() is never undefined for query doc snapshots
  challenges.push(doc);
  // console.log(doc.id, " => ", doc.data());
});

// challenges.sort((item) => item._document.data.value.mapValue.fields.id.integerValue);
// console.log(challenges);
export default challenges;