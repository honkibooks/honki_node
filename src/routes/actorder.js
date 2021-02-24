const express = require('express');
const router = express.Router();
const db = require(__dirname + '/../modules/db_connect');

// 活動訂單
router.post('/', async(req, res)=>{
    const output ={
        success: false,
        rows:[],
    };

    const sql = "SELECT `order`.`member_sid`,`order`.`item_id`,`order`.`order_number`,`order_detail`.`bookname` ,`order_detail`.`act_time`,`order_detail`.`price`,`event`.`act_location`,`member`.`name`,`member`.`mobile`,`member`.`email`,`member`.`birthday`,`member`.`gender` FROM ( (`order_detail` INNER JOIN `order` ON `order_detail`.`order_sid`=`order`.`sid`) INNER JOIN `member`ON `member`.`sid` = `order`.`member_sid`)INNER JOIN `event` ON `event`.`act_name` = `order_detail`.`bookname` WHERE `order`.`member_sid`= ? "
    // const sql = "SELECT `order`.`member_sid`,`order`.`item_id`,`order`.`order_number`,`order_detail`.`bookname` ,`order_detail`.`act_time`,`order_detail`.`price`,`event`.`act_location`,`member`.`name`,`member`.`mobile`,`member`.`email`,`member`.`birthday`,`member`.`gender` FROM ( (`order_detail` INNER JOIN `order` ON `order_detail`.`order_sid`=`order`.`sid`) INNER JOIN `member`ON `member`.`sid` = `order`.`member_sid`)INNER JOIN `event` ON `event`.`act_name` = `order_detail`.`bookname`"
    const sid = req.body.userId
    const [rows] = await db.query(sql, sid);
    // const [rows] = await db.query(sql);
    // console.log('post', sql, sid )
    console.log('rows', rows )
    res.json({rows})
});

module.exports = router;