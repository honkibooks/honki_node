require('dotenv').config();

const express = require('express');
const db = require(__dirname + '/modules/db_connect');

const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.urlencoded({extended:false}));
app.use(express.json());


// test 首頁抓二手書隨機資料 json格式
app.get('/',async(req,res)=>{
    const [rows, fields]=await db.query("SELECT * FROM `secondhand_randomchange`")
    res.json(rows);
})

//aw區

//chia區

//hans區

//jill區

//wei區
app.use('/product',require(__dirname + '/routes/product'));
//yen區

//yu區


app.get('/try-db', async(req, res)=>{
    const [rows, fields] = await db.query("SELECT * FROM `book_product` ORDER BY `sid` DESC LIMIT 6");
    res.json(rows);
})
// 404 找不到網頁
app.use((req,res)=>{
    res.type('text/plain');
    res.status(404).send('404-找不到網頁')
})

const port = process.env.PORT || 3000;
app.listen(port, ()=>{
    console.log(`port: ${port}`)
})