app.get("/api/getTickets", passport.authenticate("userPrivate"), (req, res) => {
  const { status } = req.query;
  const query = {
    user: req.user._id,
    ...(status && { status }),
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
    { $set: { milestone: { $first: "$milestone" } } },
    {
      $facet: {
        products: [
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
