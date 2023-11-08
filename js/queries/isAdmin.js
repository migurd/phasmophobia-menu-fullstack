import getUser from "./getUser.js";

const isAdmin = async (email) => {
  try {
    const currentUser = await getUser(email);
    // console.log(currentUser);
    if (currentUser && currentUser.role === 0) {
      return true;
    }
  } catch (error) {
    console.error("Error checking if user is admin:", error);
    return false;
  }
  // alert('error');
  return false;
};

export default isAdmin;