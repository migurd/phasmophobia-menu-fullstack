// the idea of this function is to return the list of active items,
// its like some kind of "join" between users.user_items and items
import getUser from '../queries/getUser.js';
import itemsCollection from '../queries/getItems.js';
import getImageLink from '../queries/getImageLink.js';
import auth from '../firebase/authService.js';

const getJoinUserItems = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      let currUser = await new Promise((resolve, reject) => {
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

      if (!currUser) {
        resolve([]);
      }

      const itemPromises = itemsCollection.map(async (item) => {
        return {
          id: item._document.data.value.mapValue.fields.id.integerValue,
          name: item._document.data.value.mapValue.fields.name.stringValue,
          price: item._document.data.value.mapValue.fields.price.integerValue,
          description: item._document.data.value.mapValue.fields.description.stringValue,
          image: await getImageLink('items', item._document.data.value.mapValue.fields.image.stringValue),
          image_name: item._document.data.value.mapValue.fields.image.stringValue,
          tier: item._document.data.value.mapValue.fields.tier.integerValue,
          status: item._document.data.value.mapValue.fields.status.integerValue,
        };
      });

      const items = await Promise.all(itemPromises);
      items.sort((a, b) => a.id - b.id);
      items.sort((a, b) => b.status - a.status);

      let joinUserItems = [];

      items.forEach((item) => {
        currUser.user_items.forEach((user_item) => {
          if (Number(item.status) === 1 && Number(user_item.id) === Number(item.id)) {
            joinUserItems.push({
              id: Number(item.id),
              name: item.name,
              price: Number(item.price),
              image: item.image,
              image_name: item.image_name,
              tier: Number(item.tier),
              quantity: Number(user_item.quantity),
              qty_loadout: Number(user_item.qty_loadout),
            });
          }
        });
      });

      resolve(joinUserItems);
    } catch (error) {
      console.error("An error occurred:", error);
      reject(error);
    }
  });
};

export default getJoinUserItems;