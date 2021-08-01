app.post(
  "/api/fileDispute",
  passport.authenticate("userPrivate"),
  async (req, res) => {
    const { issue, milestoneId, defendantId, _case } = req.body;
    const [dispute, defendant, milestone] = await Promise.all([
      Dispute.findOne({ milestoneId }),
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
        if (dispute) {
          if (dispute.plaintiff._id.toString() === req.user._id.toString()) {
            res
              .status(400)
              .json({ code: 400, message: "dispute already created" });
          } else if (
            dispute.defendant._id.toString() === req.user._id.toString()
          ) {
            Dispute.findOneAndUpdate(
              { _id: dispute._id },
              {
                status: "pendingVerdict",
                "defendant.case": _case,
              },
              { new: true }
            ).then((dispute) => {
              if (dispute) {
                new Transaction({
                  amount: -500,
                  user: req.user,
                  note: "approving dispute",
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
                    ).then((user) => {
                      InitiateChat({
                        user: req.user._id,
                        client: dispute.plaintiff._id,
                      }).then(([userChat, clientChat]) =>
                        SendMessage({
                          rooms: [userChat._id, clientChat._id],
                          message: {
                            from: req.user._id,
                            to: defendantId._id,
                            type: "dispute",
                            text: `${req.user.firstName} responded to your dispute`,
                          },
                        })
                      );
                      notify(
                        dispute.plaintiff._id,
                        JSON.stringify({
                          title: "Dispute responese",
                          body: `${req.user.firstName} responded to your dispute.`,
                        })
                      );
                      res.json({
                        code: "ok",
                        message: "case submitted",
                        milestone: {
                          ...milestone._doc,
                          dispute,
                        },
                      });
                    });
                  });
              } else {
                res
                  .status(500)
                  .json({ code: 500, message: "case could not be submitted" });
              }
            });
          } else {
            res.status(403).json({ code: 403, message: "forbidden" });
          }
        } else {
          new Dispute({
            issue,
            defendant,
            plaintiff: { ...req.user._doc, case: _case },
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
                            body: `${req.user.firstName} filed a dispute.`,
                          }),
                          "User"
                        );
                      } else {
                        res
                          .status(500)
                          .json({ message: "something went wrong" });
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
        }
      } else {
        res.status(403).json({ code: 403, message: "insufficient fund" });
      }
    } else {
      res.status(400).json({
        code: 400,
        message: "missing field or invalid milestoneId/defendantId",
        fieldsRequired: "issue, milestoneId, defendantId, _case",
        fieldsFound: req.body,
      });
    }
  }
);
