let base64 = require("base-64");
const crypto = require("crypto");

const verifyRazorSignature = (orderId, paymentId, razorSignature) => {
  const hmac = crypto.createHmac("sha256", process.env.RAZOR_PAY_SECRET);
  hmac.update(orderId + "|" + paymentId);
  let generatedSignature = hmac.digest("hex");
  return razorSignature === generatedSignature;
};

app.get(
  "/api/dashboardData",
  passport.authenticate("userPrivate"),
  (req, res) => {
    const today = new Date();
    today.setYear(today.getFullYear() - 1);
    today.setMonth(today.getMonth() + 1);
    today.setDate(1);
    Promise.all([
      Transaction.aggregate([
        {
          $match: {
            user: new ObjectId(req.user._id),
            createdAt: {
              $gte: new Date(today.toISOString().substr(0, 10)),
            },
          },
        },
        {
          $group: {
            _id: {
              $month: "$createdAt",
            },
            balance: {
              $sum: "$amount",
            },
            date: {
              $first: "$createdAt",
            },
          },
        },
        {
          $sort: {
            createdAt: 1,
          },
        },
        {
          $limit: 12,
        },
      ]),
      User.findOne({ _id: req.user._id }, "rewards").populate("rewards"),
    ])
      .then(([monthlyBalance, { rewards }]) => {
        const monthName = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        const months = [];
        for (var i = 0; i < 12; i++) {
          const month =
            new Date(
              new Date().setMonth(new Date().getMonth() - i)
            ).getMonth() + 1;
          const data = monthlyBalance.find((item) => item._id === month);
          if (data) {
            months.push({
              _id: monthName[month - 1],
              balance: data.balance,
            });
          } else {
            months.push({ _id: monthName[month - 1], balance: null });
          }
        }
        res.json({
          code: "ok",
          balance: req.user.balance,
          monthlyBalance: months,
          rewards,
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(400).json({ code: 400, message: "someting went wrong" });
      });
  }
);
app.get(
  "/api/recentPayments",
  passport.authenticate("userPrivate"),
  (req, res) => {
    Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          __t: "P2PTransaction",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "client._id",
          foreignField: "_id",
          as: "client",
        },
      },
      {
        $set: { client: { $first: "$client" } },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$client._id",
          firstName: { $first: "$client.firstName" },
          lastName: { $first: "$client.lastName" },
          phone: { $first: "$client.phone" },
          email: { $first: "$client.email" },
          profileImg: { $first: "$client.profileImg" },
          address: { $first: "$client.address" },
          createdAt: { $first: "$createdAt" },
          blockList: { $first: "$client.blockList" },
        },
      },
      {
        $limit: 8,
      },
      {
        $match: {
          firstName: { $not: { $eq: null } },
          $and: [
            ...req.user.blockList?.map((_id) => ({
              _id: { $not: { $eq: _id } },
            })),
            { _id: { $not: { $eq: req.user._id } } },
          ],
          blockList: { $not: { $in: [ObjectId(req.user._id)] } },
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ])
      .then((dbRes) => {
        res.json(dbRes);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "something went wrong" });
      });
  }
);
app.get(
  "/api/transactions",
  passport.authenticate("userPrivate"),
  (req, res) => {
    Transaction.find({
      user: req.user._id,
      ...(req.query.type && { __t: req.query.type }),
    })
      .populate("client._id", "profileImg")
      .populate("milestoneId", "releaseDate status verification")
      .sort({ createdAt: -1 })
      .then((dbRes) => {
        res.json(dbRes);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "something went wrong" });
      });
  }
);

app.post(
  "/api/redeemReward",
  passport.authenticate("userPrivate"),
  (req, res) => {
    const { _id } = req.body;
    if (_id) {
      Reward.findOne({ _id, redeemed: false }).then((reward) => {
        if (reward) {
          new Transaction({
            user: req.user._id,
            amount: reward.amount,
            note: "referral cashback",
          })
            .save()
            .then((transaction) => {
              User.findOneAndUpdate(
                { _id: req.user._id },
                {
                  $inc: { balance: reward.amount },
                  $addToSet: { transactions: transaction._id },
                },
                { new: true }
              ).then((user) => {
                if (user) {
                  Reward.findOneAndUpdate(
                    { _id },
                    { redeemed: true },
                    { new: true }
                  ).then((newReward) => {
                    res.json({
                      code: "ok",
                      message: "reward succefully redeemed",
                      reward: newReward,
                    });
                  });
                }
              });
            })
            .catch((err) => {
              console.log(err);
              res.status(500).json({ code: 500, message: "database error" });
            });
        } else {
          res.status(400).json({ code: 400 });
        }
      });
    } else {
      res.status(400).json({ code: 400, message: "_id is required" });
    }
  }
);

