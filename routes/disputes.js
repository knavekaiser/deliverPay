app.get(
  "/api/getDisputes",
  passport.authenticate("userPrivate"),
  (req, res) => {
    const {
      page,
      perPage,
      sort,
      order,
      q,
      status,
      dateFrom,
      dateTo,
    } = req.query;
    const query = {
      ...(q && { issue: new RegExp(q, "gi") }),
      ...(dateFrom &&
        dateTo && {
          createdAt: {
            $gte: new Date(`${dateFrom} 0:0`),
            $lt: new Date(`${dateTo} 0:0`),
          },
        }),
      ...(status && { status }),
      $or: [
        { "plaintiff._id": req.user._id },
        { "defendant._id": req.user._id },
        ...(status ? status.split("|").map((status) => ({ status })) : []),
      ],
    };
    const sortOrder = {
      [sort || "createdAt"]: order === "asc" ? 1 : -1,
    };
    Dispute.aggregate([
      {
        $lookup: {
          from: "users",
          let: {
            plaintiff: "$plaintiff._id",
          },
          as: "plainProfile",
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$plaintiff"] } } },
            {
              $project: {
                firstName: 1,
                lastName: 1,
                phone: 1,
                email: 1,
                profileImg: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "users",
          let: {
            defendant: "$defendant._id",
          },
          as: "defProfile",
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$defendant"] } } },
            {
              $project: {
                firstName: 1,
                lastName: 1,
                phone: 1,
                email: 1,
                profileImg: 1,
              },
            },
          ],
        },
      },
      {
        $set: {
          plaintiff: {
            $mergeObjects: [
              "$plaintiff",
              {
                $first: "$plainProfile",
              },
            ],
          },
          defendant: {
            $mergeObjects: [
              "$defendant",
              {
                $first: "$defProfile",
              },
            ],
          },
        },
      },
      { $unset: ["plainProfile", "defProfile"] },
      { $match: query },
      {
        $lookup: {
          from: "milestones",
          localField: "milestoneId",
          foreignField: "_id",
          as: "milestoneId",
        },
      },
      { $set: { milestoneId: { $first: "$milestoneId" } } },
      {
        $set: {
          "plaintiff.role": {
            $cond: {
              if: {
                $eq: ["$milestoneId.seller._id", "$plaintiff._id"],
              },
              then: "seller",
              else: "buyer",
            },
          },
          "defendant.role": {
            $cond: {
              if: {
                $eq: ["$milestoneId.seller._id", "$defendant._id"],
              },
              then: "seller",
              else: "buyer",
            },
          },
        },
      },
      { $sort: sortOrder },
      {
        $facet: {
          disputes: [
            { $skip: +perPage * (+(page || 1) - 1) },
            { $limit: +(perPage || 20) },
          ],
          total: [{ $group: { _id: null, count: { $sum: 1 } } }],
        },
      },
      { $set: { total: { $first: "$total.count" } } },
    ])
      .then(([{ disputes, total }]) => {
        res.json({ code: "ok", disputes, total: total || 0 });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ code: 500, message: "Database error" });
      });
  }
);
app.get(
  "/api/singleDispute",
  passport.authenticate("userPrivate"),
  (req, res) => {
    const { _id } = req.query;
    if (ObjectId.isValid(_id)) {
      Dispute.aggregate([
        {
          $match: {
            _id: new ObjectId(_id),
          },
        },
        {
          $lookup: {
            from: "users",
            let: {
              plaintiff: "$plaintiff._id",
            },
            as: "plainProfile",
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", "$$plaintiff"],
                  },
                },
              },
              {
                $project: {
                  firstName: 1,
                  lastName: 1,
                  phone: 1,
                  email: 1,
                  profileImg: 1,
                  balance: 1,
                },
              },
            ],
          },
        },
        {
          $lookup: {
            from: "users",
            let: {
              defendant: "$defendant._id",
            },
            as: "defProfile",
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", "$$defendant"],
                  },
                },
              },
              {
                $project: {
                  firstName: 1,
                  lastName: 1,
                  phone: 1,
                  email: 1,
                  profileImg: 1,
                  balance: 1,
                },
              },
            ],
          },
        },
        {
          $lookup: {
            from: "milestones",
            localField: "milestoneId",
            foreignField: "_id",
            as: "milestone",
          },
        },
        {
          $set: {
            plaintiff: {
              $mergeObjects: [
                "$plaintiff",
                {
                  $first: "$plainProfile",
                },
              ],
            },
            defendant: {
              $mergeObjects: [
                "$defendant",
                {
                  $first: "$defProfile",
                },
              ],
            },
            milestone: {
              $first: "$milestone",
            },
          },
        },
        {
          $unset: ["plainProfile", "defProfile", "milestoneId"],
        },
        {
          $set: {
            "plaintiff.role": {
              $cond: {
                if: {
                  $eq: ["$milestone.seller._id", "$plaintiff._id"],
                },
                then: "seller",
                else: "buyer",
              },
            },
            "defendant.role": {
              $cond: {
                if: {
                  $eq: ["$milestone.seller._id", "$defendant._id"],
                },
                then: "seller",
                else: "buyer",
              },
            },
          },
        },
      ]).then(async (dbRes) => {
        if (dbRes.length) {
          const [dispute] = dbRes;
          const chat = await Chat.findOne({
            $or: [
              {
                user: dispute.plaintiff._id,
                client: dispute.defendant._id,
              },
              {
                client: dispute.plaintiff._id,
                user: dispute.defendant._id,
              },
            ],
          });
          res.json({ code: "ok", dispute, chat });
        } else {
          res.json({ code: 400, message: "Dispute could not be found" });
        }
      });
    } else {
      res
        .status(400)
        .json({ code: 400, message: "_id is required in query parameter" });
    }
  }
);
app.post(
  "/api/fileDispute",
  passport.authenticate("userPrivate"),
  async (req, res) => {
    const { issue, milestoneId, defendantId, _case } = req.body;
    const [dispute, defendant, milestone] = await Promise.all([
      Dispute.findOne({ milestoneId }),
      User.findOne(
        { _id: defendantId },
        "firstName lastName profileImg phone email"
      ),
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
                            to: plaintiff._id,
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
                            code: "ok",
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
