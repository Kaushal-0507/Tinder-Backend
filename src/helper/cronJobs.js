const cron = require("node-cron");
const { subDays, startOfDay, endOfDay } = require("date-fns");
const ConnectionRequest = require("../models/connectionRequest");
const sendEmail = require("./sendEmail");

cron.schedule(" 0 8 * * *", async () => {
  try {
    const yesterday = subDays(new Date(), 1);
    const yesterdayStart = startOfDay(yesterday);
    const yesterdayEnd = endOfDay(yesterday);

    const yesterdayPendingReq = await ConnectionRequest.find({
      status: "interested",
      createdAt: {
        $gte: yesterdayStart,
        $lt: yesterdayEnd,
      },
    }).populate("fromUserId toUserId");

    const listOfEmails = [...new Set(yesterdayPendingReq.map((res) => res))];

    for (const obj of listOfEmails) {
      try {
        const res = await sendEmail.run(
          obj.toUserId.firstName +
            " you have new friend request from " +
            obj.fromUserId.firstName,
          "Login in to stumble.live to view the request."
        );
      } catch (error) {
        console.log(error);
      }
    }
  } catch (error) {
    console.log(error);
  }
});