app.post(
  "/api/createAddMoneyOrder",
  passport.authenticate("userPrivate"),
  (req, res) => {
    const { amount } = req.body;
    if (+amount < 1) {
      res.status(400).json({ code: 400, message: "amount is required" });
      return;
    }
    razorpay.orders
      .create({
        amount: amount * 100,
        currency: "INR",
        receipt: req.user._id.toString(),
      })
      .then((order) =>
        new RazorOrderId({
          ...order,
          user: req.user._id,
          status: "pending",
          amount: amount,
        }).save()
      )
      .then((savedOrder) => {
        res.json({
          code: "ok",
          order: savedOrder,
          key: process.env.RAZOR_PAY_ID,
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ code: 500, message: "someting went wrong" });
      });
  }
);
app.put(
  "/api/addMoney",
  passport.authenticate("userPrivate"),
  async (req, res) => {
    const { transactionId, razorSignature, razorOrderId } = req.body;
    const serverOrderId = await RazorOrderId.findOne({
      id: razorOrderId,
      user: req.user._id,
      status: "pending",
    });
    if (transactionId && razorSignature && serverOrderId) {
      if (
        verifyRazorSignature(serverOrderId.id, transactionId, razorSignature)
      ) {
        razorpay.payments
          .fetch(transactionId)
          .then((razorRes) => {
            if (razorRes) {
              Promise.all([
                new AddMoney({
                  transactionId: razorRes.id,
                  amount: razorRes.amount / 100,
                  paymentMethod: razorRes.method,
                  user: req.user._id,
                  note: "Add money to wallet",
                }).save(),
                RazorOrderId.findOneAndUpdate(
                  { id: serverOrderId.id },
                  { state: "successful", expireAt: null },
                  { new: true }
                ),
              ])
                .then(([moneyReciept, updatedOrder]) => {
                  if (moneyReciept) {
                    User.findOneAndUpdate(
                      { _id: req.user._id },
                      {
                        $inc: { balance: moneyReciept.amount },
                        $addToSet: { transactions: moneyReciept._id },
                      },
                      { new: true }
                    ).then((updated) => {
                      res.json({
                        code: "ok",
                        transaction: moneyReciept,
                        user: {
                          balance: updated.balance,
                          transactions: updated.transactions,
                        },
                      });
                    });
                  }
                })
                .catch((err) => {
                  console.log(err);
                  res.status(400).json({ message: "bad request" });
                });
            } else {
              res.status(400).json({ message: "bad request" });
            }
          })
          .catch((err) => {
            console.log(err);
            res.status(400).json({ message: "bad request" });
          });
      } else {
        res
          .status(400)
          .json({ code: 400, message: "invalid payment signature" });
      }
    } else {
      res.status(400).json({
        code: "400",
        message: "incomplete request",
        fieldsRequired: "transactionId, razorSignature, razorOrderId",
        fieldsFound: req.body,
      });
    }
  }
);
app.get("/api/milestone", passport.authenticate("userPrivate"), (req, res) => {
  const {
    q,
    page,
    perPage,
    sort,
    order,
    status,
    dateFrom,
    dateTo,
    userType,
  } = req.query;
  const sortOrder = {
    [sort || "createdAt"]: order === "asc" ? 1 : -1,
  };
  const query = {
    ...(userType
      ? { [userType + "._id"]: new ObjectId(req.user._id) }
      : {
          $or: [
            {
              "buyer._id": new ObjectId(req.user._id),
            },
            {
              "seller._id": new ObjectId(req.user._id),
            },
          ],
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
  const search = {
    ...(q && {
      $or: [
        { "client.firstName": new RegExp(q, "gi") },
        { "client.phone": new RegExp(q, "gi") },
        // { note: new RegExp(q, "gi") },
        ...(ObjectId.isValid(q) ? [{ _id: ObjectId(q) }] : []),
      ],
    }),
  };
  Milestone.aggregate([
    {
      $match: query,
    },
    {
      $set: {
        client: {
          $cond: {
            if: {
              $eq: [ObjectId(req.user._id), "$seller._id"],
            },
            then: "$buyer",
            else: "$seller",
          },
        },
        role: {
          $cond: {
            if: { $eq: [ObjectId(req.user._id), "$seller._id"] },
            then: "buyer",
            else: "seller",
          },
        },
      },
    },
    { $unset: ["buyer", "seller"] },
    {
      $lookup: {
        from: "users",
        as: "clientProfile",
        let: {
          client: "$client._id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$$client", "$_id"],
              },
            },
          },
          {
            $project: {
              firstName: 1,
              lastName: 1,
              email: 1,
              phone: 1,
              address: 1,
              profileImg: 1,
            },
          },
        ],
      },
    },
    {
      $set: {
        client: {
          $mergeObjects: [
            "$client",
            {
              $first: "$clientProfile",
            },
          ],
        },
      },
    },
    {
      $unset: "clientProfile",
    },
    {
      $lookup: {
        from: "disputes",
        let: { mId: "$_id" },
        as: "dispute",
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$milestoneId", "$$mId"],
              },
            },
          },
        ],
      },
    },
    { $set: { dispute: { $first: "$dispute" } } },
    { $match: search },
    { $sort: sortOrder },
    {
      $facet: {
        milestones: [
          { $skip: +perPage * (+(page || 1) - 1) },
          { $limit: +(perPage || 20) },
        ],
        total: [{ $group: { _id: null, count: { $sum: 1 } } }],
      },
    },
    { $set: { total: { $first: "$total.count" } } },
  ])
    .then(([{ milestones, total }]) => {
      res.json({
        code: "ok",
        milestones,
        total: total || 0,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "something went wrong" });
    });
});

