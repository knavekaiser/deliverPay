app.get("/api/getOrders", passport.authenticate("userPrivate"), (req, res) => {
  const {
    q,
    user,
    page,
    perPage,
    sort,
    order,
    status,
    type,
    dateFrom,
    dateTo,
  } = req.query;
  const query = {
    [`${user || "none"}._id`]: req.user._id,
    ...(q && {
      $expr: {
        $regexMatch: {
          input: {
            $concat: [
              `$${user === "seller" ? "buyer" : "seller"}.firstName`,
              " ",
              `$${user === "seller" ? "buyer" : "seller"}.lastName`,
              " ",
              `$${user === "seller" ? "buyer" : "seller"}.phone`,
            ],
          },
          regex: new RegExp(q.replace(/[#-.]|[[-^]|[?|{}]/g, "\\$&")),
          options: "i",
        },
      },
    }),
    ...(dateFrom &&
      dateTo && {
        createdAt: {
          $gte: new Date(dateFrom),
          $lt: new Date(dateTo),
        },
      }),
    ...(status && { $or: status.split("|").map((status) => ({ status })) }),
  };
  const sortOrder = {
    [sort || "createdAt"]: order === "asc" ? 1 : -1,
  };
  Order.aggregate([
    { $match: query },
    {
      $lookup: {
        from: "milestones",
        localField: "milestones",
        foreignField: "_id",
        as: "milestones",
      },
    },
    { $sort: sortOrder },
    {
      $facet: {
        orders: [
          { $skip: +perPage * (+(page || 1) - 1) },
          { $limit: +(perPage || 20) },
        ],
        total: [{ $group: { _id: null, count: { $sum: 1 } } }],
      },
    },
    { $set: { total: { $first: "$total.count" } } },
  ])
    .then(([{ orders, total }]) => {
      res.json({
        code: "ok",
        orders,
        total: total || 0,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ code: "ok", message: "Database error" });
    });
});
app.get(
  "/api/singleOrder",
  passport.authenticate("userPrivate"),
  (req, res) => {
    if (ObjectId.isValid(req.query._id)) {
      Order.aggregate([
        {
          $match: {
            _id: ObjectId(req.query._id),
            $or: [
              { "buyer._id": req.user._id },
              { "seller._id": req.user._id },
            ],
          },
        },
        { $unwind: { path: "$products" } },
        {
          $lookup: {
            from: "products",
            as: "currentProduct",
            localField: "products.product._id",
            foreignField: "_id",
          },
        },
        {
          $set: {
            "products.available": {
              $cond: {
                if: { $gt: [{ $size: "$currentProduct" }, 0] },
                then: { $first: "$currentProduct.available" },
                else: null,
              },
            },
          },
        },
        {
          $group: {
            _id: "$_id",
            doc: { $first: "$$ROOT" },
            products: { $push: "$products" },
          },
        },
        {
          $replaceRoot: {
            newRoot: { $mergeObjects: ["$doc", { products: "$products" }] },
          },
        },
        { $unset: "currentProduct" },
        {
          $lookup: {
            from: "milestones",
            localField: "milestones",
            foreignField: "_id",
            as: "milestones",
          },
        },
      ]).then(async ([order]) => {
        if (order) {
          // const products = await Product.find(
          //   {
          //     _id: {
          //       $in: order.products.map(({ product, qty }) =>
          //         ObjectId(product._id)
          //       ),
          //     },
          //   },
          //   "available"
          // ).then((dbRes) =>
          //   dbRes.map((pr) => ({
          //     ...order.products.find(
          //       (item) => item.product._id.toString() === pr._id.toString()
          //     ),
          //     available: +pr.available || pr.available,
          //   }))
          // );
          res.json({
            code: "ok",
            order,
          });
        } else {
          res.status(400).json({ code: 400, message: "Order does not exists" });
        }
      });
    } else {
      res.status(400).json({
        code: 400,
        message: "valid _id is required in query parameter.",
      });
    }
  }
);
app.patch(
  "/api/updateOrder",
  passport.authenticate("userPrivate"),
  (req, res) => {
    const { _id, files, status } = req.body;
    if (ObjectId.isValid(_id)) {
      Order.findOneAndUpdate(
        {
          _id,
          $or: [{ "seller._id": req.user._id }, { "buyer._id": req.user._id }],
        },
        {
          ...(files && { $addToSet: { files: files } }),
          ...(status && { status }),
          ...(status === "delivered" && { deliveredAt: new Date() }),
        },
        { new: true }
      ).then((order) => {
        if (order) {
          if (status === "shipped") {
            notify(
              order.buyer._id,
              JSON.stringify({
                title: "Order Shipped",
                body: "Your order has been shipped",
              }),
              "User"
            );
          } else if (status === "delivered") {
            notify(
              order.buyer._id,
              JSON.stringify({
                title: "Order Delivered",
                body: "Your order has been delivered.",
              }),
              "User"
            );
          }
          res.json({ code: "ok", order });
        } else {
          res.status(400).json({ code: 400, message: "Order does not exists" });
        }
      });
    } else {
      res.status(400).json({ code: 400, message: "Valid _id is required" });
    }
  }
);

app.get("/api/getRefunds", passport.authenticate("userPrivate"), (req, res) => {
  const {
    q,
    user,
    page,
    perPage,
    sort,
    order,
    status,
    dateFrom,
    dateTo,
  } = req.query;
  const query = {
    [`${user}._id`]: req.user._id,
    ...(q && {
      [`${user === "seller" ? "buyer" : "seller"}.firstName`]: new RegExp(
        q,
        "gi"
      ),
    }),
    ...(dateFrom &&
      dateTo && {
        createdAt: {
          $gte: new Date(dateFrom),
          $lt: new Date(dateTo),
        },
      }),
    ...(status && { status }),
  };
  const sortOrder = {
    [sort || "createdAt"]: order === "asc" ? 1 : -1,
  };
  Refund.aggregate([
    { $match: query },
    {
      $lookup: {
        from: "orders",
        localField: "order",
        foreignField: "_id",
        as: "order",
      },
    },
    { $set: { order: { $first: "$order" } } },
    { $sort: sortOrder },
    {
      $facet: {
        refunds: [
          { $skip: +perPage * (+(page || 1) - 1) },
          { $limit: +(perPage || 20) },
        ],
        total: [{ $group: { _id: null, count: { $sum: 1 } } }],
      },
    },
    { $set: { total: { $first: "$total.count" } } },
  ])
    .then(([{ refunds, total }]) => {
      res.json({
        code: "ok",
        refunds,
        total: total || 0,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ code: "ok", message: "Database error" });
    });
});
app.get(
  "/api/singleRefund",
  passport.authenticate("userPrivate"),
  (req, res) => {
    if (ObjectId.isValid(req.query._id)) {
      Refund.aggregate([
        {
          $match: {
            _id: ObjectId(req.query._id),
            $or: [
              { "buyer._id": req.user._id },
              { "seller._id": req.user._id },
            ],
          },
        },
        {
          $lookup: {
            from: "orders",
            localField: "order",
            foreignField: "_id",
            as: "order",
          },
        },
        {
          $set: {
            order: {
              $first: "$order",
            },
          },
        },
        {
          $lookup: {
            from: "milestones",
            localField: "milestones",
            foreignField: "_id",
            as: "milestones",
          },
        },
      ]).then(async ([refund]) => {
        if (refund) {
          res.json({
            code: "ok",
            refund,
          });
        } else {
          res.status(400).json({ code: 400, message: "Order does not exists" });
        }
      });
    } else {
      res.status(400).json({
        code: 400,
        message: "valid _id is required in query parameter.",
      });
    }
  }
);

app.patch(
  "/api/updateRefund",
  passport.authenticate("userPrivate"),
  (req, res) => {
    const { _id, status } = req.body;
    if (ObjectId.isValid(_id)) {
      Refund.findOneAndUpdate(
        {
          _id,
          $or: [{ "seller._id": req.user._id }, { "buyer._id": req.user._id }],
        },
        { ...(status && { status }) },
        { new: true }
      ).then((refund) => {
        if (refund) {
          if (status === "productSent") {
            notify(
              refund.seller._id,
              JSON.stringify({
                title: "Refund update",
                body: "Buyer has shipped the product",
              }),
              "User"
            );
          } else if (status === "productRecieved") {
            notify(
              refund.buyer._id,
              JSON.stringify({
                title: "Refund update",
                body: "Seller has recieved the prouduct.",
              }),
              "User"
            );
          }
          res.json({ code: "ok", refund });
        } else {
          res.status(400).json({ code: 400, message: "Order does not exists" });
        }
      });
    } else {
      res.status(400).json({ code: 400, message: "Valid _id is required" });
    }
  }
);
//------------------------------------ Buyer
// app.post(
//   "/api/submitOrder",
//   passport.authenticate("userPrivate"),
//   async (req, res) => {
//     let { products, seller, deliveryDetail, total } = req.body;
//     seller = await User.findOne(
//       { _id: seller },
//       "_id firstName lastName phone email profileImg"
//     );
//     if (deliveryDetail && seller && products?.length && total) {
//       new Order({
//         buyer: req.user,
//         seller: seller,
//         products: products.map(({ product, qty }) => ({
//           product: { ...product, _id: ObjectId(product._id) },
//           qty,
//         })),
//         deliveryDetail,
//         total,
//       })
//         .save()
//         .then((order) => {
//           notify(
//             seller._id,
//             JSON.stringify({
//               title: "New order!",
//               body: "You have a new order",
//             }),
//             "User"
//           );
//           res.json({
//             code: "ok",
//             products: order.products.map(({ product }) => product._id),
//           });
//         })
//         .catch((err) => {
//           console.log(err);
//           res.status(500).json({ code: 500, message: "Database error" });
//         });
//     } else {
//       res.status(400).json({
//         code: 400,
//         message: "seller, deliveryDetail, products and total is required",
//         fieldsFound: req.body,
//       });
//     }
//   }
// );
app.patch(
  "/api/cancelOrder",
  passport.authenticate("userPrivate"),
  (req, res) => {
    if (ObjectId.isValid(req.body._id)) {
      Order.findOneAndUpdate(
        {
          _id: req.body._id,
          "buyer._id": req.user._id,
          status: "pending",
        },
        { status: "cancelled" },
        { new: true }
      ).then((order) => {
        if (order) {
          res.json({ code: "ok", order });
        } else {
          res.json({ code: 400, message: "order does not exists" });
        }
      });
    } else {
      res.status(400).json({ code: 400, message: "Valid _id is required" });
    }
  }
);

app.post(
  "/api/issueRefund",
  passport.authenticate("userPrivate"),
  async (req, res) => {
    let { order, issue, dscr, files } = req.body;
    order = await Order.findOne({
      _id: order,
      status: "delivered",
      refundable: { $ne: null },
    });
    if (order && issue && dscr) {
      new Refund({
        order: order._id,
        seller: order.seller,
        buyer: order.buyer,
        issue,
        dscr,
        files,
      })
        .save()
        .then((refund) => {
          Order.findOneAndUpdate(
            { _id: order._id },
            { status: "refundPending" },
            { new: true }
          ).then((value) => {});
          notify(
            order.seller._id,
            JSON.stringify({
              title: "Refund Issed",
              body: `${order.buyer.firstName} ${order.buyer.lastName} issued a refund.`,
            }),
            "User"
          );
          res.json({ code: "ok", refund });
        });
    } else {
      res.status(400).json({
        code: 400,
        message: "order, issue, dscr is required",
        fieldsFound: req.body,
      });
    }
  }
);

//------------------------------------ Seller
app.post(
  "/api/acceptOrder",
  passport.authenticate("userPrivate"),
  (req, res) => {
    const {
      _id,
      // products,
      // total,
      // deliveryTime,
      // terms,
      // refundable,
      // shippingCost,
    } = req.body;
    if (
      ObjectId.isValid(_id)
      //&& products.length &&
      //total &&
    ) {
      Order.findOneAndUpdate(
        {
          _id,
          status: "pending",
          "seller._id": req.user._id,
        },
        {
          // products,
          // total,
          // shippingCost,
          // "deliveryDetail.deliveryTime": deliveryTime,
          // terms,
          // refundable,
          status: "approved",
        },
        { new: true }
      )
        .then(async (order) => {
          if (order) {
            Promise.all([
              order.products.map(({ product, qty }) =>
                Product.findOneAndUpdate(
                  { _id: product._id, available: { $gt: 0 } },
                  { $inc: { available: -qty } },
                  { new: true }
                ).then((data) => {})
              ),
            ]);
            notify(
              order.buyer._id,
              JSON.stringify({
                title: "Order approved",
                body: "Your order has been approved",
              }),
              "User"
            );
            res.json({ code: "ok", order });
          } else {
            res
              .status(400)
              .json({ code: 400, message: "Order does not exists" });
          }
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({ code: 500, message: "Database error" });
        });
    } else {
      res.status(400).json({
        code: 400,
        message: "Valid _id, products, total, terms, deliveryTime is required",
        fieldsFound: req.body,
      });
    }
  }
);
app.patch(
  "/api/declineOrder",
  passport.authenticate("userPrivate"),
  (req, res) => {
    const { _id } = req.body;
    if (ObjectId.isValid(_id)) {
      Order.findOneAndUpdate(
        { _id, status: "pending", "seller._id": req.user._id },
        { status: "declined" },
        { new: true }
      )
        .then((order) => {
          if (order) {
            Promise.all([
              ...order.milestones.map((item) => {
                return Milestone.findOneAndUpdate(
                  { _id: item },
                  { status: "cancelled" },
                  { new: true }
                ).then((milestone) => {
                  if (milestone) {
                    return new P2PTransaction({
                      user: order.buyer._id,
                      amount: milestone.amount,
                      note: "Milestone Cancellation",
                      milestoneId: milestone._id,
                      client: milestone.seller,
                      dscr: milestone.dscr,
                    })
                      .save()
                      .then((transaction) => {
                        return User.findOneAndUpdate(
                          { _id: order.buyer._id },
                          {
                            $inc: { balance: transaction.amount },
                            $addToSet: { transactions: transaction._id },
                          },
                          { new: true }
                        ).then((user) => {});
                      })
                      .catch((err) => {
                        console.log(err);
                      });
                  }
                });
              }),
            ]).then((milestones) => {});
            notify(
              order.buyer._id,
              JSON.stringify({
                title: "Order Declined",
                body: "Your order has been declined",
              }),
              "User"
            );
            res.json({ code: "ok", order });
          } else {
            res
              .status(400)
              .json({ code: 400, message: "Order does not exists." });
          }
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({ code: 500, message: "Database error" });
        });
    } else {
      res.status(400).json({ code: 400, message: "_id is required" });
    }
  }
);

app.post(
  "/api/acceptRefund",
  passport.authenticate("userPrivate"),
  (req, res) => {
    const { _id } = req.body;
    if (ObjectId.isValid(_id)) {
      Refund.findOneAndUpdate(
        { _id, status: "pending", "seller._id": req.user._id },
        { status: "approved" },
        { new: true }
      )
        .then(async (refund) => {
          if (refund) {
            notify(
              refund.buyer._id,
              JSON.stringify({
                title: "Refund approved",
                body: "Your refund request has been approved",
              }),
              "User"
            );
            res.json({ code: "ok", refund });
          } else {
            res
              .status(400)
              .json({ code: 400, message: "refund does not exists" });
          }
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({ code: 500, message: "Database error" });
        });
    } else {
      res.status(400).json({
        code: 400,
        message: "Valid _id is required",
        fieldsFound: req.body,
      });
    }
  }
);
app.patch(
  "/api/declineRefund",
  passport.authenticate("userPrivate"),
  (req, res) => {
    const { _id } = req.body;
    if (ObjectId.isValid(_id)) {
      Refund.findOneAndUpdate(
        { _id, status: "pending", "seller._id": req.user._id },
        { status: "declined" },
        { new: true }
      )
        .then((dbRes) => {
          if (dbRes) {
            notify(
              dbRes.buyer._id,
              JSON.stringify({
                title: "Refund Declined",
                body: "Your refund request has been declined",
              }),
              "User"
            );
            res.json({ code: "ok", refund: dbRes });
          } else {
            res
              .status(400)
              .json({ code: 400, message: "Order does not exists." });
          }
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({ code: 500, message: "Database error" });
        });
    } else {
      res.status(400).json({ code: 400, message: "_id is required" });
    }
  }
);
