const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://kaushalkishore4327_db_user:B2AepSDQvvtsm9b8@namastenode.djbel7o.mongodb.net/devTinder"
  );
};

module.exports = {
  connectDB,
};