// -------------------------- withdraw money
app.post(
  "/api/withdrawMoney",
  passport.authenticate("userPrivate"),
  async (req, res) => {
    const { amount, paymentMethod, accountDetail } = req.body;
    if (+amount > req.user.balance) {
      res.status(403).json({ code: 403, message: "insufficient fund" });
      return;
    }
    let fundAccountDetail;
    switch (paymentMethod) {
      case "BankAccount":
        fundAccountDetail = {
          account_type: "bank_account",
          bank_account: { ...accountDetail },
        };
        break;
      case "BankCard":
        fundAccountDetail = {
          account_type: "card",
          // "card.name": accountDetail.name,
          // "card.number": accountDetail.number,
          card: { ...accountDetail },
        };
        break;
      case "VpaAccount":
        fundAccountDetail = {
          account_type: "vpa",
          vpa: { ...accountDetail },
        };
        break;
      default:
        res.status(400).json({ message: "bad request" });
    }
    const razorHeaders = {
      "Content-Type": "application/json",
      Authorization: `Basic ${base64.encode(
        `${process.env.RAZOR_PAY_ID}:${process.env.RAZOR_PAY_SECRET}`
      )}`,
    };
    const razorPayContactId =
      req.user.razorPayContactId ||
      (await fetch("https://api.razorpay.com/v1/contacts", {
        method: "POST",
        headers: razorHeaders,
        body: JSON.stringify({
          name: `${req.user.firstName} ${req.user.lastName}`,
          email: req.user.email,
          contact: req.user.phone,
          type: "user",
          reference_id: req.user._id.toString(),
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          return User.findOneAndUpdate(
            { _id: req.user._id },
            { razorPayContactId: data.id },
            { new: true }
          ).then((newUser) => newUser.razorPayContactId);
        })
        .catch((err) => {
          console.log(err);
          return null;
        }));
    const razorBody = {
      contact_id: razorPayContactId,
      ...fundAccountDetail,
    };
    console.log(razorBody);
    const razorPayFundAccount = await fetch(
      "https://api.razorpay.com/v1/fund_accounts",
      {
        method: "POST",
        headers: razorHeaders,
        body: JSON.stringify(razorBody),
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          console.log(data.error);
          return null;
        } else {
          return data.id;
        }
      })
      .catch((err) => {
        console.log(err);
        return null;
      });
    if (razorPayContactId && razorPayFundAccount) {
      console.log(razorPayFundAccount);
      fetch("https://api.razorpay.com/v1/payouts", {
        method: "POST",
        headers: razorHeaders,
        body: JSON.stringify({
          account_number: process.env.RAZOR_PAY_X_ACCOUNT,
          fund_account_id: razorPayFundAccount,
          amount: amount * 100,
          currency: "INR",
          mode: "IMPS",
          purpose: "withdrawal",
          queue_if_low_balance: false,
          reference_id: req.user._id,
          narration: "fund withdrawal from skropay",
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.id) {
            new WithdrawMoney({
              transactionId: data.id,
              user: req.user._id,
              amount: amount,
              paymentMethod,
              note: "Withdraw money from wallet",
            })
              .save()
              .then((transaction) => {
                User.findOneAndUpdate(
                  { _id: req.user._id },
                  {
                    $inc: { balance: -Math.abs(amount) },
                    $addToSet: { transactions: transaction._id },
                  },
                  { new: true }
                ).then((updated) => {
                  res.json({ code: "ok", transaction: transaction });
                });
              })
              .catch((err) => {
                console.log(err);
              });
          } else {
            console.log(data);
            res.status(500).json({ message: "someting went wrong" });
          }
        });
    } else {
      res.status(400).json({ message: "bad request" });
    }
  }
);

// -------------------------- payment methods
app.post(
  "/api/addPaymentMethod",
  passport.authenticate("userPrivate"),
  (req, res) => {
    const {
      type,
      brand,
      name,
      nameOnCard,
      cardNumber,
      exp,
      cvv,
      bank,
      ifsc,
      accountNumber,
      accountType,
      city,
    } = req.body;
    const Model = global[type];
    if (type === "BankCard") {
      if (brand && nameOnCard && cardNumber && cvv && exp) {
        new Model({
          ...req.body,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          nameOnCard,
        })
          .save()
          .then((method) => {
            if (method) {
              User.findOneAndUpdate(
                { _id: req.user._id },
                { $addToSet: { paymentMethods: method._id } },
                { new: true }
              )
                .then((newUser) => {
                  res.json({
                    message: "payment method added",
                    paymentMethod: method,
                  });
                })
                .catch((err) => {
                  console.log(err);
                  res.status(400).json({ message: "bad request" });
                });
            }
          })
          .catch((err) => {
            console.log(err);
            res.status(400).json({ message: "incomplete request" });
          });
      } else {
        res.status(400).json({
          code: 400,
          message: "bad request",
          fieldsRequired: "brand, nameOnCard, cardNumber, cvv, exp",
          fieldsFound: req.body,
        });
      }
    } else if (type === "BankAccount") {
      if (name && bank && ifsc && accountNumber && accountType && city) {
        console.log(accountType);
        new Model({ name, bank, ifsc, accountNumber, city, type: accountType })
          .save()
          .then((method) => {
            if (method) {
              User.findOneAndUpdate(
                { _id: req.user._id },
                { $addToSet: { paymentMethods: method._id } },
                { new: true }
              )
                .then((newUser) => {
                  res.json({
                    message: "payment method added",
                    paymentMethod: method,
                  });
                })
                .catch((err) => {
                  console.log(err);
                  res.status(400).json({ message: "bad request" });
                });
            }
          })
          .catch((err) => {
            console.log(err);
            res.status(400).json({ message: "incomplete request" });
          });
      } else {
        res.status(400).json({
          code: 400,
          message: "bad request",
          fieldsRequired: "name, bank, ifsc, accountNumber",
          fieldsFound: req.body,
        });
      }
    } else {
      res.status(400).json({ code: 400, message: "type is required" });
    }
  }
);
app.patch(
  "/api/editPaymentMethod",
  passport.authenticate("userPrivate"),
  (req, res) => {
    const { type, accountType } = req.body;
    if (global[type]) {
      global[type]
        .findOneAndUpdate(
          { _id: req.body._id },
          {
            ...req.body,
            ...(type === "BankAccount" && accountType && { type: accountType }),
          },
          { new: true }
        )
        .then((paymentMethod) => {
          if (paymentMethod) {
            res.json({ code: "ok", paymentMethod });
          } else {
            res.status(400).json({ code: 400, message: "bad request" });
          }
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({ message: "server error" });
        });
    } else {
      res.status(400).json({ code: 400, message: "type is required" });
    }
  }
);
app.delete(
  "/api/deletePaymentMethod",
  passport.authenticate("userPrivate"),
  (req, res) => {
    PaymentMethod.findOneAndDelete({ _id: req.body._id })
      .then((dbRes) => {
        if (dbRes) {
          return User.findOneAndUpdate(
            { _id: req.user._id },
            { $pull: { paymentMethods: req.body._id } }
          );
        } else {
          return null;
        }
      })
      .then((newUser) => {
        if (newUser) {
          res.json({ code: "ok", message: "payment method deleted" });
        } else {
          res.status(400).json({ code: 400, message: "bad request" });
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(400).json({ code: 400, message: "bad request" });
      });
  }
);

// --------------------------- seller
app.post(
  "/api/requestMilestone",
  passport.authenticate("userPrivate"),
  async (req, res) => {
    const {
      buyer_id,
      amount,
      products,
      dscr,
      deliveryDetail,
      order,
      refund,
    } = req.body;
    if (buyer_id?.toString() === req.user._id.toString()) {
      res
        .status(403)
        .json({ code: 403, message: "Can not request milestone to self." });
      return;
    }
    const { fee } = await Config.findOne().then((config) => config || {});
    const buyer = await User.findOne({ _id: buyer_id });
    if (buyer && amount && dscr) {
      new Milestone({
        ...req.body,
        status: "pending",
        fee,
        buyer,
        seller: req.user,
      })
        .save()
        .then((milestone) => {
          if (milestone) {
            if (ObjectId.isValid(order)) {
              Order.findOneAndUpdate(
                { _id: order, "seller._id": req.user._id },
                { $addToSet: { milestones: milestone._id } },
                { new: true }
              ).then((value) => {});
            }
            if (ObjectId.isValid(refund)) {
              Refund.findOneAndUpdate(
                { _id: refund, "buyer._id": req.user._id },
                { $addToSet: { milestones: milestone._id } },
                { new: true }
              ).then((value) => {});
            }
            InitiateChat({
              user: req.user._id,
              client: buyer._id,
            })
              .then(([userChat, clientChat]) => {
                return SendMessage({
                  rooms: [userChat._id, clientChat._id],
                  message: {
                    type: "milestone",
                    from: req.user._id,
                    to: buyer._id,
                    text: `${req.user.firstName} requested a milestone for ₹${milestone.amount}.`,
                    milestoneId: milestone._id,
                  },
                });
              })
              .then((chatRes) => {
                res.json({
                  code: "ok",
                  message: "milestone requested",
                  milestone: milestone,
                });
                notify(
                  buyer._id,
                  JSON.stringify({
                    title: "New Milestone request",
                    body: `${req.user.firstName} requested a milestone for ₹${milestone.amount}`,
                  }),
                  "User"
                );
              });
          }
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({ code: 500, message: "something went wrong" });
        });
    } else {
      res.status(400).json({
        code: 400,
        message: "valid buyer_id, amount, dscr is required",
      });
    }
  }
);
app.patch(
  "/api/requestRelease",
  passport.authenticate("userPrivate"),
  (req, res) => {
    const { _id } = req.body;
    Milestone.findOneAndUpdate(
      { _id: req.body._id, "seller._id": req.user._id, status: "inProgress" },
      { status: "pendingRelease" },
      { new: true }
    )
      .then((milestone) => {
        if (milestone) {
          res.json({ code: "ok", message: "release requested", milestone });
          InitiateChat({
            user: milestone.seller._id,
            client: milestone.buyer._id,
          })
            .then(([userChat, clientChat]) => {
              return SendMessage({
                rooms: [userChat._id, clientChat._id],
                message: {
                  type: "milestone",
                  from: milestone.seller._id,
                  to: milestone.buyer._id,
                  text: `${req.user.firstName} requested release of a milestone`,
                  milestoneId: milestone._id,
                },
              });
            })
            .then((chatRes) => {
              notify(
                milestone.buyer._id,
                JSON.stringify({
                  title: "Milestone request",
                  body: `${milestone.seller.firstName} requested a milestone`,
                }),
                "User"
              );
            });
        } else {
          res.status(400).json({ code: 400, message: "bad request" });
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "something went wrong" });
      });
  }
);
app.patch(
  "/api/declineMilestone",
  passport.authenticate("userPrivate"),
  (req, res) => {
    if (req.body._id) {
      Milestone.findOneAndUpdate(
        {
          _id: req.body._id,
          "seller._id": req.user._id,
          status: "inProgress",
        },
        { status: "declined" },
        { new: true }
      ).then((milestone) => {
        if (milestone) {
          new P2PTransaction({
            milestoneId: milestone._id,
            amount: milestone.amount,
            user: milestone.buyer._id,
            client: milestone.seller,
            dscr: milestone.dscr,
            note: "milestone declined",
          })
            .save()
            .then((transaction) => {
              if (transaction) {
                User.findOneAndUpdate(
                  { _id: milestone.buyer._id },
                  {
                    $addToSet: { transactions: transaction._id },
                    $inc: { balance: transaction.amount },
                  },
                  { new: true }
                ).then((value) => {
                  InitiateChat({
                    user: milestone.seller._id,
                    client: milestone.buyer._id,
                  })
                    .then(([userChat, clientChat]) => {
                      return SendMessage({
                        rooms: [userChat._id, clientChat._id],
                        message: {
                          type: "milestone",
                          from: req.user._id,
                          to: milestone.buyer._id,
                          text: `${req.user.firstName} declined a milestones`,
                          milestoneId: milestone._id,
                        },
                      });
                    })
                    .then((chatRes) => {
                      res.json({
                        code: "ok",
                        message: "milestone declined",
                        milestone,
                      });
                      notify(
                        milestone.seller._id,
                        JSON.stringify({
                          title: "Milestone declined",
                          body: `${req.user.firstName} declined a milestone`,
                        }),
                        "User"
                      );
                    });
                });
              } else {
                Milestone.findOneAndUpdate(
                  { _id: milestone._id },
                  { status: "inProgress" },
                  { new: true }
                ).then((milestone) => {
                  res
                    .status(500)
                    .json({ code: 500, message: "someting went wrong" });
                });
              }
            });
        } else {
          res
            .status(400)
            .json({ code: 400, message: "milestone could not be found" });
        }
      });
    } else {
      res.status(400).json({ code: 400, message: "_id is required" });
    }
  }
);
app.delete(
  "/api/cancelMilestoneRequest",
  passport.authenticate("userPrivate"),
  (req, res) => {
    console.log(req.body._id);
    if (req.body._id) {
      Milestone.findOneAndDelete({
        _id: req.body._id,
        status: "pending",
        "seller._id": req.user._id,
      }).then((milestone) => {
        console.log(milestone);
        if (milestone) {
          res.json({ code: "ok", message: "milestone request cancelled" });
        } else {
          res
            .status(400)
            .json({ code: 400, message: "milestone does not exist." });
        }
      });
    } else {
      res.status(400).json({ code: 400, message: "_id is required" });
    }
  }
);

// --------------------------- buyer
app.patch(
  "/api/approveMilestone",
  passport.authenticate("userPrivate"),
  (req, res) => {
    const { milestone_id, amount } = req.body;
    if (+amount > req.user.balance) {
      res.status(403).json({ code: 403, message: "insufficient fund" });
      return;
    }
    if (milestone_id && +amount) {
      Milestone.findOneAndUpdate(
        { _id: milestone_id, "buyer._id": req.user._id, status: "pending" },
        { status: "inProgress", ...(amount && { amount }) },
        { new: true }
      )
        .then((milestone) => {
          if (milestone) {
            new P2PTransaction({
              milestoneId: milestone._id,
              amount: -Math.abs(milestone.amount),
              user: req.user._id,
              client: milestone.seller,
              dscr: milestone.dscr,
              note: "milestone creation",
            })
              .save()
              .then((transaction) =>
                User.findOneAndUpdate(
                  { _id: req.user._id },
                  {
                    $inc: { balance: -Math.abs(amount) },
                    $addToSet: { transactions: transaction._id },
                  },
                  { new: true }
                )
              )
              .then((updated) => {
                InitiateChat({
                  user: req.user._id,
                  client: milestone.seller._id,
                })
                  .then(([userChat, clientChat]) => {
                    return SendMessage({
                      rooms: [userChat._id, clientChat._id],
                      message: {
                        type: "milestone",
                        from: req.user._id,
                        to: milestone.seller._id,
                        text: `${req.user.firstName} approved a milestones`,
                        milestoneId: milestone._id,
                      },
                    });
                  })
                  .then((chatRes) => {
                    res.json({
                      code: "ok",
                      message: "milestone approved",
                      milestone,
                    });
                    notify(
                      milestone.seller._id,
                      JSON.stringify({
                        title: "Milestone created",
                        body: `${milestone.buyer.firstName} created a milestone`,
                      }),
                      "User"
                    );
                  });
              })
              .catch((err) => {
                console.log(err);
                res
                  .status(500)
                  .json({ code: 500, message: "something went wrong" });
              });
          } else {
            res.status(500).json({ code: 500, message: "bad request" });
          }
        })
        .catch((err) => {
          console.log(err);
          res.status(400).json({ code: 500, message: "something went wrong" });
        });
    } else {
      res
        .status(400)
        .json({ code: 400, message: "milestone_id and amount is required" });
    }
  }
);
app.post(
  "/api/createMilestone",
  passport.authenticate("userPrivate"),
  async (req, res) => {
    const { amount, seller, dscr, order, refund } = req.body;
    const { fee } = await Config.findOne().then((config) => config || {});
    if (seller?.toString() === req.user._id.toString()) {
      res
        .status(403)
        .json({ code: 403, message: "Can not create milestone for self." });
      return;
    }
    if (+amount > req.user.balance) {
      res.status(403).json({ code: 403, message: "insufficient fund" });
      return;
    }
    if (
      order &&
      (!order?.products?.length || !order?.deliveryDetail || !order?.total)
    ) {
      res.status(400).json({
        code: 400,
        message: "order with products, deliveryDetail, total is required",
      });
      return;
    }
    const newOrder = order
      ? await new Order({
          ...order,
          buyer: req.user,
          seller: seller,
          products: order.products.map(({ product, qty }) => ({
            product: { ...product, _id: ObjectId(product._id) },
            qty,
          })),
          deliveryDetail: order.deliveryDetail,
          total: order.total.addPercent(fee),
          fee: fee,
        })
          .save()
          .catch((err) => {
            console.log(err);
          })
      : null;
    if (order && !newOrder) {
      res.status(500).json({ code: 500, message: "Could not place order." });
      return;
    }
    if (+amount && seller && dscr) {
      new Milestone({
        ...req.body,
        status: "inProgress",
        buyer: req.user._doc,
        fee,
        seller,
        ...(newOrder && { order: newOrder._id }),
      })
        .save()
        .then((milestone) => {
          if (milestone) {
            if (newOrder) {
              Order.findOneAndUpdate(
                { _id: newOrder._id, "buyer._id": req.user._id },
                { $addToSet: { milestones: milestone._id } },
                { new: true }
              ).then((value) => {});
              notify(
                newOrder.seller._id,
                JSON.stringify({
                  title: "New order in Delivery Pay!",
                  body: "You have a new order",
                }),
                "User"
              );
            }
            if (ObjectId.isValid(refund)) {
              Refund.findOneAndUpdate(
                { _id: refund, "seller._id": req.user._id },
                { $addToSet: { milestones: milestone._id } },
                { new: true }
              ).then((value) => {});
            }
            new P2PTransaction({
              milestoneId: milestone._id,
              amount: -Math.abs(milestone.amount),
              user: req.user._id,
              client: milestone.seller,
              dscr: milestone.dscr,
              note: "milestone creation",
            })
              .save()
              .then((transaction) =>
                Promise.all([
                  User.findOneAndUpdate(
                    { _id: req.user._id },
                    {
                      $inc: { balance: -Math.abs(amount) },
                      $addToSet: {
                        transactions: transaction._id,
                        milestones: milestone._id,
                      },
                    },
                    { new: true }
                  ),
                  User.findOneAndUpdate(
                    { _id: seller._id },
                    { $addToSet: { milestones: milestone._id } }
                  ),
                ])
              )
              .then(([user, seller]) => {
                return InitiateChat({
                  user: user._id,
                  client: seller._id,
                }).then(([userChat, clientChat]) => {
                  return SendMessage({
                    rooms: [userChat._id, clientChat._id],
                    message: {
                      type: "milestone",
                      from: user._id,
                      to: seller._id,
                      text: `${req.user.firstName} created a milestone for ₹${milestone.amount}`,
                      milestoneId: milestone._id,
                    },
                  });
                });
              })
              .then((chatRes) => {
                res.json({
                  code: "ok",
                  message: "milestone created",
                  milestone: milestone,
                  ...(newOrder && { order: newOrder }),
                });
                notify(
                  milestone.seller._id,
                  JSON.stringify({
                    title: "Milestone created",
                    body: `${req.user.firstName} created a milestone`,
                  }),
                  "User"
                );
              })
              .catch((err) => {
                console.log(err);
                res
                  .status(500)
                  .json({ code: 500, message: "something went wrong" });
              });
          } else {
            res.status(500).json({ message: "something went wrong" });
          }
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({ code: 500, message: "something went wrong" });
        });
    } else {
      res.status(400).json({
        code: 400,
        message: "incomplete request",
        fieldsRequired: "amount, seller, dscr",
        fieldsFound: req.body,
      });
    }
  }
);
app.patch(
  "/api/releaseMilestone",
  passport.authenticate("userPrivate"),
  async (req, res) => {
    const { _id, amount } = req.body;
    const milestone = await Milestone.findOne({
      _id,
      $or: [{ status: "inProgress" }, { status: "pendingRelease" }],
      "buyer._id": req.user._id,
    });
    const { fee } = await Config.findOne().then((config) => config || {});
    if (milestone) {
      if (+amount > milestone.amount) {
        if (+amount - milestone.amount > req.user.balance) {
          res.status(403).json({ code: 403, message: "insufficient balance" });
          return;
        }
        Promise.all([
          new P2PTransaction({
            amount: -Math.abs(amount - milestone.amount),
            milestoneId: milestone._id,
            user: req.user._id,
            client: milestone.client,
            note: "milestone increase",
            dscr: milestone.dscr,
          }).save(),
          new P2PTransaction({
            amount: +((amount / (100 + fee)) * 100).toFixed(2),
            milestoneId: milestone._id,
            user: milestone.seller._id,
            client: req.user,
            note: "milestone release",
            dscr: milestone.dsc,
          }).save(),
          Milestone.findOneAndUpdate(
            { _id: milestone._id },
            { status: "released", releaseDate: new Date(), amount },
            { new: true }
          ),
        ]).then(([buyerTrans, sellerTrans, newMilestone]) => {
          if (buyerTrans && sellerTrans && newMilestone) {
            Promise.all([
              User.findOneAndUpdate(
                { _id: milestone.buyer._id },
                {
                  $inc: { balance: -Math.abs(amount - buyerTrans.amount) },
                  $addToSet: { transactions: buyerTrans._id },
                },
                { new: true }
              ),
              User.findOneAndUpdate(
                { _id: milestone.seller._id },
                {
                  $inc: { balance: sellerTrans.amount },
                  $addToSet: { transactions: sellerTrans._id },
                },
                { new: true }
              ),
            ]).then(([buyer, seller]) => {
              InitiateChat({
                user: buyer._id,
                client: seller._id,
              }).then(([userChat, clientChat]) =>
                SendMessage({
                  rooms: [userChat._id, clientChat._id],
                  message: {
                    type: "milestone",
                    from: buyer._id,
                    to: seller._id,
                    text: `${req.user.firstName} released a milestone of ₹${newMilestone.amount}`,
                    milestoneId: milestone._id,
                  },
                })
              );
              notify(
                seller._id,
                JSON.stringify({
                  title: "Milestone released",
                  body: `${milestone.buyer.firstName} realsed a milestone`,
                }),
                "User"
              );
              res.json({
                message: "milestonre released",
                milestone: newMilestone,
              });
            });
          } else {
            res.status(500).json({ message: "someting went wrong" });
          }
        });
      } else if (+amount < milestone.amount) {
        Promise.all([
          new P2PTransaction({
            amount: milestone.amount - amount,
            milestoneId: milestone._id,
            user: req.user._id,
            client: milestone.seller,
            note: "milestone decrease",
            dscr: milestone.dscr,
          }).save(),
          new P2PTransaction({
            amount: +((amount / (100 + fee)) * 100).toFixed(2),
            milestoneId: milestone._id,
            user: milestone.seller._id,
            client: milestone.buyer,
            note: "milestone release",
            dscr: milestone.dscr,
          }).save(),
          Milestone.findOneAndUpdate(
            { _id: milestone._id },
            { status: "released", releaseDate: new Date(), amount },
            { new: true }
          ),
        ]).then(([buyerTrans, sellerTrans, newMilestone]) => {
          if (buyerTrans && sellerTrans && newMilestone) {
            Promise.all([
              User.findOneAndUpdate(
                { _id: milestone.buyer._id },
                {
                  $inc: { balance: milestone.amount - amount },
                  $addToSet: { transactions: buyerTrans._id },
                },
                { new: true }
              ),
              User.findOneAndUpdate(
                { _id: milestone.seller._id },
                {
                  $inc: { balance: sellerTrans.amount },
                  $addToSet: { transactions: sellerTrans._id },
                },
                { new: true }
              ),
            ]).then(([buyer, seller]) => {
              InitiateChat({
                user: buyer._id,
                client: seller._id,
              }).then(([userChat, clientChat]) =>
                SendMessage({
                  rooms: [userChat._id, clientChat._id],
                  message: {
                    type: "milestone",
                    from: buyer._id,
                    to: seller._id,
                    text: `${req.user.firstName} released a milestone of ₹${newMilestone.amount}`,
                    milestoneId: newMilestone._id,
                  },
                })
              );
              notify(
                seller._id,
                JSON.stringify({
                  title: "Milestone released",
                  body: `${milestone.buyer.firstName} realsed a milestone`,
                }),
                "User"
              );
              res.json({
                message: "milestonre released",
                milestone: newMilestone,
              });
            });
          }
        });
      } else {
        Promise.all([
          new P2PTransaction({
            amount: +((amount / (100 + fee)) * 100).toFixed(2),
            milestoneId: milestone._id,
            user: milestone.seller._id,
            client: req.user,
            note: "milestone release",
            dscr: milestone.dsc,
          }).save(),
          Milestone.findOneAndUpdate(
            { _id: milestone._id },
            { status: "released", releaseDate: new Date() },
            { new: true }
          ),
        ])
          .then(([sellerTrans, newMilestone]) => {
            User.findOneAndUpdate(
              { _id: milestone.seller._id },
              {
                $inc: { balance: sellerTrans.amount },
                $addToSet: { transactions: sellerTrans._id },
              },
              { new: true }
            ).then((seller) => {
              InitiateChat({
                user: milestone.buyer._id,
                client: milestone.seller._id,
              }).then(([userChat, clientChat]) =>
                SendMessage({
                  rooms: [userChat._id, clientChat._id],
                  message: {
                    type: "milestone",
                    from: milestone.buyer._id,
                    to: milestone.seller._id,
                    text: `${req.user.firstName} released a milestone of ₹${milestone.amount}`,
                    milestoneId: milestone._id,
                  },
                })
              );
              notify(
                seller._id,
                JSON.stringify({
                  title: "Milestone released",
                  body: `${milestone.buyer.firstName} realsed a milestone`,
                }),
                "User"
              );
              res.json({
                message: "milestonre released",
                milestone: newMilestone,
              });
            });
          })
          .catch((err) => {
            console.log(err);
            res.status(500).json({ message: "someting went wrong" });
          });
      }
    } else {
      res.status(400).json({ code: 400, message: "_id is invalid" });
    }
  }
);
app.delete(
  "/api/cancelMilestone",
  passport.authenticate("userPrivate"),
  (req, res) => {
    const { _id } = req.body;
    if (_id) {
      Milestone.findOneAndUpdate(
        { _id },
        { status: "cancelled" },
        { new: true }
      )
        .then((milestone) => {
          if (milestone) {
            new P2PTransaction({
              amount: milestone.amount,
              user: req.user._id,
              client: milestone.seller,
              note: "milestone cancellation",
              dscr: milestone.dscr,
            })
              .save()
              .then((transaction) => {
                if (transaction) {
                  User.findOneAndUpdate(
                    { _id: req.user._id },
                    {
                      $inc: { balance: milestone.amount },
                      $addToSet: { transactions: transaction._id },
                    },
                    { new: true }
                  )
                    .then((user) => {
                      res.json({ message: "milestone cancelled" });
                    })
                    .catch((err) => {
                      console.log(err);
                      res.status(500).json({ message: "something went wrong" });
                    });
                } else {
                  res
                    .status(500)
                    .json({ code: 500, message: "something went wrong" });
                }
              })
              .catch((err) => {
                console.log(err);
                res
                  .status(500)
                  .json({ code: 500, message: "something went wrong" });
              });
          }
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({ message: "something went wrong" });
        });
    } else {
      res.status(400).json({ code: 400, message: "_id is required" });
    }
  }
);
