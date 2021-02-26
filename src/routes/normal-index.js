const express = require('express');
const router = express.Router();
const db = require(__dirname+'/../modules/db_connect');
const app = express();
const upload = require(__dirname + "/../modules/upload-imgs")



// router.get('/',(req, res) => {
//     res.send('normal-index測試');
// });

// router.get("/", async (req, res) => {
//     const [rows, fields] = await db.query(
//       "SELECT * FROM `secondhand_normalchange`"
//     );
//     res.json(rows);
//   });


//抓二手書一般交換資料&筆數頁數計算(R)
  router.get("/", async (req, res)=>{
    // 因為換頁還沒做，所以先perpage100
    const perPage = 100;
    const [t_rows] = await db.query("SELECT COUNT(1) num FROM `secondhand_normalchange`");
    const totalRows = t_rows[0].num;
    const totalPages = Math.ceil(totalRows/perPage);

    // 測試撈會員暱稱(R 這下面不能註解，會壞掉)
    let m_rows = await db.query("SELECT * FROM `secondhand_normalchange` JOIN `member` ON `secondhand_normalchange`.`member_sid_o` = `member`.`sid` ORDER BY `c_sid` DESC ");

    // 我的交換單(R 先用15號會員)

    let mybook_rows = await db.query("SELECT * FROM `secondhand_normalchange` JOIN `book_product` ON `secondhand_normalchange`.`ISBN` = `book_product`.`ISBN` JOIN `member` ON `secondhand_normalchange`.`member_sid_o` = `member`.`sid`  WHERE member_sid_o=15 ORDER BY `c_sid` DESC");

  
    

    let page = parseInt(req.query.page) || 1;

    // 其他人在換什麼(R 目前包括自己)
    let rows = [];
    if(totalRows > 0) {
        if(page < 1) page=1;
        if(page>totalPages) page=totalPages;
        [rows] = await db.query("SELECT * FROM `secondhand_normalchange` JOIN `book_product` ON `secondhand_normalchange`.`ISBN` = `book_product`.`ISBN` JOIN `member` ON `secondhand_normalchange`.`member_sid_o` = `member`.`sid` ORDER BY `c_sid` DESC LIMIT ?, ?",
            [(page-1)* perPage, perPage]);
    
    }



    res.json({
        perPage,
        totalRows,
        totalPages,
        page,
        rows,
        m_rows,
        mybook_rows,
    })
});


//其他人二手書查看按鈕-呈現單筆(R)
router.get('/used-book-detail/:c_sid', async (req, res) => {
  const sql = "SELECT * FROM `secondhand_normalchange` JOIN `member` ON `secondhand_normalchange`.`member_sid_o` = `member`.`sid` WHERE c_sid=?";
  const [results] = await db.query(sql, [req.params.c_sid]);
  // if (!results.length) return res.redirect('/activity/api');

  res.json(results[0]);
})


//我的二手書查看按鈕-呈現單筆(R) 後端ok
router.get('/my-used-book-detail/:c_sid', async (req, res) => {
  const sql = "SELECT * FROM `secondhand_normalchange` JOIN `member` ON `secondhand_normalchange`.`member_sid_o` = `member`.`sid` WHERE c_sid=?";
  const [results] = await db.query(sql, [req.params.c_sid]);
  // if (!results.length) return res.redirect('/activity/api');

  res.json(results[0]);
})



// add(C)
// router.post('/add', async (req, res) => {
//     const data = { ...req.body };
//     const sql = "INSERT INTO `secondhand_normalchange` set ?";
//     const [{ Rows, insertRows }] = await db.query(sql, [data]);

//     res.json({
//         success: !Rows,
//         Rows,
//         insertRows
//     });
// })


// 在POSTMAN用下面JSON資料測試ADD可以進資料庫
// {
//     "ISBN":"9854621359453",
//     "book_name":"測試5號",
//     "book_condition":"5成新",
//     "written_or_not":"有塗改",
//     "member_sid_o":"15",

// }

