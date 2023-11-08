import itemsCollection from "./getItems.js";

await itemsCollection;

const getNextItemAvailableId = () => {
  // yeah, its actually that easy 👍
  if(itemsCollection.length > 0)
  {
    return itemsCollection.length + 1;
  }
  return 1;
}

export default getNextItemAvailableId;