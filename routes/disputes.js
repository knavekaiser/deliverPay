app.post(
  "/api/fileDispute",
  passport.authenticate("userPrivate"),
  async (req, res) => {
    const { issue, milestoneId, defendantId, _case } = req.body;
    // console.log(defendant, milestone, issue);
    const [defendant, milestone] = await Promise.all([
      User.findOne({ _id: defendantId }),
      Milestone.findOne({
        _id: milestoneId,
        $and: [
          {
            $or: [
              { "buyer._id": req.user._id },
              { "seller._id": req.user._id },
            ],
          },
          {
            $or: [{ "buyer._id": defendantId }, { "seller._id": defendantId }],
          },
        ],
      }),
    ]).catch((err) => {
      console.log(err);
      res.status(400).json({ message: "bad request" });
    });
    if (defendant && milestone && issue) {
      if (req.user.balance > 500) {
        new Dispute({
          issue,
          defendant,
          plaintiff: {
            ...req.user._doc,
            _case,
          },
          milestoneId: milestone._id,
        })
          .save()
          .then((dispute) => {
            new Transaction({
              amount: -500,
              user: req.user,
              note: "filing dispute",
            })
              .save()
              .then((transaction) => {
                User.findOneAndUpdate(
                  { _id: req.user._id },
                  {
                    $inc: { balance: -500 },
                    $addToSet: { transactions: transaction._id },
                  },
                  { new: true }
                )
                  .then((user) => {
                    if (user) {
                      Milestone.findOneAndUpdate(
                        { _id: milestoneId },
                        {
                          status: "dispute",
                          verification: "manual verification",
                        },
                        { new: true }
                      ).then((milestone) => {
                        res.json({
                          message: "dispute filed",
                          dispute,
                          milestone,
                        });
                      });
                      InitiateChat({
                        user: req.user._id,
                        client: defendant._id,
                      }).then(([userChat, clientChat]) =>
                        SendMessage({
                          rooms: [userChat._id, clientChat._id],
                          message: {
                            from: req.user._id,
                            to: defendantId._id,
                            type: "dispute",
                            text: `${req.user.firstName} filed a dispute`,
                          },
                        })
                      );
                      notify(
                        defendantId,
                        JSON.stringify({
                          title: "Dispute filed",
                          body: `${req.user.firstName} filed a dispute for the milestone: ${milestone.product.dscr}`,
                        }),
                        "User"
                      );
                    } else {
                      res.status(500).json({ message: "something went wrong" });
                    }
                  })
                  .catch((err) => {
                    console.log(err);
                    res.status(500).json({ message: "something went wrong" });
                  });
              })
              .catch((err) => {
                console.log(err);
                res.status(500).json({ message: "something went wrong" });
              });
          })
          .catch((err) => {
            console.log(err);
            res.status(500).json({ message: "something went wrong" });
          });
      } else {
        res.status(403).json({ message: "insufficient fund" });
      }
    } else {
      res.status(400).json({ message: "incomplete request" });
    }
  }
);
app.patch(
  "/api/approveDispute",
  passport.authenticate("userPrivate"),
  async (req, res) => {
    const dispute = await Dispute.findOne({
      _id: req.body._id,
      "defendant._id": req.user._id,
      status: "pending",
    });
    if (!dispute) {
      res.status(400).json({ message: "bad request" });
      return;
    }
    if (req.user.balance >= 500) {
      new Transaction({
        user: req.user._id,
        amount: 500,
        note: "approving dispute",
      })
        .save()
        .then((transaction) => {
          return User.findOneAndUpdate(
            { _id: req.user._id },
            {
              $inc: { balance: -500 },
              $addToSet: { transactions: transaction._id },
            },
            { new: true }
          );
        })
        .then((user) => {
          if (user) {
            Dispute.findOneAndUpdate(
              { _id: dispute._id },
              { status: "onGoing" },
              { new: true }
            )
              .then((disp) => {
                res.json({ message: "dispute approved", dispute: disp });
              })
              .catch((err) => {
                console.log(err);
                res.status(500).json({ message: "something went wrong" });
              });
          }
        })
        .catch((err) => {
          console.log(err);
          res.status(400).json({ message: "bad request" });
        });
    } else {
      res.status(403).json({ message: "insufficient fund" });
    }
  }
);
app.post(
  "/api/submitCase",
  passport.authenticate("userPrivate"),
  (req, res) => {
    const {
      _id,
      clientType,
      case: { dscr, evidence },
    } = req.body;
    if (_id && clientType && dscr && evidence) {
      Dispute.findOneAndUpdate(
        { _id, [`${clientType}._id`]: req.user._id, status: "onGoing" },
        { [`${clientType}.case`]: { dscr, evidence } },
        { new: true }
      ).then((dispute) => {
        if (dispute) {
          res.json({ message: "case submited" });
        } else {
          res.status(400).json({ message: "bad request" });
        }
      });
    } else {
      res.status(400).json({ message: "incomplete request" });
    }
  }
);
app.post(
  "/api/submitDisputeForReview",
  passport.authenticate("userPrivate"),
  (req, res) => {
    Dispute.findOneAndUpdate(
      {
        _id: req.body._id,
        "plaintiff.case.dscr": { $exists: true },
        "defendant.case.dscr": { $exists: true },
        status: "onGoing",
      },
      { status: "pendingVerdict" }
    )
      .then((dispute) => {
        if (dispute) {
          res.json({ message: "dispute submitted for review" });
        } else {
          res.status(400).json({ message: "bad request" });
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "something went wrong" });
      });
  }
);
