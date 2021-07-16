app.get("/api/inviteUser", passport.authenticate("userPrivate"), (req, res) => {
  const { q, origin } = req.query;
  const messageBody = `${req.user.firstName} ${req.user.lastName} invites you to join Delivery Pay. Join Delivery Pay to make safe transactions. ${origin}/u/join?referer=${req.user._id}`;
  // send message here
  res.json({ code: "ok", message: "invitation sent" });
});

app.get("/api/getUsers", passport.authenticate("userPrivate"), (req, res) => {
  const { q } = req.query;
  User.find(
    {
      _id: { $ne: req.user._id },
      ...(q && {
        $or: [
          { firstName: new RegExp(q, "gi") },
          { lastName: new RegExp(q, "gi") },
          { phone: new RegExp(q, "gi") },
          { email: new RegExp(q, "gi") },
        ],
      }),
    },
    "firstName lastName email phone profileImg address"
  )
    .limit(20)
    .then((users) => {
      res.json(users);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "something went wrong" });
    });
});
app.get("/api/getChat", passport.authenticate("userPrivate"), (req, res) => {
  Chat.aggregate([
    {
      $match: {
        user: req.user._id,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "client",
        foreignField: "_id",
        as: "client",
      },
    },
    {
      $set: {
        client: {
          $first: "$client",
        },
      },
    },
    {
      $project: {
        "client.pass": 0,
        "client.notifications": 0,
        "client.balance": 0,
        "client.transactions": 0,
        "client.milestones": 0,
        "client.contacts": 0,
        "client.paymentMethods": 0,
        "client.chats": 0,
      },
    },
    {
      $sort: { "messages.createdAt": -1 },
    },
  ])
    .then((dbRes) => {
      res.json(dbRes);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "something went wrong" });
    });
});
app.post(
  "/api/sendContactRequest",
  passport.authenticate("userPrivate"),
  (req, res) => {
    Promise.all([
      User.findOneAndUpdate(
        {
          _id: req.user._id,
          contacts: { $not: { $elemMatch: { _id: req.body._id } } },
        },
        { $addToSet: { contacts: { _id: req.body._id } } }
      ),
      User.findOneAndUpdate(
        {
          _id: req.body._id,
          contacts: { $not: { $elemMatch: { _id: req.user._id } } },
        },
        { $addToSet: { contacts: { _id: req.user._id } } }
      ),
    ])
      .then(([user, target]) => {
        if (user && target) {
          res.json({ message: "request sent" });
          notify(
            target._id,
            JSON.stringify({
              title: "Contact Request",
              body: `${user.firstName} requested to contact.`,
            }),
            "User"
          );
        } else {
          res.status(400).json({ message: "bad request" });
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(400).json({ message: "bad request" });
      });
  }
);
app.patch(
  "/api/acceptContactRequest",
  passport.authenticate("userPrivate"),
  async (req, res) => {
    const client = await User.findOne({
      _id: req.body._id,
      contacts: { $elemMatch: { _id: req.user._id, status: "pending" } },
    });
    if (client) {
      const userContacts = req.user.contacts.map((user) => {
        if (
          user._id.toString() === client._id.toString() &&
          user.status === "pending"
        ) {
          return {
            ...user._doc,
            status: "connected",
          };
        } else {
          return user;
        }
      });
      const clientContacts = client.contacts.map((user) => {
        if (
          user._id.toString() === req.user._id.toString() &&
          user.status === "pending"
        ) {
          return {
            ...user._doc,
            status: "connected",
          };
        } else {
          return user;
        }
      });
      Promise.all([
        User.findOneAndUpdate(
          { _id: req.user._id },
          { contacts: userContacts },
          { new: true }
        ),
        User.findOneAndUpdate(
          { _id: client._id },
          { contacts: clientContacts },
          { new: true }
        ),
      ])
        .then(([user, client]) => {
          res.json({ message: "request accepted" });
          notify(
            client._id,
            JSON.stringify({
              title: "Contact Request Accepted",
              body: `${user.firstName} accepted your contact request.`,
            }),
            "User"
          );
        })
        .catch((err) => {
          console.log(err);
          res.status(400).json({ message: "something went wrong" });
        });
    } else {
      res.status(400).json({ message: "bad request" });
    }
  }
);
app.patch(
  "/api/updateLastSeen",
  passport.authenticate("userPrivate"),
  (req, res) => {
    if (req.body.rooms) {
      Chat.findOneAndUpdate(
        {
          $or: req.body.rooms.map((room) => ({ _id: room })),
          user: req.user._id,
        },
        { lastSeen: new Date() },
        { new: true }
      )
        .then((dbRes) => {
          res.json({ code: "ok" });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({ message: "something went wrong" });
        });
    } else {
      res.status(400).json({ message: "bad request" });
    }
  }
);

global.InitiateChat = async ({ user, client }) => {
  return Promise.all([
    new Chat({ user, client }).save().catch((err) => {
      if (err.code === 11000) {
        return Chat.findOne({ user, client });
      }
    }),
    new Chat({ user: client, client: user }).save().catch((err) => {
      if (err.code === 11000) {
        return Chat.findOne({ user: client, client: user });
      }
    }),
  ]);
};
global.SendMessage = async ({ rooms, message }) => {
  io.to(rooms[0].toString())
    .to(rooms[1].toString())
    .emit("messageToUser", {
      type: "milestone",
      ...message,
    });
  return Chat.updateMany(
    { $or: rooms.map((room) => ({ _id: room })) },
    { $push: { messages: message } }
  );
};
