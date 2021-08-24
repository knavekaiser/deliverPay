app.get("/api/getTickets", passport.authenticate("userPrivate"), (req, res) => {
  const { status, page, perPage, sort, order, dateFrom, dateTo } = req.query;
  const query = {
    user: req.user._id,
    ...(status && { status }),
    ...(dateFrom &&
      dateTo && {
        createdAt: {
          $gte: new Date(dateFrom),
          $lt: new Date(dateTo),
        },
      }),
  };
  const sortOrder = {
    [sort || "createdAt"]: order === "asc" ? 1 : -1,
  };
  Ticket.aggregate([
    { $match: query },
    {
      $lookup: {
        from: "milestones",
        as: "milestone",
        localField: "milestone",
        foreignField: "_id",
      },
    },
    {
      $lookup: {
        from: "transactions",
        as: "transaction",
        localField: "transaction",
        foreignField: "_id",
      },
    },
    { $sort: sortOrder },
    { $set: { milestone: { $first: "$milestone" } } },
    { $set: { transaction: { $first: "$transaction" } } },
    {
      $facet: {
        tickets: [
          { $skip: +perPage * (+(page || 1) - 1) },
          { $limit: +(perPage || 20) },
        ],
        pageInfo: [{ $group: { _id: null, count: { $sum: 1 } } }],
      },
    },
  ])
    .then((dbRes) => {
      res.json({ code: "ok", tickets: dbRes[0] });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).josn({ code: 500, message: "database error" });
    });
});

app.get(
  "/api/singleTicket",
  passport.authenticate("userPrivate"),
  (req, res) => {
    if (req.query._id && ObjectId.isValid(req.query._id)) {
      Ticket.aggregate([
        {
          $match: {
            _id: new ObjectId(req.query._id),
            user: req.user._id,
          },
        },
        {
          $lookup: {
            from: "transactions",
            localField: "transaction",
            foreignField: "_id",
            as: "transaction",
          },
        },
        {
          $lookup: {
            from: "milestones",
            localField: "milestone",
            foreignField: "_id",
            as: "milestone",
          },
        },
        {
          $set: {
            transaction: {
              $first: "$transaction",
            },
            milestone: {
              $first: "$milestone",
            },
          },
        },
      ]).then((ticket) => {
        if (ticket.length) {
          res.json({ code: "ok", ticket: ticket[0] });
        } else {
          res
            .status(404)
            .json({ code: 404, message: "ticket could not be found" });
        }
      });
    } else {
      res.status(400).json({ code: 400, message: "valid _id is required" });
    }
  }
);
app.post(
  "/api/openTicket",
  passport.authenticate("userPrivate"),
  (req, res) => {
    const { issue, milestone, transaction, message } = req.body;
    if (milestone && !ObjectId.isValid(milestone)) {
      res.status(400).json({ code: 400, message: "milestone ID is invalid" });
      return;
    }
    if (issue && message) {
      new Ticket({
        issue,
        ...(milestone && { milestone }),
        ...(transaction && { transaction }),
        user: req.user._id,
        messages: [
          {
            user: {
              name: req.user.firstName + " " + req.user.lastName,
              role: "client",
            },
            message,
          },
        ],
      })
        .save()
        .then((ticket) => {
          res.json({ code: "ok", ticket });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({ code: 500, message: "database error" });
        });
    } else {
      res.status(400).json({
        code: 400,
        message: "issue, milestone, message is required",
        fieldsFound: req.body,
      });
    }
  }
);
app.patch(
  "/api/closeTicket",
  passport.authenticate("userPrivate"),
  (req, res) => {
    if (req.body._id && ObjectId.isValid(req.body._id)) {
      Ticket.findOneAndUpdate(
        { _id: req.body._id, user: req.user._id },
        { status: "closed" },
        { new: true }
      ).then((ticket) => {
        if (ticket) {
          res.json({ code: "ok", ticket });
        } else {
          res
            .status(404)
            .json({ code: 404, message: "ticket could not be found" });
        }
      });
    } else {
      res.status(400).json({ code: 400, message: "valid _id is required" });
    }
  }
);
app.patch(
  "/api/addTicketReply",
  passport.authenticate("userPrivate"),
  (req, res) => {
    if (ObjectId.isValid(req.body._id) && req.body.message) {
      Ticket.findOneAndUpdate(
        { _id: req.body._id },
        {
          $push: {
            messages: {
              user: {
                name: req.user.firstName + " " + req.user.lastName,
                role: "client",
              },
              message: req.body.message,
            },
          },
        },
        { new: true }
      ).then((dbRes) => {
        if (dbRes) {
          res.json({ code: "ok", ticket: dbRes });
        } else {
          res
            .status(404)
            .json({ code: 404, message: "Ticket does not exist." });
        }
      });
    } else {
      res
        .status(400)
        .json({ code: 400, message: "valid _id and message is required" });
    }
  }
);

app.get("/api/faq", (req, res) => {
  const { q } = req.query;
  Faq.find({
    ...(q && {
      $or: [{ ques: new RegExp(q, "gi") }, { ans: new RegExp(q, "gi") }],
    }),
  })
    .then((faqs) => {
      res.json({ code: "ok", faqs });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ code: 500, message: "database erro" });
    });
});

app.post(
  "/api/reportUser",
  passport.authenticate("userPrivate"),
  (req, res) => {
    const { user, message } = req.body;
    if (user && message) {
      new Report({
        from: req.user._id,
        against: user,
        message,
      })
        .save()
        .then((dbRes) => {
          res.json({ code: "ok", report: dbRes });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({ code: 500, message: "database error" });
        });
    } else {
      res.status(400).json({
        code: 400,
        message: "user & message is required.",
        fieldsFound: req.body,
      });
    }
  }
);

app.get("/api/siteConfig", (req, res) => {
  Config.findOne()
    .then((config) => {
      res.json({ code: "ok", config });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ code: 500, message: "something went wrong" });
    });
});
