const validateEditProfile = (req) => {
  const allowedEditFields = [
    "firstName",
    "lastName",
    "age",
    "gender",
    "about",
    "photos",
    "hobbies",
  ];
  const isValid = Object.keys(req.body).every((key) =>
    allowedEditFields.includes(key)
  );
  return isValid;
};

module.exports = {
  validateEditProfile,
};
