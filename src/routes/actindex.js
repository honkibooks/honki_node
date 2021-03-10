const express = require('express');
const router = express.Router();
const db = require(__dirname + '/../modules/db_connect');

// 熱門活動
router.get('/hot', async(req, res)=>{
    const sql_hot_l = "SELECT * FROM `event` WHERE `act_sid` IN ("
    const sql_hot_r = ") ORDER BY `act_sid` DESC"

    // 宣告亂數的function
    function getRandom(x){
        return Math.floor(Math.random()*x)+1;
    };
    // 首先我們先宣告一個字串，用來裝要回傳的結果
    let status = "";
    // 再來寫產生號碼的function
    function getPowerNum(){
        // 宣告一個變數用來裝隨機產生的數字
        let n = 0;
        // 卡片有6個所以我們讓迴圈跑六次
        for(i=0;i<=5;i++){
            // 用indexOf判斷該數字之前有沒有出現過
            n = getRandom(154);
            if(status.indexOf(n)>0){
            // 如果有出現過就重跑一次迴圈
            i-=1;
            continue;
            }
            else{
            // 沒出現過的話就寫進字串裡
            status += n + ',';
            };
        };
    };

    getPowerNum();
    
    // console.log(status.slice(0,-1))

    let rows = [];
    [rows] = await db.query(sql_hot_l + status.slice(0,-1) + sql_hot_r);
    
    res.json({rows})
    // console.log(rows)
})

// 最新活動
router.get('/new', async(req, res)=>{
    // 北部地區
    const north = "SELECT * FROM `event` WHERE `act_city_sid` <= 7 AND `act_city_sid` !=4 ORDER BY `act_sid` DESC limit 2"
    // 中部地區
    const medium = "SELECT * FROM `event` WHERE `act_city_sid` IN (8,9,10,11,14) ORDER BY `act_sid` DESC limit 2"
    // 南部地區
    const south = "SELECT * FROM `event` WHERE `act_city_sid` IN (12,13,15,16,17,22) ORDER BY `act_sid` DESC limit 2"
    // 東部地區
    const east = "SELECT * FROM `event` WHERE `act_city_sid` IN (4,18,19) ORDER BY `act_sid` DESC limit 2"

    let selectCity = "";
    const changeCity = req.query.changeCity;
    switch(changeCity){
        case 'north':
            selectCity = north;
            break;
        case 'medium':
            selectCity = medium;
            break;
        case 'south':
            selectCity = south;
            break;
        case 'east':
            selectCity = east;
            break;
        default:
            selectCity = north;
    }
    // console.log(selectCity)

    let rows = [];
    [rows]=await db.query(selectCity);
    
    res.json({rows})
})

// 總活動列表
router.get('/', async(req, res)=>{
    // 分類：講座
    const talk = "SELECT * FROM `event` WHERE `act_class_sid` = 1 ORDER BY `act_sid` DESC LIMIT ?, ?";
    // 講座活動總數
    const [talkRows]=await db.query("SELECT COUNT(1) num FROM `event` WHERE `act_class_sid` = 1");
    const talkRowsNum = talkRows[0].num;
    
    // 分類：讀書會
    const book_club = "SELECT * FROM `event` WHERE `act_class_sid` = 2 ORDER BY `act_sid` DESC LIMIT ?, ?";
    // 讀書會活動總數
    const [bookClubRows]=await db.query("SELECT COUNT(1) num FROM `event` WHERE `act_class_sid` = 2");
    const bookClubRowsNum = bookClubRows[0].num;
    
    // 分類：戶外探索
    const outdoor = "SELECT * FROM `event` WHERE `act_class_sid` = 3 ORDER BY `act_sid` DESC LIMIT ?, ?";
    // 戶外探索活動總數
    const [outdoorRows]=await db.query("SELECT COUNT(1) num FROM `event` WHERE `act_class_sid` = 3");
    const outdoorRowsNum = outdoorRows[0].num;

    // 分類：休閒活動
    const hang_out = "SELECT * FROM `event` WHERE `act_class_sid` = 4 ORDER BY `act_sid` DESC LIMIT ?, ?";
    // 休閒活動活動總數
    const [hangOutRows]=await db.query("SELECT COUNT(1) num FROM `event` WHERE `act_class_sid` = 4");
    const hangOutRowsNum = hangOutRows[0].num;
    
    // 分類：活動地區
    const area = "SELECT * FROM `event` WHERE `act_sid` ORDER BY `act_city_sid` ASC LIMIT ?, ?";
    
    // 分類：節氣推薦
    const recommend = "SELECT * FROM `event` WHERE `act_class_sid` = 6 ORDER BY `act_sid` DESC LIMIT ?, ?";
    // 節氣推薦活動總數
    const [recommendRows]=await db.query("SELECT COUNT(1) num FROM `event` WHERE `act_class_sid` = 6");
    const recommendRowsNum = recommendRows[0].num;
    
    // 預設
    const all = "SELECT * FROM `event` ORDER BY `event`.`act_sid` DESC LIMIT ?, ?"
    
    // 總活動數量
    const [t_rows]=await db.query("SELECT COUNT(1) num FROM `event`");
    let totalRows = t_rows[0].num;

    // 活動排序
    let selectClass = "";
    const changeClass = req.query.changeClass;
    switch(changeClass){
        case 'talk':
            selectClass = talk;
            totalRows = talkRowsNum;
            break;
        case 'book_club':
            selectClass = book_club;
            totalRows = bookClubRowsNum;
            break;
        case 'outdoor':
            selectClass = outdoor;
            totalRows = outdoorRowsNum;
            break;
        case 'hang_out':
            selectClass = hang_out;
            totalRows = hangOutRowsNum;
            break;
        case 'area':
            selectClass = area;
            break;
        case 'recommend':
            selectClass = recommend;
            totalRows= recommendRowsNum;
            break;
        default:
            selectClass = all;
    }
    console.log(selectClass)



    // 每頁顯示16個
    const perPage = 16;
    
    // 總頁數
    const totalPages = Math.ceil(totalRows/perPage);
    
    let rows = [];

    // 如果query沒有頁數，就用1
    let page = parseInt(req.query.page) || 1;
    
    if(totalRows>0){
    if (page<1) page = 1;
    if (page>totalPages) page = totalPages;
    [rows] = await db.query(selectClass, [(page-1)*perPage, perPage]);
    }

    res.json({
        perPage,
        totalRows,
        totalPages,
        page,
        rows,
    });
});

// 詳細活動內容頁面
router.get('/event/:sid?', async (req, res)=>{
    const [rows] = await db.query("SELECT * FROM `event` WHERE `act_sid` = ?", [req.params.sid]);
    res.json(rows);
})


module.exports = router;
