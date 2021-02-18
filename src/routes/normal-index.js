const express = require('express');
const router = express.Router();
const db = require(__dirname+'/../modules/db_connect');
const app = express();



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
    const perPage = 10;
    const [t_rows] = await db.query("SELECT COUNT(1) num FROM `secondhand_normalchange`");
    const totalRows = t_rows[0].num;
    const totalPages = Math.ceil(totalRows/perPage);

    let page = parseInt(req.query.page) || 1;

    let rows = [];
    if(totalRows > 0) {
        if(page < 1) page=1;
        if(page>totalPages) page=totalPages;
        [rows] = await db.query("SELECT * FROM `secondhand_normalchange` ORDER BY `c_sid` DESC LIMIT ?, ?",
            [(page-1)* perPage, perPage]);
    
    }
    res.json({
        perPage,
        totalRows,
        totalPages,
        page,
        rows,
    })
});


// add(C)
router.post('/add', async (req, res) => {
    const data = { ...req.body };
    const sql = "INSERT INTO `secondhand_normalchange` set ?";
    const [{ Rows, insertRows }] = await db.query(sql, [data]);

    res.json({
        success: !Rows,
        Rows,
        insertRows
    });
})


// 在POSTMAN用下面JSON資料測試ADD可以進資料庫
// {
//     "ISBN":"9854621359453",
//     "book_name":"測試5號",
//     "book_condition":"5成新",
//     "written_or_not":"有塗改",
//     "member_sid_o":"15",

// }


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




// router.post("/picture-upload", upload2.single("avatar"), async (req, res) => {
//     const output = {
//       success: false,
//       message: "",
//     };
//     console.log("req", req.body.sid);
  
//     sid = req.body.sid;
  
//     const sql = "UPDATE `members` SET `profile_picture`=? WHERE sid=?";
  
//     const [{ affectedRows, changedRows }] = await db.query(sql, [
//       req.file.filename,
//       sid,
//     ]);
  
//     if (!!changedRows) {
//       output.success = true;
//       output.message = "修改成功";
//     } else {
//       output.message = "修改失敗";
//     }
  
//     res.json(output);
//   });



// 抓一般二手書 json格式
// app.get('/',async(req,res)=>{
//     const [rows, fields]=await db.query("SELECT * FROM `secondhand_normalchange`")
//     res.json(rows);
// })




module.exports = router;