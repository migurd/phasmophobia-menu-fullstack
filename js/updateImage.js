// the idea of this module is to receive the old and new file,
// then delete the old one and upload a newer one

import { getStorage, ref, uploadBytes, deleteObject } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-storage.js";

const updateFile = (path, newFile, newFilename, isUrl = false, oldFile = null, oldFilename = null) => {
  try {
    const storage = getStorage();
    const storageRef = ref(storage, `${path}/${newFilename}`);

    if(!isUrl)
    {
    
      // 'file' comes from the Blob or File API
      uploadBytes(storageRef, newFile).then((snapshot) => {
        console.log('Uploaded a blob or file!');
      });
    
      // Create a reference to the file to delete
      const desertRef = ref(storage, `${path}/${oldFilename}`);
    
      if(oldFile !== null)
      {
        // Delete the file
        deleteObject(desertRef).then(() => {
          // File deleted successfully
        }).catch((error) => {
          console.log(error);
          // Uh-oh, an error occurred!
        });
      }
    }
    // url logic
    else {
      fetch(newFileName)
        .then(response => response.blob())
          .then(blob => {
            uploadBytes(storageRef, blob).then((snapshot) => {
              console.log('Uploaded the file!');
            });
          })
        .catch(error => {
          console.error('Error downloading or uploading the file:', error);
      });
    }
  }
  catch(error){
    console.log(error);
  }
};

export default updateFile;