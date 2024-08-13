import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();

const accountSid = process.env.ACCOUNTID;
const authToken = process.env.AUTHTOKEN;
const twilioPhoneNumber = process.env.TWILIOPHONENUMBER;
const client = new twilio(accountSid, authToken);

// Function to send SMS notification using Twilio
const sendSMS = async (phoneNumber, messageType) => {
  try {
    const response = await client.messages.create({
      body: messageType,
      from: twilioPhoneNumber,
      to: phoneNumber, // Dynamically pass the recipient's phone number
    });

    console.log("SMS sent successfully:", response.sid); // Uncomment for debugging
  } catch (error) {
    console.error("Error sending SMS:", error);
  }
};

export default sendSMS;
