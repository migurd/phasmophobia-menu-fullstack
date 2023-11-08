import itemsCollection from "./getItems.js";

const getItem = (id) => {
  let itemXD = [];
  itemsCollection.forEach((item) => {
    if(id === item._document.data.value.mapValue.fields.id.integerValue)
      itemXD = item._document.data.value.mapValue.fields;
  });
  return itemXD;
};

// itemsCollection.sort((item) => item._document.data.value.mapValue.fields.id.integerValue);
// console.log(itemsCollection);
export default getItem;