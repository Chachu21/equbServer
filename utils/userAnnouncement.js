import cron from "node-cron";
import Payment from "../models/payments.js";
import User from "../models/users.js";
import Group from "../models/groups.js";
import sendSMS from "../config/sendSMS.js";
async function sendPrePaymentReminder(user, group) {
  try {
    // Sending a pre-payment reminder notification to the user via SMS
    const message = `Hi ${user.name}, it's time to make your payment of round ${group.round} in group ${group.name} equb. Please make your payment soon.`;
    // Send SMS function here
    // sendSMS(user.phone, message);
    console.log(message);
  } catch (error) {
    console.error("Error sending pre-payment reminder:", error.message);
  }
}

async function sendPostPaymentNotification(user, group) {
  try {
    // Sending a post-payment notification to the user via SMS
    const message = `Hi ${user.name}, your payment for the next round in group ${group.name} has been received successfully. Thank you!`;
    // Send SMS function here
    sendSMS(user.phone, message);
    // console.log(message);
  } catch (error) {
    console.error("Error sending post-payment notification:", error.message);
  }
}

async function sendPaymentDeadlineNotification(user, group) {
  try {
    // Sending a payment deadline notification to the user via SMS
    const message = `Hi ${user.name}, the payment deadline of round ${group.round} in group ${group.name} is now. Please make your payment as soon as possible to avoid any issues.`;
    // Send SMS function here
    // sendSMS(user.phone, message);
    console.log(message);
  } catch (error) {
    console.error(
      "Error sending payment deadline notification:",
      error.message
    );
  }
}

async function sendPostReminderForUnpaidPayments(user, group) {
  try {
    // Sending a post-reminder for unpaid payments after the payment deadline
    const message = `Hi ${user.name}, the payment deadline for the next round in group ${group.name} has passed, and your payment is still pending. Please make your payment as soon as possible to avoid any issues.`;
    // Send SMS function here
    // sendSMS(user.phone, message);
    console.log(message);
  } catch (error) {
    console.error(
      "Error sending post-reminder for unpaid payments:",
      error.message
    );
  }
}

async function announceUnpaidMembersBeforeWinnerSelection(group) {
  try {
    let addation = 0;
    if (group.types === "daily" && group.paymentInterval === 1) {
      addation = 20 * 60 * 60 * 1000;
    } else if (group.types === "weekly") {
      addation = 24 * 60 * 60 * 1000;
    } else {
      addation = 2 * 24 * 60 * 60 * 1000;
    }

    const overdueMembers = [];
    const today = new Date();

    const winnerSelectionDate = new Date(group.startDate);
    const durationMilliseconds = group.roundDuration * 24 * 60 * 60 * 1000;
    winnerSelectionDate.setTime(
      winnerSelectionDate.getTime() + durationMilliseconds
    );

    const paymentIntervalInMillis = group.paymentInterval * 24 * 60 * 60 * 1000;
    const announcementDate = new Date(
      winnerSelectionDate.getTime() - paymentIntervalInMillis
    );

    if (today.toString() === announcementDate.toString()) {
      for (const member of group.members) {
        const userId = member;
        const userData = await User.findById(userId);
        if (!userData) continue;

        const payments = await Payment.find({
          user: userId,
          equbGroup: group._id,
          round: group.round,
        });

        const hasSuccessfulPayment = payments.some(
          (payment) => payment.status === "success"
        );

        if (!hasSuccessfulPayment) {
          overdueMembers.push(member);
        }
      }

      if (overdueMembers.length > 0) {
        const message = `Group ${
          group.name
        } has overdue payments from: ${overdueMembers.join(
          ", "
        )} before winner selection!`;
        console.log(message);

        const notification = new Notification({
          message,
          groupId: group._id,
          userID: member,
        });
        await notification.save();
      }
    }
  } catch (error) {
    console.log(
      "Error announcing unpaid members before winner selection:",
      error.message
    );
  }
}

async function UserUnPaidAnnouncement(group) {
  console.log("from deadline");
  let addation = 0;
  if (group.types === "daily" && group.roundDuration === 1) {
    addation = 3 * 60 * 60 * 1000;
  } else if (group.types === "weekly") {
    addation = 24 * 60 * 60 * 1000;
  } else {
    addation = 1 * 24 * 60 * 60 * 1000;
  }
  try {
    const today = new Date();
    const overdueMembers = [];
    console.log("i am in side for loop");
    for (const member of group.members) {
      const userId = member;
      const userData = await User.findById(userId);
      if (!userData) continue;

      const payments = await Payment.find({
        user: userId,
        equbGroup: group._id,
        round: group.round,
      });

      // console.log("payment from deadline announcment", payments);
      // if (!payments.length) continue;

      const hasSuccessfulPayment = payments.some(
        (payment) => payment.status === "success"
      );

      // const lastPayment = payments[payments.length - 1];
      const paymentIntervalInMillis =
        group.paymentInterval * 24 * 60 * 60 * 1000;
      const winnerSelectionDate = new Date(group.startDate);
      const durationMilliseconds = group.roundDuration * 24 * 60 * 60 * 1000;
      winnerSelectionDate.setTime(
        winnerSelectionDate.getTime() + durationMilliseconds
      );
      const paymentDeadline = new Date(
        winnerSelectionDate.getTime() - paymentIntervalInMillis + addation
      );
      console.log(today.toString() === paymentDeadline.toString());
      if (today.toString() === paymentDeadline.toString()) {
        if (!hasSuccessfulPayment) {
          console.log("pushin unpaid to overdue");
          overdueMembers.push(member);
        }
      } else {
        console.log("error in un paid payment notification");
      }
    }
    if (overdueMembers.length > 0) {
      console.log("inside overdue member greater than 0");
      // Send notifications to overdue members
      for (const memberId of overdueMembers) {
        const userData = await User.findById(memberId);
        if (userData) {
          await sendPaymentDeadlineNotification(userData, group);
        }
      }
    }
  } catch (error) {
    console.error(
      "Error announcing unpaid members before winner selection:",
      error.message
    );
  }
}
//for announce members for deadline of paymnet time
// const UserUnPaidAnnouncement = async (group) => {
//   let addation = 0;
//   if (group.types === "daily") {
//     addation = 3 * 60 * 60 * 1000;
//   } else if (group.types === "weekly") {
//     addation = 24 * 60 * 60 * 1000;
//   } else {
//     addation = 1 * 24 * 60 * 60 * 1000;
//   }
//   const today = new Date();
//   const overdueMembers = [];
//   const userId = member;
//   const userData = await User.findById(userId);
//   if (!userData) {
//     return;
//   }

