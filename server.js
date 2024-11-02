const express = require('express');
const app = express();

app.set("view engine", "pug");
app.set("views", "./views");

app.get('/', function(req, res) {
  res.render('index');
});

app.post('/submit', async function(req, res) {
  try {
    const username = req.body.username;
    const password = req.body.password;
    const checkbox = req.body.vulnerability;

    if (checkbox) {
      
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error!");
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});