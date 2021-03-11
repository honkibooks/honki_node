const express = require('express');
const router = express.Router();
const db = require(__dirname+'/../modules/db_connect');


const getProductList = async(req)=>{
    // 初始值
    const output ={
        avgPrice:0,
        c_rows:[],
        page:0,
        perPage:16,
        totalRows:0,
        totalPages:0,
        rows:[],
    };
    

    // where 條件系列（分類、搜尋、篩選）-----------
    let sql= "";
    // 分類
    // const category = req.query.category;
    const category = req.params.category;
    // 搜尋（全部、書名、作者、出版社）
    const search = req.query.search;
    const title_search = req.query.title_search;
    const author_search = req.query.author_search;
    const publication_search = req.query.publication_search;
    // 價格區間
    const minPrice = req.query.minPrice;
    const maxPrice = req.query.maxPrice;

    // sql語法
    const category_sql = `AND c.eng_name='${category}'`;

    const search_sql = `AND (p.title LIKE '%${search}%' OR p.title_eng LIKE '%${search}%' OR p.publication LIKE '%${search}%' OR p.author LIKE '%${search}%') `;
    const title_search_sql = `AND (p.title LIKE '%${title_search}%' OR p.title_eng LIKE '%${title_search}%') `;
    const author_search_sql = `AND p.author LIKE '%${author_search}%' `;
    const publication_search_sql = `AND p.publication LIKE '%${publication_search}%' `;

    const price_sql=`AND p.final_price BETWEEN ${minPrice ? minPrice : 0} AND ${maxPrice ? maxPrice : 10000} `;

    // 若query存在，增加該條sql語法
    category ? sql += category_sql: sql; 
    search ? sql += search_sql: sql;
    title_search ? sql += title_search_sql: sql;
    author_search ? sql += author_search_sql: sql;
    publication_search ? sql += publication_search_sql: sql;
    (minPrice || maxPrice) ? sql += price_sql: sql;
    

    // order by 排序系列 -----------
    let sorts_sql = "";
    // 排序
    const sorts = req.query.sorts; 
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
            sorts_sql = ` ORDER BY p.discount ASC `;
            break;
        case 'discountASC':
            sorts_sql = ` ORDER BY p.discount DESC `;
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
            sorts_sql = (minPrice || maxPrice) ?  ` ORDER BY p.final_price ASC ` : ` ORDER BY p.sid DESC `;
    }
    // 得商品平均價格
    const avgPrice = await db.query("SELECT AVG(p.final_price) AS avg FROM book_product p JOIN book_categories c ON p.category_sid = c.category_sid WHERE 1 " + sql )

    output.avgPrice = Math.round(+avgPrice[0][0].avg);
    // 資料總筆數
    const [total_rows] = await db.query("SELECT COUNT(1) num FROM book_product p JOIN book_categories c ON p.category_sid = c.category_sid WHERE 1 " + sql )
    output.totalRows = total_rows[0].num;
    // 分頁處理
    if(output.totalRows > 0){
        output.totalPages = Math.ceil(output.totalRows/output.perPage);

        let page = parseInt(req.query.page) || 1;
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

router.get('/:category', async (req, res)=>{
    const output = await getProductList(req);
    res.json(output);
})

// 商品列表頁資料
router.get('/', async (req, res)=>{
    const output = await getProductList(req);
    res.json(output);
})

// 商品內頁資料
router.get('/book/:sid?',async(req,res)=>{
    const output ={
        detail:[],
        related:[],
        history:[],
    };

    const sql ="SELECT * FROM book_product p JOIN book_categories c ON p.category_sid = c.category_sid WHERE p.sid=? ";
    const [detail_rows] = await db.query(sql,[req.params.sid]);
    output.detail = detail_rows

    const related_sql ="SELECT * FROM book_product p JOIN book_categories c ON p.category_sid = c.category_sid WHERE p.category_sid = ? AND p.sid NOT IN (?) ORDER BY RAND() LIMIT 10 ";
    [related_rows] = await db.query(related_sql, [detail_rows[0].category_sid, req.params.sid]);
    output.related = related_rows

    res.json(output);
})

router.post('/history',async(req,res)=>{
    const output ={
        history:[],
    };
    const data=[...req.body, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    output.recent= [data.slice(0, 10)]

    //  近期瀏覽 選瀏覽紀錄 10本書
    const history_sql =" SELECT * FROM book_product p JOIN book_categories c ON p.category_sid = c.category_sid WHERE p.sid IN (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ORDER BY FIELD(p.sid, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ";
    
    [history_rows] = await db.query(history_sql, [...data.slice(1, 11), ...data.slice(1, 11)]);
    output.history = history_rows

    res.json(output);
})

// 新增 add favorite
router.post('/favorite/addFavorite',async(req, res)=>{
    const sql = "INSERT INTO `book_favorites` (`member_sid`, `favorite_books_sid` ) VALUES (?, ?) "
    const sid = req.body.userId
    const favorite_books_sid = req.body.bookId
    const [{ affectedRows }] = await db.query(sql, [sid, favorite_books_sid]);
    res.json({
        success: !!affectedRows,
        affectedRows
    })  
})
// const sql = "INSERT INTO `book_favorites` (`member_sid`, `favorite_books_sid` ) VALUES (?, ?) ON DUPLICATE KEY UPDATE `favorite_books_sid` = VALUE(`favorite_books_sid`) "


// 移除 remove favorite
router.post('/favorite/removeFavorite',async(req, res)=>{
    const sql = "DELETE FROM `book_favorites` WHERE `member_sid` = ? AND `favorite_books_sid` = ? "
    const sid = req.body.userId
    const favorite_books_sid = req.body.bookId
    const [{ affectedRows }] = await db.query(sql, [sid, favorite_books_sid]);
    res.json({
        success: !!affectedRows,
        affectedRows
    })  
})

// 顯示 favorite books 資料
router.post('/favorite/favoriteList', async(req, res)=>{
    const output ={
        success: false,
        rows:[],
    };
    const sql = "SELECT p.* FROM `book_favorites` f JOIN book_product p ON f.favorite_books_sid = p.sid WHERE f.member_sid=? ORDER BY f.sid DESC ";
    const sid = req.body.userId
    const [row] = await db.query(sql, sid);
    output.rows= row
    if(row) output.success=true
    
    res.json(output)  

})


module.exports = router;