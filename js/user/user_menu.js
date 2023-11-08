import auth from '../firebase/authService.js';
import getGhosts from "../queries/getGhosts.js";
import getUser from "../queries/getUser.js";
import updateUser from "../queries/updateUser.js";

const btnSingleplayer = document.querySelector('.btnSingleplayer');
const bg = document.querySelector('.background');
const bgCard = bg.querySelector('.game');
const btnClose = bg.querySelector('.btnClose');
const btnPlay = bg.querySelector('.btnPlay');
const currFunds = document.querySelector('.user-money');
const currLevel = document.querySelector('.user-level');
const guess_the_ghost = document.querySelector('.guess-the-ghost');

const currUser = await new Promise((resolve, reject) => {
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      resolve(await getUser(user.email));
    } else {
      reject("User not found");
    }
  });
}).catch((error) => {
  console.error("An error occurred while getting the current user:", error);
  resolve(null);
});

let ghostChosen = 0;
let wasGhostChosen = false;
let ghosts = await getGhosts();
let gameStatus = 0;

let enumGameStatus = {
  died: 0,
  didnt_guess_and_survived: 1,
  guessed_and_survived: 2,
  died_and_guessed: 3,
}

btnSingleplayer.addEventListener('click', () => {
  bg.classList.remove('inactive');
  bgCard.classList.remove('inactive');
  guess_the_ghost.querySelector('h2').innerHTML = 'Guess the Ghost';
  guess_the_ghost.querySelector('p').innerHTML = 'Be careful, you could die if you guess it wrong!';
  setNewGhosts();
  resetOptions();
});

btnPlay.addEventListener('click', () => {
  if(!wasGhostChosen)
    alert("Choose an option to play");
  else
  {
    try {
      startGame();
    }
    catch(error) {
      console.log("There was an error playing the game");
    }
  }
});

btnClose.addEventListener('click', () => {
  bg.classList.add('inactive');
  bgCard.classList.add('inactive');

});

// choose guesses logic
const guesses = document.querySelectorAll('.guess');
guesses.forEach((guess) => {
  guess.addEventListener('click', (e) => {
    resetOptions();
    e.target.classList.add('active');
    ghostChosen = Number(e.target.getAttribute('value'));
    wasGhostChosen = true;
  });
});

const resetOptions = () => {
  guesses.forEach((item) => {
    item.classList.remove('active');
  });
  wasGhostChosen = false;
};

const getRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const setNewGhosts = () => {
  let excludedNumber = [];
  let numberGenerated = 0;
  
  for(let i = 0; i < 4; i++) {
    numberGenerated = getRandomNumber(0,9);
    if(!excludedNumber.includes(numberGenerated)) {
      excludedNumber.push(numberGenerated);
      guesses[i].innerHTML = ghosts[numberGenerated].name;
    }
    else i--;
  }
};

const startGame = async () => {
  let probabilities_surviving = 50;
  let probabilities_dying = 5;
  let probabilities_loadout = getProbabilitiesLoadout(45); // 45
  let probabilities_total = probabilities_surviving + probabilities_loadout; // max 95, 50-95 possibilities to die
                                                                            // to have more possibilities, you need
                                                                            // more loadout items
  let moneyEarned = getRandomNumber(2000,3000);
  let wasLvlEarned = false;
  let statusTitle = "";
  let statusDesc = "";
  console.log(`Chances of surviving: ${probabilities_total}`);
  if(probabilities_total > getRandomNumber(1, 100)) {
    // survived
    // guessed correctly
    gameStatus = enumGameStatus.survived;
    if(ghostChosen === getRandomNumber(1, 4)) {
      gameStatus = enumGameStatus.guessed_and_survived;
      wasLvlEarned = true;
      statusTitle = `You guessed!`;
      statusDesc = `You guessed and earned $${moneyEarned} and 1 level`;
    }
    else {
      // survived but didnt guess the ghost correctly
      gameStatus = enumGameStatus.didnt_guess_and_survived;
      moneyEarned = Math.floor(moneyEarned / 10);
      statusTitle = `You survived!`;
      statusDesc = `You didn't guess and earned $${moneyEarned}`;
    }
  }
  else {
    // died
    // guessed the ghost and died
    if(ghostChosen === getRandomNumber(1, 4)) {
      gameStatus = enumGameStatus.died_and_guessed;
      wasLvlEarned = true;
      statusTitle = `You died!`;
      statusDesc = `You died but guessed the ghost, 1 level was earned`;
      moneyEarned = 0;
    }
    // didnt guessed the ghost and died
    else {
      gameStatus = enumGameStatus.died;
      statusTitle = `You died!`;
      statusDesc = `You died and lost your loadout`;
      moneyEarned = 0;
    }
  }

  let user_after_game = currUser;
  // we empty the loadout
  if(gameStatus === enumGameStatus.died || gameStatus === enumGameStatus.died_and_guessed)
    user_after_game.user_items.forEach((item) => item.qty_loadout = 0);
  user_after_game.money = Number(currFunds.innerHTML.split('$')[1]) + moneyEarned;
  console.log();
  if(wasLvlEarned)
    user_after_game.level = Number(currLevel.innerHTML) + 1;

  // we update the user money and loadout
  await updateUser(user_after_game, false, 0, [], false);

  guess_the_ghost.querySelector('h2').innerHTML = statusTitle;
  guess_the_ghost.querySelector('p').innerHTML = statusDesc;

  // we update the card in the background so it looks like we already won money lol
  currFunds.innerHTML = "$" + Number(Number(currFunds.innerHTML.split('$')[1]) + moneyEarned);
  if(wasLvlEarned)
    currLevel.innerHTML = `${Number(currLevel.innerHTML) + 1}`;

  alert(`${statusTitle}\n${statusDesc}`);
  setNewGhosts();
  resetOptions();
}

const getProbabilitiesLoadout = (n = 40) => {
  let totalItems = 0;
  let currLoadout = 0;
  currUser.user_items.forEach((item) => {
    totalItems += 4;
    currLoadout += item.qty_loadout;
  });
  return (currLoadout / totalItems) * n;
}