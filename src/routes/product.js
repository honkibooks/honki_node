const express = require('express');
const router = express.Router();
const db = require(__dirname+'/../modules/db_connect');


const getProductList = async(req)=>{
    // 初始值
    const output ={
        c_rows:[],
        page:0,
        perPage:16,
        totalRows:0,
        totalPages:0,
        rows:[],
        pages:[]
    };

    // output sql
    let sql= "";
    let sorts_sql = "";
    
    // 分類
    const category = req.query.category;
    // 搜尋
    const search = req.query.search;
    // 排序
    const sorts = req.query.sorts; 

    const category_sql = `AND c.category_sid=`+category;
    const search_sql = `AND p.title LIKE '%${search}%' OR p.title_eng LIKE '%${search}%' OR p.publication LIKE '%${search}%' OR p.author LIKE '%${search}%' `;

    category ? sql += category_sql: sql; 
    search ? sql += search_sql:sql
    
    switch(sorts){
        // final_price 價格排序
        case 'priceDESC':
            sorts_sql = ` ORDER BY p.final_price DESC `;
            break;
        case 'priceASC':
            sorts_sql = ` ORDER BY p.final_price ASC `;
            break;
        // discount 折數排序
        case 'discountDESC':
            sorts_sql = ` ORDER BY p.discount DESC `;
            break;
        case 'discountASC':
            sorts_sql = ` ORDER BY p.discount ASC `;
            break;
        // pub_year 出版年份排序
        case 'pubyearDESC':
            sorts_sql = ` ORDER BY p.pub_year DESC `;
            break;
        case 'pubyearASC':
            sorts_sql = ` ORDER BY p.pub_year ASC `;
            break;
        // stars 星等排序
        case 'starsDESC':
            sorts_sql = ` ORDER BY p.stars DESC `;
            break;
        case 'starsASC':
            sorts_sql = ` ORDER BY p.stars ASC `;
            break;
        // 預設
        default:
            sorts_sql = ` ORDER BY p.created_at DESC `;
    }

    const [total_rows] = await db.query("SELECT COUNT(1) num FROM book_product p JOIN book_categories c ON p.category_sid = c.category_sid WHERE 1 " + sql )
    output.totalRows = total_rows[0].num;

    if(output.totalRows > 0){
        output.totalPages = Math.ceil(output.totalRows/output.perPage);

        let page=parseInt(req.query.page) || 1;
        if (page < 1 ) {
            output.page = 1
        } else if(page>output.totalPages){
             output.page = output.totalPages;
        } else {
            output.page = page;
        }
        [output.rows]=await db.query("SELECT * FROM book_product p JOIN book_categories c ON p.category_sid = c.category_sid WHERE 1 " + sql + sorts_sql + " LIMIT ?, ?", [(output.page-1)* output.perPage, output.perPage]);
    }
    const [category_rows] = await db.query("SELECT * FROM book_categories ")
    output.c_rows = category_rows;

    return output
};


// 列表頁資料
router.get('/', async (req, res)=>{
    const output = await getProductList(req);
    res.json(output);
})

// 商品內頁資料
router.get('/:sid?',async(req,res)=>{
    const sql ="SELECT * FROM book_product p JOIN book_categories c ON p.category_sid = c.category_sid WHERE p.sid=?";
    const [output] =await db.query(sql,[req.params.sid]);
    res.json(output[0]);
})

module.exports = router;