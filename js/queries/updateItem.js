import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";
import db from "../firebase/firestore.js";

const updateItem = async (item) => {
  const itemToUpdate = doc(db, "Items", `${item.id}`);
  let newItem = item;
  // Set the "capital" field of the city 'DC'
  try{
    await updateDoc(itemToUpdate, {
      name: newItem.name,
      description: newItem.description,
      image: newItem.image,
      price: Number(newItem.price),
      tier: Number(newItem.tier),
      status: Number(newItem.status),
    });
    alert(`Item ${item.id} updated successfully!`);
    return;
  }
  catch(error){
    console.log(error);
  }
  return;
};

export default updateItem;