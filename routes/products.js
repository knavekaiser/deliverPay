app.get("/api/products", passport.authenticate("userPrivate"), (req, res) => {
  const {
    q,
    page,
    perPage,
    sort,
    order,
    category,
    dateFrom,
    dateTo,
    type,
  } = req.query;
  const query = {
    user: req.user._id,
    ...(q && { name: new RegExp(q, "gi") }),
    ...(dateFrom &&
      dateTo && {
        createdAt: {
          $gte: new Date(dateFrom),
          $lt: new Date(dateTo),
        },
      }),
    ...(category && { category }),
    ...(type && { type }),
  };
  const sortOrder = {
    [sort || "createdAt"]: order === "asc" ? 1 : -1,
  };
  Product.aggregate([
    { $match: query },
    { $sort: sortOrder },
    {
      $facet: {
        products: [
          { $skip: +perPage * (+(page || 1) - 1) },
          { $limit: +(perPage || 20) },
        ],
        total: [{ $group: { _id: null, count: { $sum: 1 } } }],
      },
    },
    { $set: { total: { $first: "$total.count" } } },
  ])
    .then(([{ products, total }]) => {
      res.json({
        code: "ok",
        products,
        total: total || 0,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "database error" });
    });
});
app.post(
  "/api/addProduct",
  passport.authenticate("userPrivate"),
  (req, res) => {
    const { type, name, dscr, images, price } = req.body;
    if (type && name && price && dscr) {
      Product.find({ user: req.user._id })
        .countDocuments()
        .then((num) => {
          if (num < 100) {
            new Product({ ...req.body, user: req.user._id })
              .save()
              .then((product) => {
                res.json({ code: "ok", product });
              })
              .catch((err) => {
                console.log(err);
                res.status(500).json({ code: 500, message: "database error" });
              });
          } else {
            res.status(403).json({ code: 403, message: "100 product at max" });
          }
        });
    } else {
      res.status(400).json({
        code: 400,
        message: "type, name, price, dscr is required",
        fieldsFound: req.body,
      });
    }
  }
);
app.patch(
  "/api/editProduct",
  passport.authenticate("userPrivate"),
  (req, res) => {
    const { _id } = req.body;
    if (_id) {
      Product.findOneAndUpdate(
        { _id, user: req.user._id },
        { ...req.body },
        { new: true }
      )
        .then((product) => {
          if (product) {
            res.json({ code: "ok", product });
          } else {
            res.status(400).json({ code: "400", message: "bad request" });
          }
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({ code: 500, message: "database error" });
        });
    } else {
      res.status(400).json({
        code: 400,
        message: "_id is required",
        fieldsFound: req.body,
      });
    }
  }
);
app.delete(
  "/api/deleteProducts",
  passport.authenticate("userPrivate"),
  (req, res) => {
    const { _ids } = req.body;
    if (_ids) {
      Product.deleteMany({
        _id: { $in: _ids },
        user: req.user._id,
      }).then((deleted) => {
        console.log(deleted);
        if (deleted) {
          res.json({ code: "ok", product: deleted });
        } else {
          res.status(400).json({ code: 400, message: "bad request" });
        }
      });
    } else {
      res.status(400).json({
        code: 400,
        message: "_ids is required",
        fieldsFound: req.body,
      });
    }
  }
);

