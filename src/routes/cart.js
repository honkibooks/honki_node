const express = require('express');
const router = express.Router();
const db = require(__dirname+'/../modules/db_connect');
const upload = require(__dirname + "/../modules/upload-imgs");

//寫入訂單
router.post('/cartInput/:sid', async (req, res)=>{
    const {order_sid, product_sid, price, quantity, bookname,ISBN,book_id,recipient_name,recipient_phone,recipient_email,recipient_address,recipient_receivedTime,order_number} = req.body;
    const data = {order_sid, product_sid, price, quantity, bookname,ISBN,book_id};
    const data2 = {recipient_name, recipient_phone, recipient_email,recipient_address,recipient_receivedTime,order_number};
    const data3 = {recipient_name, recipient_phone, recipient_email,recipient_address,recipient_receivedTime,order_number}; 
    const [result] = await db.query("INSERT INTO `order_detail` SET ?", [data]);
    const [result2] = await db.query("INSERT INTO `recipient` SET ?", [data2]);
    console.log(result);
    console.log(result2);
    if(result.affectedRows===1){
        res.json({
            success: true,
            body: req.body,
        });
    } else {
        res.json({
            success: false,
            body: req.body,
        });
    }
    if(result2.affectedRows===1){
        res.json({
            success: true,
            body: req.body,
        });
    } else {
        res.json({
            success: false,
            body: req.body,
        });
    }
})

router.post('/cartInput1', upload.none(), async (req, res)=>{
// 1.建立訂單
// 2.把訂單的編號抓過來(這裡你會遇到困難)，塞到cartItems的foreach內
// 3.清除購物車的localstorage

    
    let cartItems = req.body;
    console.log('req.body', req.body)
    console.log('cartItems', cartItems)
    console.log('cartItems.input', cartItems.input)

    // 建立訂單 recipient
    const [result] = await db.query("INSERT INTO `recipient` SET ?", [cartItems.input[0]])
    console.log(result)
    console.log(result.insertId)
    // 把訂單的編號抓過來(這裡你會遇到困難)

    // 建立品項
    cartItems.items.forEach((items, index)=>{
        let order_items = {}
        // order_items.order_sid = 訂單建好後的編號
        order_items.product_sid = items.book_sid
        order_items.quantity = items.amount
        order_items.order_sid = result.insertId
        db.query("INSERT INTO `order_detail` SET ?", [order_items]);
    }) 

    res.json(result.insertId)


    // const {order_sid, product_sid, price, quantity, bookname,ISBN,book_id} = req.body;
    // const data = {order_sid, product_sid, price, quantity, bookname,ISBN,book_id};
    // const [result] = await db.query("INSERT INTO `order_detail` SET ?", [data]);
    // console.log(result);
    // if(result.affectedRows===1){
    //     res.json({
    //         success: true,
    //         body: req.body,
    //     });
    // } else {
    //     res.json({
    //         success: false,
    //         body: req.body,
    //     });
    // }
})


//讀取訂單
router.get('/order_detail/:order_sid', async (req, res)=>{
    const [rows] = await db.query("SELECT * FROM `order_detail` WHERE order_sid=?", [ req.params.order_sid ]);
    res.json(rows)
    // if(rows.length !== 1){
    //     return res.redirect( res.locals.baseUrl + '/cart' );
    // }
    // // rows[0].birthday = moment(rows[0].birthday).format('YYYY-MM-DD');
    // res.render('order_detail', rows[0]);
    // res.json(rows[0])
    // console.log(rows[0]);
    // if(rows[0].affectedRows===1){
    //     res.json({
    //         success: true,
    //         body: req.body,
    //     });
    // } else {
    //     res.json({
    //         success: false,
    //         body: req.body,
    //     });
    // }
})

module.exports = router;