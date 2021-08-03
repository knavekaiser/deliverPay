global.sendSms = ({ to, otp, body }) => {
  const reqBody = {
    route: "dlt",
    sender_id: otp ? "DelOTP" : "DelPay",
    message: body,
    flash: 0,
    numbers: to.join(),
  };
  console.log(reqBody);
  return fetch(`https://www.fast2sms.com/dev/bulkV2`, {
    method: "POST",
    headers: {
      authorization: process.env.FAST2SMS_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reqBody),
  }).then((res) => res.json());
};
