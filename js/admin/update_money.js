import getUsers from '../queries/getUsers.js';
import getImageLink from '../queries/getImageLink.js';
import updateUser from '../queries/updateUser.js';

let table_content = document.querySelector('.table_content');
const btnClose = document.querySelector('.btnClose');
const editUserCard = document.querySelector('.editUserCard');
const background = document.querySelector('.background');

// btns to update
const btnAddMoney = document.querySelector('.btnAddMoney');

const users = await getUsers();

const userPromises = users.map(async (user) => {
  return {
    email: user.email,
    level: user.level,
    money: user.money,
    role: user.role,
    image: await getImageLink('pfp', user.image),
    image_name: user.image,
    user_items: user.user_items,
  };
});

// IT TOOK A YEAR TO GET HERE WITH THE DAMN PROMISE
Promise.all(userPromises)
.then((users) => {
  users.sort((a,b) => a.role - b.role);
    users.forEach((user) => {
      const newElement = document.createElement('tr');
      // console.log(user.status);
      if(Number(user.role) === 1)
        newElement.classList.add('btnItems');
      else
        newElement.classList.add('btnItems','disabled');
      // console.log(item);
      newElement.innerHTML = `
        <th scope="row"><img style="width: 100px; height: 100px; object-fit: contain;" src="${user.image}" alt="User ${user.id}" /></th>
        <td>${user.email}</td>
        <td>$${user.money}</td>
        <td>${user.level}</td>
        <td>${user.role}</td>
      `;
      table_content.appendChild(newElement);

      // NOW WE HAVE TO MAKE A LISTENER SO WHEN WE CLICK AN OBJECT WE GET THE CURRENT user
      newElement.addEventListener('click', async () => {
        // a screen with the chosen product is showed
        const txtEmail = document.querySelector('#txtEmail');
        const txtCurrMoney = document.querySelector('#txtCurrMoney');
        const txtAddMoney = document.querySelector('#txtAddMoney');
        txtEmail.value = user.email;
        txtCurrMoney.value = user.money;

        editUserCard.classList.remove('inactive');
        background.classList.remove('inactive');

        // given the case the person wants to update the data, then
        btnAddMoney.addEventListener('click', async () => {
          if(txtAddMoney.value > 0)
          {
            const newMoney = Number(txtCurrMoney.value) + Number(txtAddMoney.value);
            await updateUser(
              {
                email: user.email,
                level: user.level,
                money: newMoney,
                role: user.role,
                image: user.image_name,
                user_items: user.user_items,
              }
            );
          }
          else {
            alert("Add a positive amount of money");
          }
          location.reload();
        });
      });
    });
    
  })
.catch((error) => {
  console.error("An error occurred:", error);
});

// edit item menu
btnClose.addEventListener('click', () => {
  editUserCard.classList.add('inactive');
  background.classList.add('inactive');
});