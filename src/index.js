require("dotenv").config();

const express = require("express");
const db = require(__dirname + "/modules/db_connect");

const app = express();
const cors = require("cors");

const multer = require("multer");
// const upload = multer({dest: 'tmp_uploads/'});
const upload = require(__dirname + "/modules/upload-imgs");
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

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

//hans區
app.use("/old-seasons", require(__dirname + "/routes/old-seasons"));

//jill區
app.use("/normal-index", require(__dirname + "/routes/normal-index"));

app.post("/jill-try-upload", upload.single("BC_pic1"), (req, res) => {
  res.json({
    file: req.file,
    body: req.body,
  });
});

app.post("/jill-try-upload2", upload.array("BC_pic1"), (req, res) => {
  res.json(req.files);
});

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
