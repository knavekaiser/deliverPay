const { handleSignIn, signingIn, genCode } = require("../config/passport.js");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  const userid = payload["sub"];
  return userid || null;
}

app.post("/api/registerUser", async (req, res) => {
  const { firstName, lastName, phone, email, password } = req.body;
  if (firstName && lastName && phone && email && password) {
    const referer = await User.findOne({ _id: req.body.referer });
    bcrypt
      .hash(password, 10)
      .then((hash) => {
        return new User({
          ...req.body,
          pass: hash,
          userId: `${firstName}_${lastName}_${new Date().getTime()}`,
        }).save();
      })
      .then((dbRes) => {
        if (dbRes) {
          signingIn(dbRes._doc, res);
          if (referer) {
            new Reward({
              name: "Referral reward",
              amount: 50,
              dscr: "cashback",
            })
              .save()
              .then((reward) => {
                User.findOneAndUpdate(
                  { _id: referer },
                  { $addToset: { rewards: reward._id } },
                  { new: true }
                )
                  .then((user) => {
                    if (user) {
                      notify(
                        referer,
                        JSON.stringify({
                          title: "Referral reward!",
                          body:
                            "Congratulations, you just got ₹50 cashback from Delivery Pay Referral program.",
                        })
                      );
                    }
                  })
                  .catch((err) => {
                    if (err.name === "MongoError") {
                      User.findOneAndUpdate(
                        { _id: referer },
                        { rewards: [reward._id] },
                        { new: true }
                      ).then((user) => {
                        console.log(user.rewards);
                      });
                    }
                  });
              });
          }
        } else {
          res.status(500).json({ message: "something went wrong" });
        }
      })
      .catch((err) => {
        if (err.code === 11000) {
          res.status(400).json({
            message: "user exists",
            code: err.code,
            field: Object.keys(err.keyValue)[0],
          });
        } else {
          console.log(err);
          res.status(500).json({ message: "something went wrong" });
        }
      });
  } else {
    res.status(400).json({
      code: 400,
      message: "Incomplete request",
      fieldsRequired: "firstName, lastName, phone, email, password",
      fieldsFound: req.body,
    });
  }
});
app.post(
  "/api/userLogin",
  passport.authenticate("user", { session: false, failWithError: true }),
  handleSignIn,
  (err, req, res, next) => {
    console.log(err);
    res.status(401).json({ code: 401, message: "invalid credentials" });
  }
);
app.get(
  "/api/authUser",
  passport.authenticate("userPrivate"),
  async (req, res) => {
    const user = await User.aggregate([
      { $match: { _id: req.user._id } },
      {
        $lookup: {
          from: "paymentmethods",
          localField: "paymentMethods",
          foreignField: "_id",
          as: "paymentMethods",
        },
      },
    ]);
    if (user.length) {
      signingIn(user[0], res);
    } else {
      res.status(401).json({ message: "not logged in" });
    }
  },
  (err, req, res, next) => {
    res.status(401).json({ code: 401, message: "invalid credentials" });
  }
);
app.post("/api/userLoginUsingSocial", async (req, res) => {
  const { googleToken, facebookId } = req.body;
  const googleId = await verify(googleToken);
  if (googleId || facebookId) {
    const query = {
      ...(googleId && { googleId }),
      ...(req.body.facebookId && { facebookId }),
    };
    User.aggregate([
      { $match: query },
      {
        $lookup: {
          from: "paymentmethods",
          localField: "paymentMethods",
          foreignField: "_id",
          as: "paymentMethods",
        },
      },
    ])
      .then((user) => {
        if (user.length) {
          signingIn(user[0], res);
        } else {
          res.status(401).json({ code: 401, message: "User does not exist." });
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "database error" });
      });
  } else {
    res.status(401).json({ code: 401, message: "user not logged in" });
  }
});

app.get(
  "/api/viewUserProfile",
  passport.authenticate("userPrivate"),
  (req, res) => {
    User.aggregate([
      { $match: { _id: ObjectId(req.user._id) } },
      {
        $lookup: {
          from: "paymentmethods",
          localField: "paymentMethods",
          foreignField: "_id",
          as: "paymentMethods",
        },
      },
      {
        $project: {
          pass: 0,
        },
      },
    ])
      .then((dbRes) => {
        if (dbRes.length) {
          res.json(dbRes[0]);
        } else {
          res.status(400).json({ message: "bad request" });
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(400).json({ message: "something went wrong" });
      });
  }
);
app.patch(
  "/api/editUserProfile",
  passport.authenticate("userPrivate"),
  async (req, res) => {
    User.findOneAndUpdate(
      { _id: req.user._id },
      {
        ...req.body,
        ...(req.body.password && {
          pass: await bcrypt.hash(req.body.password, 10),
        }),
      },
      { new: true }
    )
      .then((user) => {
        delete user._doc.pass;
        res.json({ message: "profile updated", user: user._doc });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "something went wrong" });
      });
  }
);

