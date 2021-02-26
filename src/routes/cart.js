const express = require('express');
const router = express.Router();
const db = require(__dirname+'/../modules/db_connect');

//寫入訂單
router.post('/cartInput', async (req, res)=>{
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