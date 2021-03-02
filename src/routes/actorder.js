const express = require('express');
const router = express.Router();
const db = require(__dirname + '/../modules/db_connect');

// 活動訂單
router.post('/', async(req, res)=>{
    const sql = "SELECT `order`.`sid`,`order_detail`.`order_sid`,`order`.`member_sid`,`order`.`item_id`,`order`.`order_number`,`order_detail`.`bookname` ,`order_detail`.`act_time`,`order_detail`.`price`,`event`.`act_location`,`member`.`name`,`member`.`mobile`,`member`.`email`,`member`.`birthday`,`member`.`gender` FROM ( (`order_detail` INNER JOIN `order` ON `order_detail`.`order_sid`=`order`.`sid`) INNER JOIN `member`ON `member`.`sid` = `order`.`member_sid`)INNER JOIN `event` ON `event`.`act_name` = `order_detail`.`bookname` WHERE `order`.`member_sid`= ? ORDER BY `order`.`order_number` DESC"

    const sid = req.body.userId
    const [rows] = await db.query(sql, sid);

    // console.log('post', sql, sid )
    // console.log('rows', rows )

    res.json({rows})
});

// 刪除報名
router.delete('/:sid', async(req, res)=>{
    const sql = "DELETE `order`, `order_detail` FROM `order`,`order_detail` WHERE `order`.`sid`=? AND`order_detail`.`order_sid`=?"

    const [result] = await db.query(sql, [req.params.sid, req.params.sid]);

    console.log('result', result)
    res.json({
        success: result.affectedRows === 2
    })
});

module.exports = router;