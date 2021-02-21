const express = require("express");
const router = express.Router();
const db = require(__dirname + "/../modules/db_connect");
const cors = require("cors");

//CROS-允許所有的
const corsOptions = {
  credentials: true,
  origin: function (origin, callback) {
    console.log("origin:", origin);
    callback(null, true);
  },
};

router.use(cors(corsOptions));
router.use((req, res, next) => {
  res.locals.baseUrl = req.baseUrl;
  res.locals.url = req.url;
  res.locals.sess = req.session;
  next();
});

router.post("/", function (req, res, next) {
  console.log(req.body.test);
});

////////////////////////////////////////////login////////////////////////////////////////////////
// router.get('/login', async (req, res)=>{res.render('login')});

//登入-輸入帳號密碼和後端資料庫核對
router.post("/login", async (req, res) => {
  const [
    rows,
  ] = await db.query("SELECT * FROM member WHERE email=? AND password=?", [
    req.body.email,
    req.body.password,
  ]);

  if (rows.length === 1) {
    // req.session.member = rows[0];
    res.json({
      success: true,
      body: rows[0],
    });
  } else {
    res.json({
      success: false,
    });
  }
});

// 登出-刪除session資料再轉向到login頁面
// router.get("/logout", (req, res) => {
//   localStorage.removeItem("userLogin");
//   res.redirect("/login");
// });

////////////////////////////////////////////register///////////////////////////////////////////
router.post("/register", async (req, res) => {
  const output = {
    body: req.body,
    success: false,
    message: "",
  };

  const name = req.body.name;
  const nickname = req.body.nickname;
  const email = req.body.email;
  const mobile = req.body.mobile;
  const address = req.body.address;
  const birthday = req.body.birthday;
  const password = req.body.password;

  //將新會員註冊資料寫入資料庫
  const sql =
    "INSERT INTO `member`( `name`, `nickname`, `email`, `mobile`, `address`, `birthday`, `password`, `created_at`) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())";

  //顯示資料在頁面上
  const [{ affectedRows }] = await db.query(sql, [
    name,
    nickname,
    email,
    mobile,
    address,
    birthday,
    password,
  ]);

  console.log;
  if (!!affectedRows) {
    output.success = true;
    output.message = "新增成功";
  } else {
    output.message = "新增失敗";
  }

  res.json(output);
});
////////////////////////////////////////////////menu///////////////////////////////////////////

////////////////////////////////////////////////edit//////////////////////////////////////////
// //修改會員個人資料(取資料庫資料)
router.get("/edit/:sid", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM `member` WHERE `sid` = ?", [
    req.params.sid,
  ]);
  // res.json({
  //   success: req.params.sid,
  // });

  if (rows.length === 1) {
    // req.session.member = rows[0];
    res.json({
      success: true,
      body: rows[0],
    });
  } else {
    res.json({
      success: false,
    });
  }
});

// //修改會員個人資料(修改後傳資料回資料庫更新)(Update)
router.post("/edit/:sid", async (req, res) => {
  const output = {
    body: req.body,
    success: false,
    message: "",
  };

  const name = req.body.name;
  const nickname = req.body.nickname;
  // const email = req.body.email;
  const mobile = req.body.mobile;
  const address = req.body.address;
  const birthday = req.body.birthday;
  const password = req.body.password;

  const sql =
    "UPDATE `member` SET `name` = ?, `nickname` = ?, `mobile` = ?, `address` = ?, `birthday` = ? WHERE `member`.`sid` = ?";

  //顯示資料在頁面上
  const [{ affectedRows }] = await db.query(sql, [
    name,
    nickname,
    mobile,
    address,
    birthday,
    req.params.sid,
  ]);

  console.log;
  if (!!affectedRows) {
    output.success = true;
    output.message = "新增成功";
  } else {
    output.message = "新增失敗";
  }

  res.json(output);
});

//變更密碼
// const editPassword = "UPDATE"

//刪除帳號

///////////////////////////////////////////////bookshelf///////////////////////////////////////

module.exports = router;
