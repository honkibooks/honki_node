const express = require('express');
const router = express.Router();
const db = require(__dirname + '/../modules/db_connect');



router.get('/', async(req,res)=>{
    const perPage = 16;
    const [t_rows]=await db.query("SELECT COUNT(1) num FROM `event`");
    const totalRows = t_rows[0].num;
    const totalPages = Math.ceil(totalRows/perPage);

    // 排序
    // 分類：講座
    const talk = "SELECT * FROM `event` WHERE `act_class_sid` = 1 ORDER BY `act_sid` DESC";
    // 分類：讀書會
    const book_club = "SELECT * FROM `event` WHERE `act_class_sid` = 1 ORDER BY `act_sid` DESC";
    // 分類：戶外探索
    const outdoor = "SELECT * FROM `event` WHERE `act_class_sid` = 3 ORDER BY `act_sid` DESC";
    // 分類：休閒活動
    const hang_out = "SELECT * FROM `event` WHERE `act_class_sid` = 4 ORDER BY `act_sid` DESC";
    // 分類：活動地區
    const area = "SELECT * FROM `event` WHERE `act_class_sid` = 5 ORDER BY `act_sid` DESC";
    // 分類：節氣推薦
    const recommend = "SELECT * FROM `event` WHERE `act_class_sid` = 6 ORDER BY `act_sid` DESC";
    // 預設
    const all = "SELECT * FROM `event` ORDER BY `event`.`act_sid` DESC LIMIT ?, ?"

    let selectClass = "";
    const changeClass = req.query.changeClass;
    switch(changeClass){
        case 'talk':
            selectClass = talk;
            break;
        case 'book_club':
            selectClass = book_club;
            break;
        case 'outdoor':
            selectClass = outdoor;
            break;
        case 'hang_out':
            selectClass = hang_out;
            break;
        case 'area':
            selectClass = area;
            break;
        case 'recommend':
            selectClass = recommend;
            break;
        default:
            selectClass = all;
    }
    console.log(selectClass)

    // 取得總活動列表
    // 如果query沒有頁數，就用1
    let rows = [];
    let page = parseInt(req.query.page) || 1;
    if(totalRows>0){
    if (page<1) page = 1;
    if (page>totalPages) page = totalPages;
    [rows]=await db.query(selectClass, [(page-1)*perPage, perPage]);
    }

    res.json({
        perPage,
        totalRows,
        totalPages,
        page,
        rows,
    });
});

router.get('/event/:sid?', async (req, res)=>{
    const [rows] = await db.query("SELECT * FROM `event` WHERE `act_sid` = ?", [req.params.sid]);
    res.json(rows);
})


module.exports = router;
