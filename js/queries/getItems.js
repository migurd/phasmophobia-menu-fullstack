import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";
import db from "../firebase/firestore.js"; // db

let itemsCollection = [];

const querySnapshot = await getDocs(collection(db, "Items"));
querySnapshot.forEach((doc) => {
  // doc.data() is never undefined for query doc snapshots
  itemsCollection.push(doc);
  // console.log(doc.id, " => ", doc.data());
});

// itemsCollection.sort((item) => item._document.data.value.mapValue.fields.id.integerValue);
// console.log(itemsCollection);
export default itemsCollection;