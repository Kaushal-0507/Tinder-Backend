const validateEditProfile = (req) => {
  const allowedEditFields = ["age", "gender", "about", "photoUrl", "hobbies"];
  const isValid = Object.keys(req.body).every((key) =>
    allowedEditFields.includes(key)
  );
  return isValid;
};

module.exports = {
  validateEditProfile,
};
