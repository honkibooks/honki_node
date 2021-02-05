const express = require('express');
const router = express.Router();
const db = require(__dirname+'/../modules/db_connect');


router.use((req, res, next)=>{
    res.locals.baseUrl = req.baseUrl;
    res.locals.url = req.url;
    next();
});

const listHandler = async(req)=>{
    const perPage = 16;
    const [t_rows]=await db.query("SELECT COUNT(1) num FROM `book_product` ");
    const totalRows = t_rows[0].num;
    const totalPages = Math.ceil(totalRows/perPage);

    let page=parseInt(req.query.page) || 1;

    let rows=[];
    if(totalRows>0){
        if(page<1)page=1;
        if(page>totalPages) page=totalPages;
        [rows]=await db.query("SELECT * FROM `book_product` ORDER BY `sid` DESC LIMIT ?, ?", [(page-1)* perPage, perPage]);
    }

    return {
        perPage,
        totalRows,
        totalPages,
        page,
        rows,
    }
};


// router.get('/lifestyle',async(req,res)=>{
//     const [rows, fields] = await db.query("SELECT * FROM `book_product` WHERE `category_sid` = 1");
//     res.json(rows);
// }
// )


router.get('/list', async (req, res)=>{
    const output = await listHandler(req);
    res.json(output);
})

module.exports = router;