app.get("/api/getProducts", (req, res) => {
  const { seller, q, page, perPage, sort, order, category } = req.query;
  const sortOrder = {
    [sort || "popularity"]: order === "dsc" ? -1 : 1,
  };
  const user = req.cookies?.access_token
    ? jwt_decode(req.cookies?.access_token)?.sub
    : null;
  const query = {
    ...(user && { user: { $not: { $eq: ObjectId(user) } } }),
    ...(ObjectId.isValid(seller) && { user: ObjectId(seller) }),
    ...(q && {
      $or: [
        { name: new RegExp(q, "gi") },
        { dscr: new RegExp(q, "gi") },
        { tags: { $in: [q] } },
      ],
    }),
    ...(category && { category: new RegExp(category, "gi") }),
  };
  Product.aggregate([
    { $match: query },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "sellerGst",
      },
    },
    {
      $set: {
        sellerGst: { $first: "$sellerGst.gst" },
      },
    },
    {
      $set: {
        gst: {
          $cond: {
            if: {
              $and: [
                { $eq: ["$sellerGst.verified", true] },
                { $isNumber: "$gst" },
              ],
            },
            then: "$gst",
            else: "$sellerGst.amount",
          },
        },
        "user.gst": "$sellerGst",
      },
    },
    { $unset: "sellerGst" },
    { $sort: sortOrder },
    {
      $facet: {
        products: [
          { $skip: +perPage * (+(page || 1) - 1) },
          { $limit: +(perPage || 20) },
        ],
        total: [{ $group: { _id: null, count: { $sum: 1 } } }],
      },
    },
    { $set: { total: { $first: "$total.count" } } },
  ]).then(async ([{ products, total }]) => {
    res.json({
      code: "ok",
      products,
      total: total || 0,
      ...(ObjectId.isValid(seller) && {
        seller: await User.findOne(
          { _id: seller },
          "firstName lastName phone email profileImg"
        ),
      }),
    });
  });
});
app.get("/api/singleProduct", (req, res) => {
  if (ObjectId.isValid(req.query._id)) {
    Product.findOne({ _id: req.query._id })
      .populate("user", "firstName lastName phone email profileImg gst")
      .then((product) => {
        if (product) {
          res.json({ code: "ok", product });
        } else {
          res
            .status(404)
            .json({ code: 404, message: "product could not be found" });
        }
      });
  } else {
    res.status(400).json({ code: 400, message: "Valid _id is required." });
  }
});
app.post(
  "/api/getCartDetail",
  passport.authenticate("userPrivate"),
  (req, res) => {
    const { cart } = req.body;
    if (cart.length) {
      Product.aggregate([
        {
          $match: {
            $or: cart.map((item) => ({ _id: ObjectId(item.product._id) })),
          },
        },
        {
          $group: {
            _id: "$user",
            products: {
              $push: {
                _id: "$_id",
                name: "$name",
                images: "$images",
                dscr: "$dscr",
                price: "$price",
                discount: "$discount",
                createdAt: "$createdAt",
                gst: "$gst",
              },
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "seller",
          },
        },
        { $set: { seller: { $first: "$seller" } } },
        {
          $project: {
            products: 1,
            _id: 0,
            "seller._id": 1,
            "seller.firstName": 1,
            "seller.lastName": 1,
            "seller.phone": 1,
            "seller.email": 1,
            "seller.profileImg": 1,
            "seller.gst": 1,
            "seller.rating": 1,
          },
        },
        {
          $match: {
            "seller._id": { $not: { $eq: req.user._id } },
          },
        },
      ]).then((dbRes) => {
        if (dbRes.length) {
          res.json({
            code: "ok",
            carts: dbRes.map((shop) => ({
              ...shop,
              products: shop.products.map((product) => ({
                product,
                qty: cart.find(
                  (item) =>
                    item.product._id.toString() === product._id.toString()
                )?.qty,
              })),
            })),
          });
        } else {
          res.status(400).json({ code: 400, message: "no product found" });
        }
      });
    } else {
      res.status(400).json({
        code: 400,
        message: "Cart with at least one item is required",
      });
    }
  }
);

app.post(
  "/api/addCategory",
  passport.authenticate("userPrivate"),
  (req, res) => {
    if (req.body.category) {
      Category.findOneAndUpdate(
        { user: req.user._id },
        { $addToSet: { categories: req.body.category } },
        { new: true }
      )
        .then((dbRes) => {
          if (dbRes) {
            res.json({ code: "ok", categories: dbRes.categories });
          } else {
            new Category({
              user: req.user._id,
              categories: [req.body.category],
            })
              .save()
              .then((dbRes) => {
                res.json({ code: "ok", categories: dbRes.categories });
              });
          }
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({ code: 500, message: "Datebase error" });
        });
    } else {
      res.status(400).json({ code: 400, message: "category is required" });
    }
  }
);
app.get("/api/categories", passport.authenticate("userPrivate"), (req, res) => {
  Category.findOne({ user: req.user._id })
    .then((dbRes) => {
      res.json({ code: "ok", categories: dbRes?.categories || [] });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ code: 500, message: "Database error" });
    });
});
app.delete(
  "/api/categories",
  passport.authenticate("userPrivate"),
  (req, res) => {
    Category.findOneAndUpdate(
      { user: req.user._id },
      { $pull: { categories: req.body.category } },
      { new: true }
    )
      .then((dbRes) => {
        if (dbRes) {
          res.json({ code: "ok", categories: dbRes.categories });
        } else {
          res
            .status(400)
            .json({ code: 400, message: "Could not find category" });
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ code: 500, message: "Database error" });
      });
  }
);
