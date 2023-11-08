import itemsCollection from '../queries/getItems.js';
import getImageLink from '../queries/getImageLink.js';
import updateItem from '../queries/updateItem.js';
import updateFile from '../updateImage.js';

let table_content = document.querySelector('.table_content');
const btnClose = document.querySelector('.btnClose');
const editItemCard = document.querySelector('.editItemCard');
const background = document.querySelector('.background');

// btns to update
const btnUpdate = document.querySelector('.btnUpdate');
const btnActivate = document.querySelector('.btnActivate');
const btnDeactivate = document.querySelector('.btnDeactivate');

// img thingy
// img
const btnPostFile = document.getElementById('btnPostFile');
const postImage = document.querySelector('.postImage');
const imageUrlInput = document.querySelector('#menu input[type="text"]');

// Add an event listener to the URL input
imageUrlInput.addEventListener('input', function() {
  const imageUrl = this.value.trim();
  if (imageUrl) {
    postImage.src = imageUrl; // Update the image source with the URL
  }
});

// Add an event listener to the file input
btnPostFile.addEventListener('change', function() {
  const file = this.files[0]; // Get the selected file
  if (file) {
    const fileURL = URL.createObjectURL(file); // Create a URL for the selected file
    postImage.src = fileURL; // Update the image source
    imageUrlInput.value = ''; // Clear the URL input
  }
});

// edit item menu
btnClose.addEventListener('click', () => {
  editItemCard.classList.add('inactive');
  background.classList.add('inactive');
});

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

// IT TOOK A YEAR TO GET HERE WITH THE DAMN PROMISE
Promise.all(itemPromises)
  .then((items) => {
    items.sort((a,b) => a.id - b.id);
    items.sort((a,b) => b.status - a.status);
    items.forEach((item) => {
      const newElement = document.createElement('tr');
      // console.log(item.status);
      if(Number(item.status) === 1)
        newElement.classList.add('btnItems');
      else
        newElement.classList.add('btnItems','disabled');
      // console.log(item);
      newElement.innerHTML = `
        <th scope="row"><img style="width: 100px; height: 100px; object-fit: contain;" src="${item.image}" alt="Item ${item.id}" /></th>
        <td>${item.id}</td>
        <td>${item.name}</td>
        <td>${item.price}</td>
        <td>${item.description}</td>
        <td>${item.tier}</td>
        <td>${item.status}</td>
      `;
      table_content.appendChild(newElement);

      // NOW WE HAVE TO MAKE A LISTENER SO WHEN WE CLICK AN OBJECT WE GET THE CURRENT ITEM
      newElement.addEventListener('click', async () => {
        // a screen with the chosen product is showed
        const txtTitle = document.querySelector('.txtTitle');
        const txtName = document.querySelector('#txtName');
        const txtDescription = document.querySelector('#txtDescription');
        const txtPrice = document.querySelector('#txtPrice');
        const cbTier = document.querySelector('#cbTier');
        txtTitle.innerHTML = `Update Item ${item.id}`;
        txtName.value = item.name;
        txtDescription.value = item.description;
        txtPrice.value = item.price;
        cbTier.value = item.tier;
        imageUrlInput.value = item.image;

        editItemCard.classList.remove('inactive');
        background.classList.remove('inactive');

        let selectedFile = btnPostFile.files[0];
        // console.log(selectedFile);
        const imageUrl = imageUrlInput.value.trim();
        if (imageUrl) {
          postImage.src = imageUrl; // Update the image source with the URL
        }
        
        let fileName = null;
        if(!selectedFile)
          fileName = imageUrl;
        else
          fileName = selectedFile.name;

        // given the case the person wants to update the data, then
        btnUpdate.addEventListener('click', async () => {
          if(areFieldsFilledIn())
          {
            if(!isURLValid(imageUrlInput.value)) { // if you write a bad link, itll work anyway. wheres god.
              alert("Insert a valid URL for the image");
              return;
            }
            selectedFile = btnPostFile.files[0];
            if(selectedFile)
              fileName = selectedFile.name;
            // creating a sw to check if the img is different
            let sw = false;
            if(fileName && fileName === imageUrlInput.value && !selectedFile)
              sw = true;
  
            if(sw)
              fileName = item.image_name; // the old one, it wasnt changed
            // we update the img if the condition wasnt met
            if(!sw)
            {
              
              if (selectedFile) {
                updateFile('items',selectedFile, fileName);
  
              } else if (imageUrl) {
                // we dont need to update it, we just save the link
                //updateFile('items',selectedFile, fileName,true);
                fileName = imageUrlInput.value;
              }
            }
            await updateItem(
              {
                id: item.id,
                name: txtName.value,
                price: txtPrice.value,
                description: txtDescription.value,
                image: fileName,
                tier: cbTier.value,
                status: item.status,
              }
            );
            location.reload();
          }
        });

        btnActivate.addEventListener('click', async () => {
          await updateItem(
            {
              id: item.id,
              name: txtName.value,
              price: txtPrice.value,
              description: txtDescription.value,
              image: item.image_name,
              tier: cbTier.value,
              status: 1,
            }
          );
          location.reload();
        });
        
        btnDeactivate.addEventListener('click', async () => {
          await updateItem(
            {
              id: item.id,
              name: txtName.value,
              price: txtPrice.value,
              description: txtDescription.value,
              image: item.image_name,
              tier: cbTier.value,
              status: 0,
            }
          );
          location.reload();
        });

      });
    });
    
  })
  .catch((error) => {
    console.error("An error occurred:", error);
  });

const areFieldsFilledIn = () => {
  if(
    txtName.value.trim() !== '' &&
    txtDescription.value.trim() !== '' &&
    txtPrice.value > 0
    ) {
      if(!isInteger(txtPrice.value))
      {
        alert("Prices only accept integers.");
        return false;
      }
      return true;
    }
  alert("Please, fill in all the fields.");
  return false;
};

function isURLValid(url) {
  try {
    const parsedURL = new URL(url);
    // Check if the URL has a valid scheme (e.g., http, https)
    return ['http:', 'https:'].includes(parsedURL.protocol);
  } catch (error) {
    // URL parsing failed, indicating an invalid URL
    return false;
  }
}

function isInteger(value) {
  // Remove leading and trailing spaces from the input
  value = value.trim();

  // Check if the input is a non-empty string that consists of digits and doesn't contain a decimal point
  return value !== '' && /^[0-9]+$/.test(value) && !value.includes('.');
}