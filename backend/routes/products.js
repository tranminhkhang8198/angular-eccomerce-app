const express = require("express");
const httpStatus = require("http-status");

const router = express.Router();
const { database } = require("../config/helpers");

/* GET ALL PRODUCTS */
router.get("/", (req, res) => {
  const page =
    req.query.page !== undefined && req.query.page !== 0 ? req.query.page : 1;
  const limit =
    req.query.limit !== undefined && req.query.limit !== 0
      ? req.query.limit
      : 10;

  let startValue, endValue;

  if (page > 0) {
    startValue = page * limit - limit; // 0, 10, 20, 30 ...
    endValue = page * limit;
  } else {
    startValue = 0;
    endValue = 10;
  }

  database
    .table("products as p")
    .join([
      {
        table: "categories as c",
        on: "c.id = p.cat_id",
      },
    ])
    .withFields([
      "c.title as category",
      "p.title as name",
      "p.description",
      "p.price",
      "p.quantity",
      "p.image",
      "p.id",
    ])
    .slice(startValue, endValue)
    .sort({ id: 0.1 })
    .getAll()
    .then((products) => {
      if (products.length > 0) {
        res.status(httpStatus.OK).json({
          count: products.length,
          products,
        });
      } else {
        res.json({
          message: "No products found.",
        });
      }
    });
});

/* GET SINGLE PRODUCT */
router.get("/:id", (req, res) => {
  const productId = req.params.id;

  database
    .table("products as p")
    .join([
      {
        table: "categories as c",
        on: "c.id = p.cat_id",
      },
    ])
    .withFields([
      "c.title as category",
      "p.title as name",
      "p.description",
      "p.price",
      "p.quantity",
      "p.image",
      "p.images",
      "p.id",
    ])
    .filter({ "p.id": productId })
    .get()
    .then((product) => {
      if (product) {
        res.status(httpStatus.OK).json(product);
      } else {
        res.json({
          message: `No product founds with id ${productId}`,
        });
      }
    });
});

/* GET ALL PRODUCTS FROM ONE PARTICULAR CATEGORY */
router.get("/category/:title", (req, res) => {
  // const page =
  //   req.query.page !== undefined && req.query.page !== 0 ? req.query.page : 1;
  // const limit =
  //   req.query.limit !== undefined && req.query.limit !== 0
  //     ? req.query.limit
  //     : 10;

  // let startValue, endValue;

  // if (page > 0) {
  //   startValue = page * limit - limit; // 0, 10, 20, 30 ...
  //   endValue = page * limit;
  // } else {
  //   startValue = 0;
  //   endValue = 10;
  // }

  const catTitle = req.params.title;

  database
    .table("products as p")
    .join([
      {
        table: "categories as c",
        on: `c.id = p.cat_id WHERE c.title LIKE '%${catTitle}%'`,
      },
    ])
    .withFields([
      "c.title as category",
      "p.title as name",
      "p.description",
      "p.price",
      "p.quantity",
      "p.image",
      "p.id",
    ])
    .slice(startValue, endValue)
    .sort({ id: 0.1 })
    .getAll()
    .then((products) => {
      if (products.length > 0) {
        // res.status(httpStatus.OK).json({
        //   count: products.length,
        //   products,
        // });
        res.status(httpStatus.OK).json(products);
      } else {
        res.json({
          message: `No products found from ${catTitle} category`,
        });
      }
    });
});

module.exports = router;
