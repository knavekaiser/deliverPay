app.get("/api/products", passport.authenticate("userPrivate"), (req, res) => {
  const { q, page, perPage } = req.query;
  Product.aggregate([
    {
      $match: {
        user: req.user._id,
        ...(q && { name: new RegExp(q, "gi") }),
      },
    },
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
      res.json(dbRes[0]);
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
    const { name, dscr, images, price } = req.body;
    if (name && price && dscr) {
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
        message: "name, price, dscr is required",
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
  "/api/removeProduct",
  passport.authenticate("userPrivate"),
  (req, res) => {
    const { _id } = req.body;
    if (_id) {
      Product.findOneAndDelete({ _id, user: req.user._id }).then((deleted) => {
        if (deleted) {
          res.json({ code: "ok", product: deleted });
        } else {
          res.status(400).json({ code: 400, message: "bad request" });
        }
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

app.get(
  "/api/getProducts",
  passport.authenticate("userPrivate"),
  (req, res) => {
    const { seller, q, page, perPage, sort, order } = req.query;
    const sortOrder = {
      [sort || "popularity"]: order === "dsc" ? -1 : 1,
    };
    const query = {
      ...(ObjectId.isValid(seller) && { user: ObjectId(seller) }),
      ...(q && {
        $or: [
          { name: new RegExp(q, "gi") },
          { dscr: new RegExp(q, "gi") },
          { tags: { $in: [q] } },
        ],
      }),
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
    ]).then(([{ products, total }]) => {
      res.json({ code: "ok", products, total: total || 0 });
    });
  }
);
app.get(
  "/api/singleProduct",
  passport.authenticate("userPrivate"),
  (req, res) => {
    if (ObjectId.isValid(req.query._id)) {
      Product.findOne({ _id: req.query._id })
        .populate("user", "firstName lastName phone email")
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
  }
);
app.post("/api/getCartDetail", (req, res) => {
  const { cart } = req.body;
  if (cart) {
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
    ]).then((dbRes) => {
      if (dbRes.length) {
        res.json({
          code: "ok",
          carts: dbRes.map((shop) => ({
            ...shop,
            products: shop.products.map((product) => ({
              product,
              qty: cart.find(
                (item) => item.product._id.toString() === product._id.toString()
              )?.qty,
            })),
          })),
        });
      } else {
        res.status(400).json({ code: 400, message: "no product found" });
      }
    });
  } else {
    res.status(400).json({ code: 400, message: "Cart is required" });
  }
});
