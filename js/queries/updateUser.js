import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";
import db from "../firebase/firestore.js";

const updateUser = async (user, isBuy = false, money_field = 0, user_items_field = [], isAlert = true) => {
  const userToUpdate = await doc(db, "Users", user.email);
  let newUser = user;
  // Set the "capital" field of the city 'DC'
  if(!isBuy)
  {
    try{
      await updateDoc(userToUpdate, {
        email: newUser.email,
        level: Number(newUser.level),
        money: Number(newUser.money),
        role: Number(newUser.role),
        image: newUser.image,
        user_items: newUser.user_items,
      });
      if(isAlert)
        alert(`User ${user.email} updated successfully!`);
      return;
    }
    catch(error){
      console.log(error);
    }
  }
  else {
    // we sum up our list so it can be updated properly
    // console.log(user_items_field);
    user.user_items.forEach((item) => {
      user_items_field.forEach((item2) => {
        if (Number(item.id) === Number(item2.id)) {
          item.quantity += item2.quantity;
          item.qty_loadout += item2.qty_loadout;
        }
      });
    });
    // console.log(user);
    // debugger;
    try{
      // console.log(user.user_items);
      await updateDoc(userToUpdate, {
        money: money_field,
        user_items: user.user_items,
      });

      // alert(`Products were bought successfully!`);
      return;
    }
    catch(error){
      console.log(error);
    }
  }
  return;
};

export default updateUser;