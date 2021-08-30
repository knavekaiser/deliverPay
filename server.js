const express = require("express");
const webPush = require("web-push");
global.mongoose = require("mongoose");
global.Schema = mongoose.Schema;
global.passport = require("passport");
global.jwt = require("jsonwebtoken");
global.jwt_decode = require("jwt-decode");
global.bcrypt = require("bcryptjs");
global.ObjectId = require("mongodb").ObjectId;
global.fetch = require("node-fetch");
require("./models/user");
require("./models/payment");
require("./models/dispute");
require("./models/chat");
require("./models/support");
require("./models/product");
require("dotenv").config();
require("./mailService");
require("./smsService");
const PORT = process.env.PORT || 3001;
const URI = process.env.MONGO_URI;
const Razorpay = require("razorpay");
const path = require("path");

global.razorpay = new Razorpay({
  key_id: process.env.RAZOR_PAY_ID,
  key_secret: process.env.RAZOR_PAY_SECRET,
});

Number.prototype.fix = function (p) {
  return +this.toFixed(p || 2);
};
Number.prototype.addPercent = function (n) {
  return (this * ((100 + (+n || 0)) / 100)).fix();
};

const { handleSignIn } = require("./config/passport.js");
global.notify = (client, body, clientType) => {
  if (clientType) {
    const parsed = JSON.parse(body);
    mongoose.models[clientType]
      .findOneAndUpdate(
        { _id: client },
        { $push: { notifications: { ...parsed } } }
      )
      .then((notificationSaved) => {});
  }
  return NotificationSubscription.find({ client }).then((subscriptions) => {
    subscriptions.forEach((sub) => {
      const { endpoint, keys } = sub;
      const subscription = { endpoint, keys };
      return webPush.sendNotification(subscription, body).catch((err) => {
        console.log("could not send notification");
      });
    });
  });
};

global.moment = ({ time, format }) => {
  if (new Date(time).toString() === "Invalid Date") {
    return time;
  }
  const options = {
    year: format.includes("YYYY") ? "numeric" : "2-digit",
    month: format.includes("MMMM")
      ? "long"
      : format.includes("MMM")
      ? "short"
      : format.includes("MM")
      ? "2-digit"
      : "numeric"
      ? "long"
      : format.includes("ddd")
      ? "short"
      : "narrow",
    weekday: format.includes("dddd")
      ? "long"
      : format.includes("ddd")
      ? "short"
      : "narrow",
    day: format.includes("DD") ? "2-digit" : "numeric",
    hour: format.includes("hh") ? "2-digit" : "numeric",
    minute: format.includes("mm") ? "2-digit" : "numeric",
    second: format.includes("ss") ? "2-digit" : "numeric",
  };
  const values = {};
  new Intl.DateTimeFormat("en-IN", options)
    .formatToParts(new Date(time || new Date()))
    .map(({ type, value }) => {
      values[type] = value;
    });
  return format
    .replace(/Y+/g, values.year)
    .replace(/M+/g, values.month)
    .replace(/D+/g, values.day)
    .replace(/h+/g, values.hour)
    .replace(/m+/g, values.minute)
    .replace(/s+/g, values.second)
    .replace(/a+/g, values.dayPeriod)
    .replace(/d+/g, values.weekday);
};

const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;
webPush.setVapidDetails(
  "mailto:support@deliverypay.in",
  publicVapidKey,
  privateVapidKey
);

global.app = express();

mongoose
  .connect(URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log("connected to db"))
  .catch((err) => console.log("could not connect to db, here's why: " + err));

app.use(express.json());

const cookieParser = require("cookie-parser");
app.use(cookieParser());
require("./config/passport");
app.use(passport.initialize());

app.get("/api/logout", (req, res) => {
  res.clearCookie("access_token");
  res.json({ user: null, success: true });
});

// ------------------------------------------------------- OAuth
app.get(
  "/api/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
app.get(
  "/googleAuthcalllback",
  passport.authenticate("google", {
    successRedirect: "/",
    failureRedirect: "/login",
  }),
  handleSignIn
);
app.get("/api/auth/facebook", passport.authenticate("facebook"));
app.get(
  "/facebookAuthCallback",
  passport.authenticate("facebook", {
    successRedirect: "/",
    failureRedirect: "/login",
  }),
  handleSignIn,
  (err, req, res, next) => {
    res.status(401).json({ code: 401, message: "invalid credentials" });
  }
);

require("./routes/user.js");
require("./routes/payments.js");
require("./routes/disputes.js");
require("./routes/products.js");
require("./routes/chats.js");
require("./routes/support.js");
require("./routes/orders.js");

app.post("/api/contactUsRequest", (req, res) => {
  const { name, email, phone, message } = req.body;
  if (name && message && (email || phone)) {
    new ContactUs({ ...req.body })
      .save()
      .then((dbRes) => {
        res.json({ code: "ok", message: "request submitted" });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "something went wrong" });
      });
  } else {
    res.status(400).json({
      code: 400,
      message: "name, message and phone/email is required",
    });
  }
});
app.post("/api/workRequest", (req, res) => {
  const { firstName, lastName, email, phone, resume } = req.body;
  if (firstName && lastName && email && phone && resume) {
    new WorkRequest({ ...req.body })
      .save()
      .then((dbRes) => {
        res.json({ code: "ok", message: "request submitted" });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "something went wrong" });
      });
  } else {
    res.status(400).json({
      code: 400,
      message: "name, message and phone/email is required",
    });
  }
});

