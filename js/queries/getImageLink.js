import { getStorage, ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-storage.js";

const getImageLink = async (folder, img_name) => {
  // Create a reference with an initial file path and name
  let urlLink = '';
  const storage = getStorage();

  // given the case, the img_name wasnt saved in storage but in a link
  if(img_name.includes("http"))
    return img_name;

  await getDownloadURL(ref(storage, `${folder}/${img_name}`))
    .then((url) => {
      // `url` is the download URL for 'images/stars.jpg'
      // console.log(url);
      urlLink = url;
    })
    .catch((error) => {
      // Handle any errors
      console.log(error);
    });
    return urlLink;
}


export default getImageLink;