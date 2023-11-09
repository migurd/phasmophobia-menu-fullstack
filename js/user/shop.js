import getJoinUserItems from "./joinUserItems.js";
import getUser from "../queries/getUser.js";
import auth from "../firebase/authService.js";
import updateUser from "../queries/updateUser.js";
import itemsCollection from "../queries/getItems.js";

const currSession = await new Promise((resolve, reject) => {
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

const inventory = await getJoinUserItems();
const user = await getUser(currSession.email);
const section_items = document.querySelector('.section-items');
const aside_shop_items = document.querySelector('.aside-shop-items');
const aside_equipment_items = document.querySelector('.aside-equipment-items');
const txtMoney = document.querySelectorAll('.txtUserMoney');
const btnBuy = document.querySelector('.btnBuy');
const btnSell = document.querySelector('.btnSell');
const btnAll = document.querySelector('.btnAll');
const btnClear = document.querySelector('.btnClear');
const btnClean = document.querySelector('.btnClean');
let itemCart = [];

// ENUM FOR ACTIVE TAB
let activeTab = {
  shop: 0,
  equipment: 1,
}
let currTab = activeTab.equipment;

// we add up the items for the storage
inventory.forEach(item => {
  // section is loaded properly
  let newItem = document.createElement('div');
  newItem.classList.add('item');
  newItem.innerHTML =
  `
  <div class="item_header">
    <div class="amount_items">
      <span class="icon box"></span>
      <p class="item_qty" value=${item.quantity} item_qty=${Number(item.id)}>${item.quantity}</p>
    </div>
    <div class="amount_items_loadout">
      <span class="icon truck"></span>
      <p class="item_qty_loadout" value=${item.qty_loadout} item_qty_loadout=${Number(item.id)}>${item.qty_loadout}/4</p>
    </div>
  </div>

  <div class="item_body">
    <img alt="${item.name}" src="${item.image}"/>
  </div>

  <div class="item_footer">
    <button type="button" class="btnPlus" value=${Number(item.id)}>+</button>
    <button type="button" class="btnMinus" value=${Number(item.id)}>-</button>
  </div>
  `;
  section_items.appendChild(newItem);

  // we need to load properly
    // 1. Shop aside
    // 2. Shop equipment
  // shop
  let newShopItem = document.createElement('tr');
  newShopItem.innerHTML =
  `
    <td qty_id="${Number(item.id)}">0</td>
    <td>${item.name}</td>
    <td price_id=${Number(item.id)}>${item.price}</td>
  `;
  aside_shop_items.appendChild(newShopItem);
  // equipment
  let newEquipmentItem = document.createElement('tr');
  newEquipmentItem.innerHTML =
  `
    <td>${item.name}</td>
    <td qty_loadout_id="${Number(item.id)}" value=${item.qty_loadout}>${item.qty_loadout}/4</td>
  `;
  aside_equipment_items.appendChild(newEquipmentItem);

  // LOGIC TO BUY SOMETHING IN CASE SOMEONE WANTS TO BUY SOMETHING
  // listeners for btns plus and minuts
  const btnsPlus = document.querySelectorAll('.btnPlus'); 
  const btnPlus = btnsPlus[btnsPlus.length - 1]; 
  const btnsMinus = document.querySelectorAll('.btnMinus'); 
  const btnMinus = btnsMinus[btnsMinus.length - 1]; 
  const currQty = document.querySelector(`[qty_id="${Number(item.id)}"]`);
  const itemQty = document.querySelector(`[item_qty="${Number(item.id)}"]`);
  const itemQtyLoadout = document.querySelector(`[item_qty_loadout="${Number(item.id)}"]`);
  const itemIdLoadout = document.querySelector(`[qty_loadout_id="${Number(item.id)}"]`);

  // validations so we dont go under 0
  if(currTab === activeTab.shop && Number(currQty.innerHTML) === 0)
    btnMinus.disabled = true;

  if(currTab === activeTab.equipment && Number(itemQtyLoadout.getAttribute('value')) === 4) {
    btnPlus.disabled = true;
    btnMinus.disabled = false;
  }
  else if(currTab === activeTab.equipment && Number(itemQtyLoadout.getAttribute('value')) === 0 && Number(itemQty.innerHTML) === 0) {
    btnPlus.disabled = true;
    btnMinus.disabled = true;
  }
  else if(currTab === activeTab.equipment && Number(itemQtyLoadout.getAttribute('value')) === 0) {
    btnPlus.disabled = false;
    btnMinus.disabled = true;
  }
  else {
    btnPlus.disabled = false;
    btnMinus.disabled = false;
  }

  btnPlus.addEventListener('click', async () => {
    currQty.innerHTML = Number(currQty.innerHTML) + 1;
    btnMinus.disabled = false;

    // we activate both buy and sell
    btnBuy.disabled = false;
    btnSell.disabled = false;

    // itemCart is updated
    // if its empty or its not found, we push
    if(itemCart.length === 0 || !itemCart.find(e => Number(e.id) === Number(item.id)))
    {
      itemCart.push({
        id: Number(item.id),
        quantity: Number(currQty.innerHTML),
        qty_loadout: Number(itemQtyLoadout.getAttribute('value')),
      });
    }
    // its gonna be found otherwise, so we just update
    else {
      itemCart[itemCart.findIndex(e => Number(e.id) === Number(item.id))].quantity = Number(currQty.innerHTML);
    }
    
    // we apply this logic if the active tab is shop
    if(currTab === activeTab.shop)
    {
      // we sum up the money to the buy btn
      btnBuy.value = Number(btnBuy.value) + Number(item.price);
      btnBuy.innerHTML = `BUY: $${Number(btnBuy.value)}`;

      // we sum up the money to the buy btn
      btnSell.value = Number(btnSell.value) + Math.floor(item.price / 2);
      btnSell.innerHTML = `SELL: $${Number(btnSell.value)}`;

    }
    else if(activeTab.equipment)
    {
      // we check if items are 4/4 or if the items are enough, not 0 
      if(Number(itemQtyLoadout.innerHTML.split('/')[0] < 4) && Number(itemQty.innerHTML) > 0)
      {
        if (itemQtyLoadout) {
          const newQtyLoadout = Number(itemQtyLoadout.innerHTML.split('/')[0]) + 1;
          itemQtyLoadout.innerHTML = `${newQtyLoadout}/4`;
          itemQtyLoadout.setAttribute('value',`${newQtyLoadout}`);
          itemIdLoadout.innerHTML = itemQtyLoadout.innerHTML;
          itemIdLoadout.setAttribute('value',itemQtyLoadout.getAttribute('value'));
        }
  
        // we update the database when a productis added
        itemQty.innerHTML = Number(itemQty.innerHTML) - 1;
        // YOU HAVE NO IDEA HJWO MUCH I STRUGGELD TO FIND OUT I HAD TO UPDATE THE ATTRIBUTE
        itemQty.setAttribute('value',`${Number(itemQty.innerHTML)}`);

        // we add to the list as negatives
        // itemCart is updated
        // if its empty or its not found, we push
        itemCart = [];
        itemCart.push({
          id: Number(item.id),
          quantity: -1, // we substract qty
          qty_loadout: 1,
        });

        await updateUser(user, true, user.money, itemCart);

        if(currTab === activeTab.equipment && Number(itemQtyLoadout.getAttribute('value')) === 4) {
          btnPlus.disabled = true;
          btnMinus.disabled = false;
        }

      }
    }
    if(currTab === activeTab.shop) {
      const ran = document.querySelector(`[item_qty="${Number(item.id)}"]`);
      ran.innerHTML = Number(ran.innerHTML) + 1;
    }
  });
  btnMinus.addEventListener('click', async() => {
    
    currQty.innerHTML = Number(currQty.innerHTML) - 1;
    btnPlus.disabled = false;
    
    // itemCart is updated
    // if its empty or its not found, we push
    if(Number(currQty.innerHTML) > 0) {
      // console.log(itemCart.findIndex(e => Number(e.id) === Number(item.id)));
      // console.log(itemCart);
      itemCart[itemCart.findIndex(e => Number(e.id) === Number(item.id))].quantity = Number(currQty.innerHTML);
    }
    else
      itemCart.splice(itemCart.findIndex(e => Number(e.id) === Number(item.id)), 1);

    // we deactivate the btns buy and sell
    if(itemCart.length === 0) {
      btnBuy.disabled = true;
      btnSell.disabled = true;
    }

    // we apply this logic if the active tab is shop
    if(currTab === activeTab.shop)
    {
      // we substract the money to the buy btn
      btnBuy.value = Number(btnBuy.value) - Number(item.price);
      btnBuy.innerHTML = `BUY: $${Number(btnBuy.value)}`;

      // we substract the money to the buy btn
      btnSell.value = Number(btnSell.value) - Math.floor(item.price / 2);
      btnSell.innerHTML = `SELL: $${Number(btnSell.value)}`;
      
      if(Number(currQty.innerHTML) === 0) {
        btnMinus.disabled = true;
      }
    }
    else if(activeTab.equipment)
    {
      // we check if items are 4/4 or if the items are enough, not 0 
      if(Number(itemQtyLoadout.innerHTML.split('/')[0] > 0))
      {
        if (itemQtyLoadout) {
          const newQtyLoadout = Number(itemQtyLoadout.innerHTML.split('/')[0]) - 1;
          itemQtyLoadout.innerHTML = `${newQtyLoadout}/4`;
          itemQtyLoadout.setAttribute('value',`${newQtyLoadout}`);
          itemIdLoadout.innerHTML = itemQtyLoadout.innerHTML;
          itemIdLoadout.setAttribute('value',itemQtyLoadout.getAttribute('value'));
        }

        // we update the database when a productis added
        itemQty.innerHTML = Number(itemQty.innerHTML) + 1;
        // YOU HAVE NO IDEA HJWO MUCH I STRUGGELD TO FIND OUT I HAD TO UPDATE THE ATTRIBUTE
        itemQty.setAttribute('value',`${Number(itemQty.innerHTML)}`);

        // we add to the list as negatives
        // itemCart is updated
        // if its empty or its not found, we push
        itemCart = [];
        itemCart.push({
          id: Number(item.id),
          quantity: 1, // we substract qty
          qty_loadout: -1,
        });

        await updateUser(user, true, user.money, itemCart);
        
        if(currTab === activeTab.equipment && Number(itemQtyLoadout.getAttribute('value')) === 0) {
          btnPlus.disabled = false;
          btnMinus.disabled = true;
        }
      }
    }
    if(currTab === activeTab.shop) {
      const ran = document.querySelector(`[item_qty="${Number(item.id)}"]`);
      ran.innerHTML = Number(ran.innerHTML) - 1;
      // console.log(ran);
    }
    let items = document.querySelectorAll('[qty_id]');
    let c = 0;
    items.forEach((item_qty) => {
      if(Number(item_qty.innerHTML) === 0)
        c++;
    });
    // we verify if all the values of the shop are 0, if they are, we reset the shop
    if(c === items.length) {
      cleanShop();
    }
  });
});

// LOGIC TO UPDATE MONEY
txtMoney.forEach((txt) => {
  txt.innerHTML = `$${user.money}`;
})

// LOGIC TO DISPLAY THE CONTENT OF EITHER SHOP OR EQUIPMENT
const btnShop = document.querySelector('.btnShop');
const btnEquipment = document.querySelector('.btnEquipment');
const btnsSectionShop = document.querySelector('.btnsSectionShop');

const btnsSectionEquipment = document.querySelector('.btnsSectionEquipment');
const aside_shop = document.querySelector('.aside-shop');
const aside_equipment = document.querySelector('.aside-equipment');

// TABS LOGIC
btnShop.addEventListener('click', () => {
  // we first clean the config
  cleanShop();

  // we hide the others tabs'
  btnsSectionEquipment.classList.add('disabled');
  aside_equipment.classList.add('disabled');
  // ours is showed
  aside_shop.classList.remove('disabled');
  btnsSectionShop.classList.remove('disabled');

  // we update the active tab
  currTab = activeTab.shop;

  // we update the color of the tabs
  btnShop.style.backgroundColor = 'var(--orange)';
  btnEquipment.style.backgroundColor = 'var(--green)';
});

btnEquipment.addEventListener('click', async () => {
  // we load our latest loadout
  // validations so we dont go under 0
  location.reload(); // at the end i had to do this cuz no time XD

  document.querySelectorAll('.btnPlus').forEach((btnPlus) => {
    const qty_loadout = Number(document.querySelector(`[item_qty_loadout="${btnPlus.getAttribute('value')}"]`).getAttribute('value'));
    const qty = Number(document.querySelector(`[item_qty="${btnPlus.getAttribute('value')}"]`).getAttribute('value'));
    
    if(qty_loadout === 4) btnPlus.disabled = true;
    else if(qty === 0) btnPlus.disabled = true;
    else if(qty_loadout === 0) btnPlus.disabled = false;
    else btnPlus.disabled = false;
  
  });

  document.querySelectorAll('.btnMinus').forEach((btnMinus) => {
    const qty_loadout = Number(document.querySelector(`[item_qty_loadout="${btnMinus.getAttribute('value')}"]`).getAttribute('value'));
    
    if(qty_loadout === 4) btnMinus.disabled = false;
    else if(qty_loadout === 0) btnMinus.disabled = true;
    else if(qty_loadout === 0) btnMinus.disabled = true;
    else btnMinus.disabled = false;
  });
  
  // hide others tabs'
  aside_shop.classList.add('disabled');
  btnsSectionShop.classList.add('disabled');
  // ours is showed
  btnsSectionEquipment.classList.remove('disabled');
  aside_equipment.classList.remove('disabled');

  // we update the active tab
  currTab = activeTab.equipment;

  // we update the color of the tabs
  btnShop.style.backgroundColor = 'var(--green)';
  btnEquipment.style.backgroundColor = 'var(--orange)';
});

// BTNS BUY AND SELL LOGIC
btnBuy.addEventListener('click', async() => {
  
  // console.log(itemCart);
  // console.log(itemCart);
  let totalCart = 0;
  itemCart.forEach((item) => {
    const price = Number(document.querySelector(`[price_id="${Number(item.id)}"`).innerHTML);
    totalCart += (price * item.quantity)
    item.quantity = Math.abs(item.quantity);
    item.qty_loadout = 0;
  });
  
  if(totalCart > user.money)
  {
    alert("Not enough funds");
  }
  else{
    let currMoney = user.money - totalCart;
    await updateUser(user, true, currMoney, itemCart);
    
    // we dont need to update, the page, since we gonna do it dynamic
    // we update the money
    txtMoney.forEach((txt) => {
      txt.innerHTML = `$${currMoney}`;
    })

    // we update the amount of products
    itemCart.forEach((item) => {
      document.querySelectorAll(`[item_qty]`)
        .forEach((e) => {
          if(Number(e.getAttribute('item_qty')) === Number(item.id)) {
            e.innerHTML = item.quantity + Number(e.innerHTML);
            e.value = item.quantity + Number(e.value);
          }
        });
    });
    alert(`Products were bought successfully!`);
  }
  location.reload();
});

// BTNS BUY AND SELL LOGIC
btnSell.addEventListener('click', async() => {
  
  // console.log(itemCart);
  let totalCart = 0;
  let sw = false; // if sw is true, there arent enough funds

  itemCart.forEach((item) => {
    const price = Number(document.querySelector(`[price_id="${Number(item.id)}"`).innerHTML);
    totalCart += (Math.floor(price / 2) * item.quantity);
    if(item.quantity > Number(document.querySelector(`[item_qty="${Number(item.id)}"`).innerHTML))
      sw = true;
    item.quantity = -item.quantity;
    item.qty_loadout = 0;
  });

  // console.log(itemCart);

  if(sw)
  {
    alert("Not enough items to be sold");
  }
  else{
    let currMoney = user.money + totalCart;
    await updateUser(user, true, currMoney, itemCart);
    
    // we dont need to update, the page, since we gonna do it dynamic
    // we update the money
    txtMoney.forEach((txt) => {
      txt.innerHTML = `$${currMoney}`;
    })

    // we update the amount of products
    itemCart.forEach((item) => {
      document.querySelectorAll(`[item_qty]`)
        .forEach((e) => {
          if(Number(e.getAttribute('item_qty')) === Number(item.id)) {
            e.innerHTML = item.quantity + Number(e.innerHTML);
            e.value = item.quantity + Number(e.value);
          }
        });
    });
    alert(`Products were sold successfully!`);
  }
  location.reload();
});

// BTNS OF THE EQUIPMENT: ALL / CLEAR
btnAll.addEventListener('click', async () => {
  // btnClear.disabled = false;
  
  // btns are changed so we have the idea it's full
  document.querySelectorAll('.btnPlus').forEach((btnPlus) => {
    const qty_loadout = Number(document.querySelector(`[item_qty_loadout="${btnPlus.getAttribute('value')}"]`).getAttribute('value'));
    // console.log(qty_loadout);
    if(qty_loadout === 4) btnPlus.disabled = false;
    else if(qty_loadout === 0) btnPlus.disabled = true;
    else btnPlus.disabled = false;
  
  });

  document.querySelectorAll('.btnMinus').forEach((btnMinus) => {
    const qty_loadout = Number(document.querySelector(`[item_qty_loadout="${btnMinus.getAttribute('value')}"]`).getAttribute('value'));
    const qty = Number(document.querySelector(`[item_qty="${btnMinus.getAttribute('value')}"]`).getAttribute('value'));
    
    if(qty === 0) btnMinus.disabled = true;
    else if(qty_loadout === 4) btnMinus.disabled = true;
    else if(qty_loadout === 0) btnMinus.disabled = false;
    else btnMinus.disabled = false;
  });

  // itemCart is used to save the data returned
  itemCart = [];
  document.querySelectorAll('[item_qty_loadout]').forEach((item) => {
    let qtyElement = document.querySelector(`[item_qty="${item.getAttribute('item_qty_loadout')}"]`);
    let qty = Number(qtyElement.getAttribute('value'));
    let qty_loadout = Number(item.getAttribute('value'));
    let counter = 0;
    for(let i = qty_loadout+1; i <= 4; i++)
    {
      // we can add more items to the loadout if theres still qty in our inventory
      const itemId = Number(item.getAttribute('item_qty_loadout'));
      if(qty > 0)
      {
        counter++;
        qty--;
        if(itemCart.length === 0 || !itemCart.find(e => Number(e.id) === itemId))
        {
          itemCart.push({
            id: itemId,
            quantity: -i,
            qty_loadout: i,
          });
        }
        // its gonna be found otherwise, so we just update
        else {
          itemCart[itemCart.findIndex(e => Number(e.id) === itemId)].quantity = -counter;
          itemCart[itemCart.findIndex(e => Number(e.id) === itemId)].qty_loadout = counter;
        }
      }
      // we make updates to the page related to the changes that should be done
      // console.log(counter);
      // console.log(qty);
      qtyElement.innerHTML = `${qty}`;
      qtyElement.setAttribute('value',`${qty}`);

      item.innerHTML = `${qty_loadout+counter}/4`;
      item.setAttribute('value',`${qty_loadout+counter}`);

      document.querySelector(`[qty_loadout_id="${itemId}"]`).innerHTML = item.innerHTML;
      document.querySelector(`[qty_loadout_id="${itemId}"]`).setAttribute('value',`${qty_loadout+counter}`);
    }
  });

  // console.log(itemCart);
  // now, we actually update the data
  await updateUser(user, true, user.money, itemCart);
  // btnAll.disabled = true;
});

btnClear.addEventListener('click', async() => {
  // btnAll.disabled = false;

  // btns are changed so we have the idea it's full
  document.querySelectorAll('.btnPlus').forEach((btnPlus) => {
    const qty_loadout = Number(document.querySelector(`[item_qty_loadout="${btnPlus.getAttribute('value')}"]`).getAttribute('value'));
    
    if(qty_loadout === 4) btnPlus.disabled = false;
    else if(qty_loadout === 0) btnPlus.disabled = true;
    else btnPlus.disabled = false;
  
  });

  document.querySelectorAll('.btnMinus').forEach((btnMinus) => {
    const qty_loadout = Number(document.querySelector(`[item_qty_loadout="${btnMinus.getAttribute('value')}"]`).getAttribute('value'));
    const qty = Number(document.querySelector(`[item_qty="${btnMinus.getAttribute('value')}"]`).getAttribute('value'));
    
    if(qty === 0) btnMinus.disabled = true;
    else if(qty_loadout === 4) btnMinus.disabled = true;
    else if(qty_loadout === 0) btnMinus.disabled = false;
    else btnMinus.disabled = false;
  });

  // itemCart is used to save the data returned
  itemCart = [];
  document.querySelectorAll('[item_qty_loadout]').forEach((item) => {
    let qtyElement = document.querySelector(`[item_qty="${item.getAttribute('item_qty_loadout')}"]`);
    let qty = Number(qtyElement.getAttribute('value'));
    let qty_loadout = Number(item.getAttribute('value'));
    let counter = 0;
    for(let i = qty_loadout-1; i >= 0; i--)
    {
      // we can add more items to the loadout if theres still qty in our inventory
      const itemId = Number(item.getAttribute('item_qty_loadout'));

      counter++;
      if(itemCart.length === 0 || !itemCart.find(e => Number(e.id) === itemId))
      {
        itemCart.push({
          id: itemId,
          quantity: i,
          qty_loadout: -i,
        });
      }
      // its gonna be found otherwise, so we just update
      else {
        itemCart[itemCart.findIndex(e => Number(e.id) === itemId)].quantity = counter;
        itemCart[itemCart.findIndex(e => Number(e.id) === itemId)].qty_loadout = -counter;
      }

      // we make updates to the page related to the changes that should be done
      qtyElement.innerHTML = `${qty+counter}`;
      qtyElement.setAttribute('value',`${qty+counter}`);

      item.innerHTML = `${qty_loadout-counter}/4`;
      item.setAttribute('value',`${qty_loadout-counter}`);

      document.querySelector(`[qty_loadout_id="${itemId}"]`).innerHTML = item.innerHTML;
      document.querySelector(`[qty_loadout_id="${itemId}"]`).setAttribute('value',`${qty_loadout-counter}`);
    }
  });

  // console.log(itemCart);
  // now, we actually update the data
  await updateUser(user, true, user.money, itemCart);
  // btnClear.disabled = true;
});

// buttons for shop, add 1 of each or add 10 of each
const btnAddOne = document.querySelector('.btnAddOne');
const btnAddTen = document.querySelector('.btnAddTen');

btnAddOne.addEventListener('click', () => {
  itemsCollection.forEach((item) => {
    // Check if an item with the same ID already exists in debugger
    const existingItem = itemCart.find((cartItem) => Number(cartItem.id) === item._document.data.value.mapValue.fields.id.integerValue);
    const currId = item._document.data.value.mapValue.fields.id.integerValue; 

    if (!existingItem) {
      // If the item with the same ID doesn't exist in itemCart, add it
      itemCart.push({
        id: currId,
        quantity: 1,
        qty_loadout: 0,
      });
    } else {
      // If the item with the same ID already exists, you can update the quantity, for example:
      existingItem.quantity += 1;
    }
    const ran = document.querySelector(`[qty_id="${currId}"]`);
    const idk = document.querySelector(`[item_qty="${currId}"]`);
    const btnMinus = document.querySelector(`.btnMinus[value="${currId}"]`);
    ran.innerHTML = Number(ran.innerHTML) + 1;
    btnMinus.disabled = false;

    //
    btnBuy.disabled = false;
    btnSell.disabled = false;

    // we sum up the money to the buy btn
    const price = item._document.data.value.mapValue.fields.price.integerValue;
    
    btnBuy.value = Number(btnBuy.value) + Number(price);
    btnBuy.innerHTML = `BUY: $${Number(btnBuy.value)}`;
    // we sum up the money to the buy btn
    btnSell.value = Number(btnSell.value) + Math.floor(price / 2);
    btnSell.innerHTML = `SELL: $${Number(btnSell.value)}`;

    idk.innerHTML = Number(idk.innerHTML) + 1;

  });
});

btnAddTen.addEventListener('click', () => {
  itemsCollection.forEach((item) => {
    // Check if an item with the same ID already exists in itemCart
    const existingItem = itemCart.find((cartItem) => Number(cartItem.id) === item._document.data.value.mapValue.fields.id.integerValue);
    const currId = item._document.data.value.mapValue.fields.id.integerValue; 

    if (!existingItem) {
      // If the item with the same ID doesn't exist in itemCart, add it
      itemCart.push({
        id: currId,
        quantity: 10,
        qty_loadout: 0,
      });
    } else {
      // If the item with the same ID already exists, you can update the quantity, for example:
      existingItem.quantity += 10;
    }
    const ran = document.querySelector(`[qty_id="${currId}"]`);
    const idk = document.querySelector(`[item_qty="${currId}"]`);
    const btnMinus = document.querySelector(`.btnMinus[value="${currId}"]`);
    ran.innerHTML = Number(ran.innerHTML) + 10;
    btnMinus.disabled = false;

    //
    btnBuy.disabled = false;
    btnSell.disabled = false;

    // we sum up the money to the buy btn
    const price = item._document.data.value.mapValue.fields.price.integerValue;
    
    // we sum up the money to the buy btn
    btnBuy.value = Number(btnBuy.value) + Number(price) * 10;
    btnBuy.innerHTML = `BUY: $${Number(btnBuy.value)}`;
    // we sum up the money to the buy btn
    btnSell.value = Number(btnSell.value) + Math.floor(price / 2) * 10;
    btnSell.innerHTML = `SELL: $${Number(btnSell.value)}`;

    idk.innerHTML = Number(idk.innerHTML) + 10;
    // console.log(itemCart);
  });
});

// listener to clean the mess we did with the cart
btnClean.addEventListener('click', () => {
  cleanShop();
});

const cleanShop = () => {
  // clear the btns
  btnBuy.innerHTML = 'BUY: $0';
  btnBuy.value = 0;
  btnSell.innerHTML = 'SELL: $0';
  btnSell.value = 0;

  // reset the btns of items
  document.querySelectorAll('.btnMinus').forEach((btnMinus) => {
    btnMinus.disabled = true;
  });

  // clean the fields of items
  document.querySelectorAll('[qty_id]').forEach((e) => {
    // console.log(e);
    let left = document.querySelector(`[item_qty="${e.getAttribute('qty_id')}"]`);
    left.innerHTML = Number(left.innerHTML) - Number(e.innerHTML);
    e.innerHTML = '0';
  });

  // we clean the cart
  itemCart = [];

  // we disable buy and sell
  btnBuy.disabled = true;
  btnSell.disabled = true;

  // we enable plus and minus btns
  document.querySelectorAll('.btnPlus').forEach((btnPlus) => {
    btnPlus.disabled = false;
  });
  document.querySelectorAll('.btnMinus').forEach((btnMinus) => {
    btnMinus.disabled = true;
  });
  
};