// add(C)
// router.post('/add', async (req, res) => {
//     const ISBN = req.body.ISBN;
//     const book_name = req.body.book_name;
//     const book_condition = req.body.book_condition;
//     const written_or_not = req.body.written_or_not;
//     const BC_pic1 = req.body.BC_pic1;
//     const member_sid_o = req.body.member_sid_o;
//     const sql = `INSERT INTO \`secondhand_normalchange\`( \`ISBN\`, \`book_name\`, \`book_condition\`, \`written_or_not\`, \`BC_pic1\`, \`member_sid_o\`) VALUES (?,?,?,?,?,15)`;
//     const [{ Rows, insertRows }] = await db.query(sql, [
//         ISBN,
//         book_name,
//         book_condition,
//         written_or_not,
//         BC_pic1,
//         // member_sid_o,
//     ]);

//     res.json({
//         success: !Rows,
//         Rows,
//         insertRows
//     });
// })


//edit(U)
router.post('/edit/:c_sid', async (req, res)=>{
    const data = {...req.body};
    const sql = "UPDATE `secondhand_normalchange` SET ? WHERE `c_sid`=?";
    const [{Rows, changedRows}] = await db.query(sql, [ data, req.params.c_sid ]);

    res.json({
        success: !!changedRows,
        Rows,
        changedRows
    });
});


// delete(D)
router.delete('/delete/:c_sid', async (req, res) => {
    const sql = "DELETE FROM `secondhand_normalchange` WHERE `c_sid`=?";
    const [results] = await db.query(sql, [req.params.c_sid]);
    res.json(results);
})



// Add(含圖片上傳)路由有空再改
router.post("/picture-upload", upload.array("BC_pic1"), async (req, res) => {

    // 抓localstorage的userId，要寫入member_sid_o欄位
    const sid = req.body.userId
    

    const output = {
      success: false,
      message: "",
    };
    console.log("req", req.body.c_sid);
  
    const filenames = [];
    if(req.files && req.files.length){
      req.files.forEach(f=>{
        filenames.push(f.filename)
      })
    }

    const data = {
      ISBN: req.body.ISBN,
      book_name: req.body.book_name,
      book_condition:req.body.book_condition,

      BC_pic1: JSON.stringify(filenames),

      written_or_not:req.body.written_or_not,
      member_sid_o:sid,

      created_at: new Date(),
      modifed_at: new Date(),
    }

    // c_sid = req.body.c_sid;
  
    const sql = "INSERT INTO `secondhand_normalchange` SET ?";

    const [{ changedRows }] = await db.query(sql, [data]);
  
    if (!changedRows) {
      output.success = true;
      output.message = "新增成功";
    } else {
      output.message = "新增失敗";
    }
  
    res.json(output);
  });


  // add(C) 其他人想換什麼-發送交換請求 沒在用，但先不要註解，會crashed
router.post('/other-add', async (req, res) => {
    const c_sid = req.body.c_sid;
    const member_sid = req.body.member_sid;
    const Iwant = req.body.Iwant;
    const member_sid_o = req.body.member_sid_o;
    const sql = `INSERT INTO \`iwant\`( \`c_sid\`, \`member_sid\`, \`Iwant\`, \`member_sid_o\`) VALUES (?,?,?,15)`;
    const [{ Rows, insertRows }] = await db.query(sql, [
      c_sid,
      member_sid,
      Iwant,
      member_sid_o,
    ]);

    res.json({
        success: !Rows,
        Rows,
        insertRows
    });
})








// 隨機交換 edit(U) 寫入抽到的號碼(=修改單子) 功能OK
router.post('/random/:c_sid?', async (req, res)=>{
  // 隨機數字要1到多少就改多少
const p = Math.floor(Math.random() * 100) + 1
//  `status`=1 是交換成功
  const sql = "UPDATE `secondhand_normalchange` SET `Match_c_sid`=?, `status`=1, `member_sid_o`=15 WHERE c_sid=?";
  const [Row] = await db.query(sql, [p, req.params.c_sid]);
  console.log(Row)
  res.json({
      // success: !changedRows,
      Row
  });
});



// 抓一般二手書 json格式
// app.get('/',async(req,res)=>{
//     const [rows, fields]=await db.query("SELECT * FROM `secondhand_normalchange`")
//     res.json(rows);
// })




module.exports = router;