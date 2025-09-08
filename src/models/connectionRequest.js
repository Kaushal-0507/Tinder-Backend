const mongoose = require("mongoose");
const { required } = require("nodemon/lib/config");

const ConnectionRequestModel = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ["ignored", "interested", "accepted", "rejected"],
        message: `{VALUE} is invalid`,
      },
    },
  },
  { timestamps: true }
);

ConnectionRequestModel.index({ fromUserId: 1, toUserId: 1 });

ConnectionRequestModel.pre("save", async function (next) {
  const connectionRequest = this;
  if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
    throw new Error("Cannot send request to yourself!!!");
  }
  next();
});

const ConnectionRequest = new mongoose.model(
  "connectionRequest",
  ConnectionRequestModel
);

module.exports = ConnectionRequest;
