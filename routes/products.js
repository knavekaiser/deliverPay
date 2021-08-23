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
app.post(
  "/api/addManyProducts",
  passport.authenticate("userPrivate"),
  (req, res) => {
    const newProducts =
      req.body.items?.map(
        (item) => new Product({ ...item, user: req.user._id })
      ) || [];
    if (newProducts.length) {
      Product.insertMany(newProducts, { ordered: false })
        .then((dbRes) => {
          res.json({ code: "ok", products: dbRes });
        })
        .catch((err) => {
          console.log(err, "err");
        });
    } else {
      res.status(400).json({
        code: 400,
        message:
          "items is required. Make sure data structure of all the products are currect",
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
        seller_id: { $first: "$sellerGst._id" },
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
        "user._id": "$seller_id",
      },
    },
    { $unset: ["sellerGst", "seller_id"] },
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
        categories: await Category.findOne({ user: seller }).then(
          (dbRes) => dbRes?.categories || null
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
    if (Array.isArray([cart])) {
      if (!cart.length) {
        res.json({
          code: "ok",
          carts: [],
        });
        return;
      }
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
            "seller.shopInfo": 1,
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

app.put(
  "/api/updateFBMarketUser",
  passport.authenticate("userPrivate"),
  (req, res) => {
    const { accessToken, pageId } = req.body;
    fetch(`https://graph.facebook.com/oauth/access_token?${new URLSearchParams({
      grant_type: "fb_exchange_token",
      client_id: process.env.FACEBOOK_APP_ID,
      client_secret: process.env.FACEBOOK_APP_SECRET,
      fb_exchange_token: accessToken,
    }).toString()}
`)
      .then((res) => res.json())
      .then(async (data) => {
        if (data.access_token) {
          const pageAccessToken = pageId
            ? await fetch(`https://graph.facebook.com/${pageId}?${new URLSearchParams(
                {
                  fields: access_token,
                  access_token: data.accessToken,
                }
              ).toString()}
            `)
                .then((res) => res.json())
                .then((data) => data)
            : null;
          res.json({
            code: "ok",
            long_lived_token: data.access_token,
            page_access_token: pageAccessToken,
          });
        }
      })
      .catch((err) => {
        console.log(err);
        res
          .status(500)
          .json({ code: 500, message: "Could not get api from facebook" });
      });
  }
);

const addToFbMarket = async (products, catalogId, user_id, accessToken) => {
  const fb_products = [];
  for (var i = 0; i < products.length; i++) {
    const item = products[i];
    await fetch(
      `https://graph.facebook.com/${catalogId}/products?${new URLSearchParams({
        access_token: accessToken,
      }).toString()}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currency: "INR",
          name: item.name,
          price: item.price,
          price_amount: item.price * 100,
          image_url: item.images[0],
          category: item.category,
          brand: item.brand || "none",
          retailer_id: item._id,
          url: `https://deliverypay.in/marketplace/${item._id}`,
          description: item.dscr,
        }),
      }
    )
      .then((res) => res.json())
      .then(async (data) => {
        if (data.error) {
          fb_products.push({
            _id: item._id,
            name: item.name,
            success: false,
            error: data.error.error_user_msg || data.error.message,
          });
          return;
        }
        await Product.findOneAndUpdate(
          { _id: item._id },
          { fbMarketId: data.id },
          { new: true }
        ).then((dbProduct) => {
          fb_products.push({
            _id: dbProduct._id,
            name: item.name,
            success: true,
            fbMarketId: dbProduct.fbMarketId,
          });
        });
      });
  }
  return fb_products;
};
const removeFromFbMarket = async (
  products,
  catalogId,
  user_id,
  accessToken
) => {
  const fb_products = [];
  for (var i = 0; i < products.length; i++) {
    const item = products[i];
    await fetch(
      `https://graph.facebook.com/${item.fbMarketId}?${new URLSearchParams({
        access_token: accessToken,
      }).toString()}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      }
    )
      .then((res) => res.json())
      .then(async (data) => {
        if (data.error) {
          fb_products.push({
            _id: item._id,
            name: item.name,
            success: false,
            error: data.error.error_user_msg || data.error.message,
          });
          return;
        }
        await Product.findOneAndUpdate(
          { _id: item._id },
          { fbMarketId: null },
          { new: true }
        ).then((dbProduct) => {
          fb_products.push({
            _id: dbProduct._id,
            name: item.name,
            success: true,
          });
        });
      });
  }
  return fb_products;
};

app.put(
  "/api/addToFbMarket",
  passport.authenticate("userPrivate"),
  (req, res) => {
    const { _ids } = req.body;
    if (Array.isArray(_ids) && _ids.length > 0) {
      Product.find({
        $or: _ids.map((_id) => ({ _id })),
        user: req.user._id,
      }).then(async (products) => {
        const fb_products = await addToFbMarket(
          products,
          req.user.fbMarket.commerceAccount.catalog.id,
          req.user._id,
          req.body.access_token
        );
        res.json({
          code: "ok",
          fb_products,
        });
      });
    } else {
      res.status(400).json({
        code: 400,
        message: "_ids with at least 1 product _id is required.",
      });
    }
  }
);

app.delete(
  "/api/removeFromFbMarket",
  passport.authenticate("userPrivate"),
  (req, res) => {
    const { _ids } = req.body;
    if (Array.isArray(_ids) && _ids.length > 0) {
      Product.find({
        $or: _ids.map((_id) => ({ _id })),
        user: req.user._id,
      }).then(async (products) => {
        const fb_products = await removeFromFbMarket(
          products,
          req.user.fbMarket.commerceAccount.catalog.id,
          req.user._id,
          req.body.access_token
        );
        res.json({
          code: "ok",
          fb_products,
        });
      });
    } else {
      res.status(400).json({
        code: 400,
        message: "_ids with at least 1 product _id is required.",
      });
    }
  }
);
