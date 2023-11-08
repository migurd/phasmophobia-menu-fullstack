import challenges from "../queries/getChallenges.js";
import updateChallenge from "../queries/updateChallenge.js";

const btnAccept = document.querySelector('.btnAccept');
const btnClose = document.querySelector('.btnClose');
const bg = document.querySelector('.background');
const container = document.querySelector('.container');
const missions_float = bg.querySelector('.missions');
const missions_hover = container.querySelector('.missions');
const challengesList = await challenges;

// MISSIONS
// places that r gonna be replaced by the challenges
const missions_hover_description = missions_hover.querySelectorAll('.description');
const missions_hover_amount = missions_hover.querySelectorAll('.amount');
const missions_float_description = missions_float.querySelectorAll('.description');
const missions_float_amount = missions_float.querySelectorAll('.amount');

// console.log(challengesList[0]._document.data.value.mapValue.fields);
for(let i = 0; i < 6; i++) {
  missions_hover_description[i].innerHTML = challengesList[i]._document.data.value.mapValue.fields.description.stringValue;
  missions_hover_amount[i].innerHTML = `0/${challengesList[i]._document.data.value.mapValue.fields.qty.integerValue}`;
}

btnClose.addEventListener('click', () => {
  bg.classList.add('inactive');
  missions_float.classList.add('inactive');
});

btnAccept.addEventListener('click', async () => {
  // if we did any change, its gonna be sent correctly
  // first we verify that the spaces arent empty
  
  if(areFieldsFilledIn()) {
    try {
      // we do the respective updates
      for(let i = 0; i < 6; i++) {
        await updateChallenge({
          description: missions_float_description[i].value,
          qty: Number(missions_float_amount[i].value),
        }, (i+1));
      }
      alert("Challenges were updated successfully!");
      window.location.href = "./admin_menu.html";
    }
    catch(error) {
      console.log("There was an error updating");
    }
  }
  else {
    alert("Fill in all the respective fields.");
  }

});

missions_hover.addEventListener('click', () => {
  bg.classList.remove('inactive');
  missions_float.classList.remove('inactive');

  for(let i = 0; i < 6; i++) {
    missions_float_description[i].value = challengesList[i]._document.data.value.mapValue.fields.description.stringValue;
    missions_float_amount[i].value = challengesList[i]._document.data.value.mapValue.fields.qty.integerValue;
  }
});

const areFieldsFilledIn = () => {
  let sw = true;
  missions_float_amount.forEach((e) => {
    // console.log(e.value);
    if(!((Number(e.value)) > 0))
      sw = false;
  });
  missions_float_description.forEach((e) => {
    // console.log(e.value);
    if(!(e.value !== ""))
      sw = false;
  });
  return sw;
};