// notification
app.post("/api/subscribe", passport.authenticate("userPrivate"), (req, res) => {
  new NotificationSubscription({ ...req.body, client: req.user._id })
    .save()
    .then((dbRes) => {
      res.status(200).json({ message: "successfully subscribed" });
    })
    .catch((err) => {
      if (err.code === 11000) {
        res.json({ message: "already subscribed" });
      } else {
        res.status(500).json({ message: "something went wrong" });
      }
    });
});
app.delete(
  "/api/unsubscribe",
  passport.authenticate("userPrivate"),
  (req, res) => {
    NotificationSubscription.findOneAndDelete({ client: req.user._id })
      .then((dbRes) => {
        res.status(200).json({ message: "successfully unsubscribed" });
      })
      .catch((err) => {
        res.status(500).json({ message: "something went wrong" });
      });
  }
);

app.use(express.static(path.join(__dirname, "client/build")));
app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "/client/build/index.html"))
);

const socketIO = require("socket.io");
global.io = socketIO(
  app.listen(PORT, () => {
    console.log("Delivery Pay backend listening to port:", PORT);
  })
);

const parseCookies = (raw) => {
  const cookies = {};
  if (raw) {
    raw.split("; ").forEach((item, i) => {
      cookies[item.split("=")[0]] = item.split("=")[1];
    });
  }
  return cookies;
};
io.on("connection", async (socket) => {
  const {
    headers: { cookie },
  } = socket.handshake;
  await jwt.verify(
    parseCookies(cookie).access_token || cookie || "",
    process.env.JWT_SECRET,
    async (err, decoded) => {
      if (decoded) {
        socket.on("joinRooms", async ({ rooms }) => {
          socket.join(decoded.sub.toString());
          rooms.forEach((room) => {
            socket.join(room);
          });
        });
        socket.on("initiateChat", async ({ client_id, newChat }) => {
          InitiateChat({ user: decoded.sub, client: client_id })
            .then(([userChat, clientChat]) => {
              socket.join(userChat._id.toString());
              socket.join(clientChat._id.toString());
              socket.emit("connectedToRoom", {
                rooms: [userChat._id, clientChat._id],
                ...(newChat && {
                  newChat: !!newChat,
                  client: clientChat.user,
                  clientRoom_id: clientChat._id,
                }),
              });
            })
            .catch((err) => {
              console.log(err);
              socket.disconnect();
            });
        });
        socket.on("messageToServer", async ({ rooms, message, newChat }) => {
          const [
            { userBlockList, userProfile },
            { clientBlockList, clientProfile },
          ] = await Promise.all([
            User.findOne(
              { _id: decoded.sub },
              `${
                newChat && "firstName lastName profileImg phone email"
              } blockList`
            ).then((dbRes) => ({
              userBlockList: dbRes?.blockList,
              ...(newChat && { userProfile: { ...dbRes._doc } }),
            })),
            User.findOne(
              { _id: message.to },
              `${
                newChat && "firstName lastName profileImg phone email"
              } blockList`
            ).then((dbRes) => ({
              clientBlockList: dbRes?.blockList,
              ...(newChat && { clientProfile: { ...dbRes._doc } }),
            })),
          ]);
          const blocked =
            clientBlockList?.some(
              (_id) => _id.toString() === decoded.sub.toString()
            ) ||
            userBlockList?.some(
              (_id) => _id.toString() === message.to.toString()
            );
          if (!blocked) {
            SendMessage({
              rooms,
              message: {
                ...message,
                from: decoded.sub,
              },
            }).then(async (chatRes) => {
              if (chatRes) {
                if (newChat) {
                  const chat = await Chat.aggregate([
                    {
                      $match: {
                        user: clientProfile._id,
                        client: ObjectId(decoded.sub),
                      },
                    },
                    {
                      $lookup: {
                        from: "users",
                        as: "clientProfile",
                        let: {
                          client: "$client",
                        },
                        pipeline: [
                          { $match: { $expr: { $eq: ["$$client", "$_id"] } } },
                          {
                            $project: {
                              firstName: 1,
                              lastName: 1,
                              phone: 1,
                              email: 1,
                              profileImg: 1,
                              address: 1,
                            },
                          },
                        ],
                      },
                    },
                    {
                      $lookup: {
                        from: "chats",
                        as: "clientChat",
                        let: { client: "$client", user: "$user" },
                        pipeline: [
                          {
                            $match: {
                              $expr: {
                                $and: [
                                  { $eq: ["$$client", "$user"] },
                                  { $eq: ["$$user", "$client"] },
                                ],
                              },
                            },
                          },
                          { $project: { lastSeen: 1 } },
                        ],
                      },
                    },
                    {
                      $set: {
                        client: {
                          $mergeObjects: [
                            { $first: "$clientProfile" },
                            { _id: "$client" },
                          ],
                        },
                      },
                    },
                    {
                      $set: {
                        "client.lastSeen": { $first: "$clientChat.lastSeen" },
                      },
                    },
                    { $unset: ["clientProfile", "clientChat"] },
                  ]).then((dbRes) =>
                    dbRes.map((item) => ({
                      ...item,
                      status: "",
                      userBlock: userBlockList?.some(
                        (_id) => _id.toString() === clientProfile._id.toString()
                      ),
                      clientBlock: clientBlockList?.some(
                        (_id) => _id.toString() === decoded.sub.toString()
                      ),
                    }))
                  );
                  io.to(clientProfile._id.toString()).emit("newChat", {
                    chat: chat[0],
                  });
                }
              } else {
                socket.emit("sendFail", { err: "Room does not exists" });
              }
            });
          } else {
            socket.emit("sendFail", {
              err: "Blocked by user or client",
            });
          }
        });
        socket.on("clientAway", (payload) => {
          notify(
            payload.to,
            JSON.stringify({
              title: "New message!",
              body: payload.text,
            }),
            "User"
          );
        });
      } else {
        socket.disconnect();
      }
    }
  );
});
