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

router.get('/',(req, res) => {
    res.send('normal-index測試');
});

const getListData = async (req)=>{
    const perPage = 10;
    const [t_rows] = await db.query("SELECT COUNT(1) num FROM `secondhand_normalchange`");
    const totalRows = t_rows[0].num;
    const totalPages = Math.ceil(totalRows/perPage);

    let page = parseInt(req.query.page) || 1;

    let rows = [];
    if(totalRows > 0) {
        if(page < 1) page=1;
        if(page>totalPages) page=totalPages;
        [rows] = await db.query("SELECT * FROM `secondhand_normalchange` ORDER BY `sid` DESC LIMIT ?, ?",
            [(page-1)* perPage, perPage]);
        rows.forEach(item=>{
            // item.birthday = moment(item.birthday).format('YYYY-MM-DD');
        });
    }
    return {
        perPage,
        totalRows,
        totalPages,
        page,
        rows,
    }
};

//list分頁限筆數(R)
router.get('/api', async(req,res)=>{
    res.json(await getListData(req));
 });

// 其他人在換什麼區域

// app.get('/try-jill',async(req, res)=>{
//     const [rows]= await db.query("SELECT * FROM `secondhand_normalchange` ORDER BY `sid` DESC LIMIT 6")
//     res.json(rows);
//  });

// 抓一般二手書 json格式
// app.get('/',async(req,res)=>{
//     const [rows, fields]=await db.query("SELECT * FROM `secondhand_normalchange`")
//     res.json(rows);
// })




module.exports = router;