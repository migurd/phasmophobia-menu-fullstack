// first off its burned in the code that there are only 6 challenges

import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";
import db from "../firebase/firestore.js";

const updateChallenge = async (challenge, n) => {
  const challengeToUpdate = await doc(db, "Challenges", `Challenge${n}`);
  let newChallenge = challenge;
  try{
    await updateDoc(challengeToUpdate, {
      description: newChallenge.description,
      qty: Number(newChallenge.qty),
    });
    // alert(`Challenge ${n} updated successfully!`);
    return;
  }
  catch(error){
    console.log(error);
  }
  return;
};

export default updateChallenge;