app.post("/api/sendUserOTP", async (req, res) => {
  const { phone } = req.body;
  const code = genCode(6);
  const [user, hash] = await Promise.all([
    User.findOne({ phone }),
    bcrypt.hash(code, 10),
    OTP.findOneAndDelete({ id: phone }),
  ]);
  if (user) {
    new OTP({
      id: req.body.phone,
      code: hash,
    })
      .save()
      .then((dbRes) => {
        if (dbRes) {
          // send text massage here
          res.json({
            message: "6 digit code has been sent, enter it within 2 minutes",
          });
        } else {
          res.status(500).json({ message: "something went wrong" });
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "someting went wrong" });
      });
  } else {
    res.status(400).json({ message: "invalid request" });
  }
});
app.put("/api/submitUserOTP", async (req, res) => {
  const { phone, code } = req.body;
  const dbOtp = await OTP.findOne({ id: phone });
  if (!dbOtp) {
    res.status(404).json({ message: "code does not exists" });
    return;
  }
  if (bcrypt.compareSync(code, dbOtp.code)) {
    User.findOne({ phone }).then((dbUser) => {
      const user = JSON.parse(JSON.stringify(dbUser));
      signingIn(user, res);
    });
  } else {
    if (dbOtp.attempt > 2) {
      OTP.findOneAndDelete({ id: phone }).then(() => {
        res.status(429).json({ message: "start again" });
      });
    } else {
      dbOtp.updateOne({ attempt: dbOtp.attempt + 1 }).then(() => {
        res
          .status(400)
          .json({ message: "wrong code", attempt: dbOtp.attempt + 1 });
      });
    }
  }
});

app.post("/api/sendUserForgotPassOTP", async (req, res) => {
  const { phone, email } = req.body;
  const code = genCode(6);
  const [user, hash] = await Promise.all([
    User.findOne({ $or: [{ phone }, { email }] }),
    bcrypt.hash(code, 10),
    OTP.findOneAndDelete({ id: phone || email }),
  ]);
  if (user) {
    new OTP({
      id: phone || email,
      code: hash,
    })
      .save()
      .then((dbRes) => {
        if (dbRes) {
          if (email) {
            sendEmail({
              from: {
                name: "Delivery Pay Support",
                address: "support@deliverypay.in",
              },
              to: email,
              subject: "Delivery Pay password recovery",
              text: `Hello,\nYour password reset code is ${code}. \nDelivery Pay.`,
            })
              .then((emailRes) => {
                res.json({
                  message:
                    "6 digit code has been sent, enter it within 2 minutes",
                });
              })
              .catch((err) => {
                console.log(err);
                res
                  .status(500)
                  .json({ code: 500, message: "Could not send Email" });
              });
          } else if (true) {
            // send text massage or email here
            res.json({
              message: "6 digit code has been sent, enter it within 2 minutes",
            });
          }
        } else {
          res.status(500).json({ message: "something went wrong" });
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "someting went wrong" });
      });
  } else {
    res.status(400).json({ message: "invalid request" });
  }
});
app.put("/api/submitUserForgotPassOTP", async (req, res) => {
  const { phone, email, code } = req.body;
  const dbOtp = await OTP.findOne({ id: phone || email });
  if (!dbOtp) {
    res.status(404).json({ message: "code does not exists" });
    return;
  }
  if (bcrypt.compareSync(code, dbOtp.code)) {
    OTP.findOneAndUpdate(
      { _id: dbOtp._id },
      { expireAt: new Date(new Date().getTime() + 120000) }
    )
      .then(() => {
        res.json({ code: "ok", message: "OTP correct" });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "something went wrong" });
      });
  } else {
    if (dbOtp.attempt > 2) {
      OTP.findOneAndDelete({ id: phone || email }).then(() => {
        res.status(429).json({ code: 429, message: "start again" });
      });
    } else {
      dbOtp.updateOne({ attempt: dbOtp.attempt + 1 }).then(() => {
        res.status(400).json({
          code: 400,
          message: "wrong code",
          attempt: dbOtp.attempt + 1,
        });
      });
    }
  }
});
app.patch("/api/userResetPass", async (req, res) => {
  const { phone, email, code, newPass } = req.body;
  const dbOtp = await OTP.findOne({ id: phone || email });
  if (!dbOtp) {
    res.status(404).json({ message: "code does not exists" });
    return;
  }
  if (bcrypt.compareSync(code, dbOtp.code)) {
    bcrypt
      .hash(newPass, 10)
      .then((hash) =>
        User.findOneAndUpdate({ $or: [{ phone }, { email }] }, { pass: hash })
      )
      .then((dbUser) => {
        const user = JSON.parse(JSON.stringify(dbUser));
        signingIn(user, res);
      });
  } else {
    if (dbOtp.attempt > 2) {
      OTP.findOneAndDelete({ id: phone }).then(() => {
        res.status(429).json({ message: "start again" });
      });
    } else {
      dbOtp.updateOne({ attempt: dbOtp.attempt + 1 }).then(() => {
        res
          .status(400)
          .json({ message: "wrong code", attempt: dbOtp.attempt + 1 });
      });
    }
  }
});
