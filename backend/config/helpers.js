const bcrypt = require("bcrypt");
const MySqli = require("mysqli");

let conn = new MySqli({
  host: "localhost",
  post: 3306,
  user: "root",
  passwd: "T3V#9@5g",
  db: "mega_shop",
});

let db = conn.emit(false, "");

const secret = "1SBz93MsqTs7KgwARcB0I0ihpILIjk3w";

module.exports = {
  database: db,
  secret,
  validJWTNeeded: (req, res, next) => {
    if (req.headers["authorization"]) {
      try {
        let authorization = req.headers["authorization"].split(" ");
        if (authorization[0] !== "Bearer") {
          return res.status(401).send();
        } else {
          req.jwt = jwt.verify(authorization[1], secret);
          return next();
        }
      } catch (err) {
        return res.status(403).send("Authentication failed");
      }
    } else {
      return res.status(401).send("No authorization header found.");
    }
  },
  hasAuthFields: (req, res, next) => {
    let errors = [];

    if (req.body) {
      if (!req.body.email) {
        errors.push("Missing email field");
      }
      if (!req.body.password) {
        errors.push("Missing password field");
      }

      if (errors.length) {
        return res.status(400).send({ errors: errors.join(", ") });
      } else {
        return next();
      }
    } else {
      return res
        .status(400)
        .send({ errors: "Missing email and password fields" });
    }
  },
  isPasswordAndUserMatch: async (req, res, next) => {
    const myPlaintextPassword = req.body.password;
    const myEmail = req.body.email;

    const user = await db
      .table("users")
      .filter({ $or: [{ email: myEmail }, { username: myEmail }] })
      .get();
    if (user) {
      console.log(user);
      // const testHash = bcrypt.hash("123456", 12).then((hash) => {
      //   console.log(hash);
      // });

      const match = await bcrypt.compare(myPlaintextPassword, user.password);

      if (match) {
        req.username = user.username;
        req.email = user.email;
        req.fname = user.fname;
        req.lname = user.lname;
        req.photoUrl = user.photoUrl;
        req.userId = user.id;
        next();
      } else {
        res.status(401).send("Username or password incorrect");
      }
    } else {
      res.status(401).send("Username or password incorrect");
    }
  },
};
