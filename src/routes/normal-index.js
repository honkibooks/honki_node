const express = require('express');
const router = express.Router();
const db = require(__dirname+'/../modules/db_connect');
const app = express();

// router.use((req, res, next)=>{
//     if(!req.session.admin){
//         return res.redirect('/');
//     }
//     res.locals.baseUrl = req.baseUrl;
//     res.locals.url = req.url;
//     next();
// });

// router.get('/',(req, res) => {
//     res.send('normal-index測試');
// });

// router.get("/", async (req, res) => {
//     const [rows, fields] = await db.query(
//       "SELECT * FROM `secondhand_normalchange`"
//     );
//     res.json(rows);
//   });


//抓二手書一般交換資料&筆樹頁數計算
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





// 抓一般二手書 json格式
// app.get('/',async(req,res)=>{
//     const [rows, fields]=await db.query("SELECT * FROM `secondhand_normalchange`")
//     res.json(rows);
// })




module.exports = router;