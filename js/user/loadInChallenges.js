import challenges from "../queries/getChallenges.js";

const container = document.querySelector('.container');
const missions_hover = container.querySelector('.missions');
const challengesList = await challenges;

// places that r gonna be replaced by the challenges
const missions_hover_description = missions_hover.querySelectorAll('.description');
const missions_hover_amount = missions_hover.querySelectorAll('.amount');

// console.log(challengesList[0]._document.data.value.mapValue.fields);
for(let i = 0; i < 6; i++) {
  missions_hover_description[i].innerHTML = challengesList[i]._document.data.value.mapValue.fields.description.stringValue;
  missions_hover_amount[i].innerHTML = `0/${challengesList[i]._document.data.value.mapValue.fields.qty.integerValue}`;
}
