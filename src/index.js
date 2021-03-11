require("dotenv").config();

const express = require("express");
const db = require(__dirname + "/modules/db_connect");
const session = require("express-session")
const app = express();
const cors = require("cors");

const multer = require("multer");
// const upload = multer({dest: 'tmp_uploads/'});
const upload = require(__dirname + "/modules/upload-imgs");
// app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static( 'public'));

// AW多session的東西
app.use(session({
  secret: 'sdkjghoif39097894508tyighdsgkgiso',
  saveUninitialized: false,
  resave: false,
  // store: sessionStore,
  cookie: {
      maxAge: 36000000
  }
}));
const corsOptions = {
  credentials: true,
  origin: function(origin, cb){
      console.log('origin:', origin);
      cb(null, true);
  }
}

app.use(cors(corsOptions));

// test 首頁抓二手書隨機資料 json格式
app.get("/", async (req, res) => {
  const [rows, fields] = await db.query(
    "SELECT * FROM `secondhand_randomchange`"
  );
  res.json(rows);
});




//aw區
app.use("/cart", require(__dirname + "/routes/cart"));
//chia區
app.use('/reviews', require(__dirname + "/routes/review.js"));
//hans區
app.use("/old-seasons", require(__dirname + "/routes/old-seasons"));

//jill區
app.use("/normal-index", require(__dirname + "/routes/normal-index"));




//wei區
app.use("/product", require(__dirname + "/routes/product"));
//yen區
app.use("/activity", require(__dirname + "/routes/actindex"));
app.use("/member/actorder", require(__dirname + "/routes/actorder"));
//yu區
app.use("/member", require(__dirname + "/routes/member"));






app.get("/try-db", async (req, res) => {
  const [rows, fields] = await db.query(
    "SELECT * FROM `book_product` ORDER BY `sid` DESC LIMIT 6"
  );
  res.json(rows);
});
// 404 找不到網頁
app.use((req, res) => {
  res.type("text/plain");
  res.status(404).send("404-找不到網頁");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`port: ${port}`);
});