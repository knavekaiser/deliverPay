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
