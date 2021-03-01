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

//=============login=============
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

//=============register=============
//註冊(資料回傳資料庫)(Create)
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

  try {
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

    if (!!affectedRows) {
      output.success = true;
      output.message = "新增成功";
    } else {
      output.message = "新增失敗";
    }
  } catch (e) {
    output.message = "新增失敗";
  }

  res.json(output);
});
//=============menu=============

//=============edit=============
//修改會員個人資料(取資料庫資料)(Read)
router.get("/edit/:sid", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM `member` WHERE `sid` = ?", [
    req.params.sid,
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

//修改會員個人資料(修改後傳資料回資料庫更新)(Update)
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

  const [rows] = await db.query("SELECT * FROM `member` WHERE `sid` = ?", [
    req.params.sid,
  ]);

  console.log(affectedRows);
  if (!!affectedRows) {
    output.body = rows[0];
    output.success = true;
    output.message = "修改成功";
  } else {
    output.message = "修改失敗";
  }

  res.json(output);
});

//變更密碼(Update)
//將新密碼回傳資料庫
router.post("/editnewpassword", async (req, res) => {
  const output = {
    body: req.body,
    success: false,
    message: "",
  };

  const editNewPassword = req.body.password;
  const sid = req.body.sid;

  const sql = "UPDATE `member` SET `password`=? WHERE `sid`=?";

  const [{ affectedRows }] = await db.query(sql, [editNewPassword, sid]);

  if (!!affectedRows) {
    output.success = true;
    output.message = "更新成功";
  } else {
    output.message = "更新失敗";
  }

  res.json(output);
});

//刪除帳號(Delete)

router.post('/editdeleteaccount', async (req, res) => {
  const output = {
    body: req.body,
    success: false,
    message: "",
  };

  const sid = req.body.sid;
  const editDeleteAccount = req.body.password;

  const sql = "DELETE FROM `member` WHERE `sid`=? AND `password`=?";

  const [{ affectedRows }] = await db.query(sql, [sid, editDeleteAccount]);

  console.log;
  if (!!affectedRows) {
    output.success = true;
    output.message = "刪除成功";
  } else {
    output.message = "刪除失敗";
  }

  res.json(output);
});

//=============bookshelf=============

module.exports = router;
