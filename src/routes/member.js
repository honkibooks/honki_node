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
    });
  } else {
    res.json({
      success: false,
      body: req.body,
    });
  }
});

//登出-刪除session資料再轉向到login頁面
// router.get("/logout", (req, res) => {
//   delete req.session.member;
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
// //修改會員個人資料(取原來資料)
// const editInfoSelect ="SELECT  `name`, `nickname`, `email`, `mobile`, `address`, `birthday`, `password`, `password` FROM `member`";
// //修改會員個人資料(修改後傳資料回資料庫更新)
// const editInfoUpdate ="SELECT  `name`, `nickname`, `email`, `mobile`, `address`, `birthday`, `password`, `password` FROM `member`";

// const editPassword = "UPDATE"

///////////////////////////////////////////////bookshelf///////////////////////////////////////

module.exports = router;