//   const payments = await Payment.find({
//     userId,
//     groupId: group._id,
//     status: "success",
//   });
//   console.log(payments);
//   if (!payments.length) {
//     return;
//   }
//   const lastPayment = payments[payments.length - 1];
//   const paymentIntervalInMillis = group.paymentInterval * 24 * 60 * 60 * 1000;
//   const paymentDeadline = new Date(
//     winnerSelectionDate.getTime() - paymentIntervalInMillis + addation
//   );

//   if (today === paymentDeadline && !lastPayment) {
//     overdueMembers.push(member);
//     logMessages.push(`Sent payment deadline notification to ${userData.name}`);
//     await sendPaymentDeadlineNotification(userData, group);
//   } else {
//     console.log("error in un paid payment notification");
//   }
// };
//for announcement of pre paymnet  of members
const userPrePaymentAnouncement = async (group) => {
  // console.log("from pre payment announcement", group);
  for (const member of group.members) {
    const userId = member;
    const userData = await User.findById(userId);
    if (!userData) continue;
    if (userData) {
      // console.log(userData.name);
      await sendPrePaymentReminder(userData, group);
    }
  }
};

const userScheduleAnnouncement = async () => {
  try {
    const groups = await Group.find({ status: "started" });
    // console.log(groups);
    for (const group of groups) {
      let addation = 0;
      if (group.types === "daily" && group.roundDuration === 1) {
        addation = 3 * 60 * 60 * 1000;
      } else if (group.types === "weekly") {
        addation = 24 * 60 * 60 * 1000;
      } else {
        addation = 1 * 24 * 60 * 60 * 1000;
      }
      const paymentIntervalInMillis =
        group.paymentInterval * 24 * 60 * 60 * 1000;
      const winnerSelectionDate = new Date(group.startDate);
      // console.log("start date of group", group.startDate.toString());
      // Convert group.roundDuration from days to milliseconds
      const durationMilliseconds = group.roundDuration * 24 * 60 * 60 * 1000;
      winnerSelectionDate.setTime(
        winnerSelectionDate.getTime() + durationMilliseconds
      );

      console.log("winner selection date: " + winnerSelectionDate);
      // const announcementDate = new Date(
      //   winnerSelectionDate.getTime() - paymentIntervalInMillis
      // );

      // for pre reminder time
      const preReminderDate = new Date(
        winnerSelectionDate.getTime() - paymentIntervalInMillis - 120000
      );

      // console.log("winnerSelectionDate", winnerSelectionDate);
      // console.log("announcementDate", announcementDate);
      // Ensure all components of the cron pattern are valid numbers
      const seconds = isNaN(preReminderDate.getSeconds())
        ? "*"
        : preReminderDate.getSeconds();
      const minutes = isNaN(preReminderDate.getMinutes())
        ? "*"
        : preReminderDate.getMinutes();
      const hours = isNaN(preReminderDate.getHours())
        ? "*"
        : preReminderDate.getHours();
      const dayOfMonth = isNaN(preReminderDate.getDate())
        ? "*"
        : preReminderDate.getDate();
      const month = isNaN(preReminderDate.getMonth() + 1)
        ? "*"
        : preReminderDate.getMonth() + 1;

      //for un paid
      //for paymnet deadline
      const paymentDeadline = new Date(
        winnerSelectionDate.getTime() - paymentIntervalInMillis + addation
      );

      console.log("paymnet deadline: " + paymentDeadline);

      const Unseconds = isNaN(paymentDeadline.getSeconds())
        ? "*"
        : paymentDeadline.getSeconds();
      const Unminutes = isNaN(paymentDeadline.getMinutes())
        ? "*"
        : paymentDeadline.getMinutes();
      const Unhours = isNaN(paymentDeadline.getHours())
        ? "*"
        : paymentDeadline.getHours();
      const UndayOfMonth = isNaN(paymentDeadline.getDate())
        ? "*"
        : paymentDeadline.getDate();
      const Unmonth = isNaN(paymentDeadline.getMonth() + 1)
        ? "*"
        : paymentDeadline.getMonth() + 1;
      // Construct the cron pattern
      const cronPattern = `${seconds} ${minutes} ${hours} ${dayOfMonth} ${month} *`;
      const unpaidpattern = `${Unseconds} ${Unminutes} ${Unhours} ${UndayOfMonth} ${Unmonth} *`;
      console.log("from user pre payment announce", cronPattern);
      console.log("from user deadline", unpaidpattern);
      // Schedule announcementOfUser function to run on the calculated announcement date
      cron.schedule(cronPattern, () => userPrePaymentAnouncement(group));
      cron.schedule(unpaidpattern, () =>
        announceUnpaidMembersBeforeWinnerSelection(group)
      );
    }
  } catch (error) {
    console.error("Error scheduling announcement:", error.message);
  }
};

export default userScheduleAnnouncement;
