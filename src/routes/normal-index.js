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
    const perPage = 15;
    const [t_rows] = await db.query("SELECT COUNT(1) num FROM `secondhand_normalchange`");
    const totalRows = t_rows[0].num;
    const totalPages = Math.ceil(totalRows/perPage);

    // 測試撈會員暱稱(在學校電腦撈要DESC在家要照原排序???BUG待解)
    let m_rows = await db.query("SELECT * FROM `secondhand_normalchange` JOIN `member` ON `secondhand_normalchange`.`member_sid_o` = `member`.`sid` ORDER BY `c_sid` DESC ");

    // 我的交換單(先用15號會員)

    let mybook_rows = await db.query("SELECT * FROM `secondhand_normalchange` WHERE member_sid_o=15 ORDER BY `c_sid` DESC ");

    let page = parseInt(req.query.page) || 1;

    // 其他人在換什麼(目前包括自己)
    let rows = [];
    if(totalRows > 0) {
        if(page < 1) page=1;
        if(page>totalPages) page=totalPages;
        [rows] = await db.query("SELECT * FROM `secondhand_normalchange` JOIN `book_product` ON `secondhand_normalchange`.`ISBN` = `book_product`.`ISBN` ORDER BY `c_sid` DESC LIMIT ?, ?",
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


//其他人二手書呈現單筆(R)
router.get('/usedbookdetail/:c_sid', async (req, res) => {
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
router.post('/add', async (req, res) => {
    const ISBN = req.body.ISBN;
    const book_name = req.body.book_name;
    const book_condition = req.body.book_condition;
    const written_or_not = req.body.written_or_not;
    const BC_pic1 = req.body.BC_pic1;
    const member_sid_o = req.body.member_sid_o;
    const sql = `INSERT INTO \`secondhand_normalchange\`( \`ISBN\`, \`book_name\`, \`book_condition\`, \`written_or_not\`, \`BC_pic1\`, \`member_sid_o\`) VALUES (?,?,?,?,?,15)`;
    const [{ Rows, insertRows }] = await db.query(sql, [
        ISBN,
        book_name,
        book_condition,
        written_or_not,
        member_sid_o,
        BC_pic1,

    ]);

    res.json({
        success: !Rows,
        Rows,
        insertRows
    });
})


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



// 圖片上傳
router.post("/picture-upload", upload.array("BC_pic1"), async (req, res) => {
    const output = {
      success: false,
      message: "",
    };
    console.log("req", req.body.c_sid);
  
    c_sid = req.body.c_sid;
  
    const sql = "UPDATE `secondhand_normalchange` SET `BC_pic1`=? WHERE c_sid=?";
  
    const [{ Rows, changedRows }] = await db.query(sql, [
      req.files.filename,
      c_sid,
    ]);
  
    if (!changedRows) {
      output.success = true;
      output.message = "修改成功";
    } else {
      output.message = "修改失敗";
    }
  
    res.json(output);
  });



// 抓一般二手書 json格式
// app.get('/',async(req,res)=>{
//     const [rows, fields]=await db.query("SELECT * FROM `secondhand_normalchange`")
//     res.json(rows);
// })




module.exports = router;