const express = require("express");
const app = express();
const db = require("./db");
require("dotenv").config();

app.set("view engine", "pug");
app.set("views", "./views");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", function (req, res) {
  res.render("index", { siteKey: process.env.SITE_KEY });
});

app.post("/submit", async function (req, res) {
  try {
    const name = req.body.name;
    const password = req.body.password;
    const checkbox = req.body.vulnerability;
    console.log(
      `name = ${name}, passoword = ${password}, checkbox = ${checkbox}`
    );
    if (checkbox) {
      const result = await db.query(
        `select * from medical where name = '${name}' and password = '${password}'`
      );
      res.send(result.rows);
    } else {
      if (typeof name != "string" || typeof password != "string") {
        res.send("Invalid parameters!");
        res.end();
        return;
      }
      const result = await db.query(
        `select * from medical where name = $1 and password = $2`,
        [name, password]
      );
      res.send(result.rows);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error!");
  }
});

app.post("/login", async (req, res) => {
  try {
    const {
      username,
      password,
      vulnerability,
      "g-recaptcha-response": recaptchaResponse,
    } = req.body;

    if (!recaptchaResponse) {
      return res.status(400).send("Please complete the CAPTCHA");
    }

    const captchaVerificationUrl = `https://www.google.com/recaptcha/api/siteverify`;
    
    const response = await fetch(captchaVerificationUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `secret=${process.env.SECRET_KEY}&response=${recaptchaResponse}`,
    });

    const data = await response.json();

    if (!data.success) {
      return res.status(400).send("CAPTCHA verification failed. Please try again.");
    }

    if (vulnerability) {
      await db.query(
        `update users set password = $1 where username = 'user1'`,
        [process.env.UNSECURE_PASSWORD]
      );
    } else {
      await db.query(
        `update users set password = $1 where username = 'user1'`,
        [process.env.SECURE_PASSWORD]
      );
    }

    if (typeof username !== "string" || typeof password !== "string") {
      return res.status(400).send("Invalid parameters!");
    }

    const result = await db.query(
      `select * from users where username = $1 and password = $2`,
      [username, password]
    );

    if (result.rowCount === 0) {
      return res.status(401).send("Incorrect username or password!");
    }

    res.send("Login successful");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Server error during verification.");
  }
});

const port = process.env.SERVER_PORT;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
