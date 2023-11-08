import itemsCollection from '../queries/getItems.js';
import getImageLink from '../queries/getImageLink.js';

let table_content = document.querySelector('.table_content');

const itemPromises = itemsCollection.map(async (item) => {
  return {
    id: item._document.data.value.mapValue.fields.id.integerValue,
    name: item._document.data.value.mapValue.fields.name.stringValue,
    price: item._document.data.value.mapValue.fields.price.integerValue,
    description: item._document.data.value.mapValue.fields.description.stringValue,
    image: await getImageLink('items', item._document.data.value.mapValue.fields.image.stringValue),
    tier: item._document.data.value.mapValue.fields.tier.integerValue,
    status: item._document.data.value.mapValue.fields.status.integerValue,
  };
});

// IT TOOK A YEAR TO GET HERE WITH THE DAMN PROMISE
Promise.all(itemPromises)
  .then((items) => {
    items.forEach((item) => {
      const newElement = document.createElement('tr');
      // console.log(item);
      newElement.innerHTML = `
        <th scope="row"><img style="width: 80px;" src="${item.image}" alt="Item ${item.id}" /></th>
        <td>${item.id}</td>
        <td>${item.name}</td>
        <td>${item.price}</td>
        <td>${item.description}</td>
        <td>${item.tier}</td>
        <td>${item.status}</td>
      `;
      table_content.appendChild(newElement);
    });
  })
  .catch((error) => {
    console.error("An error occurred:", error);
  });

