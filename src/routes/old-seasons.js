const express = require('express');
const router = express.Router();
const db = require(__dirname+'/../modules/db_connect');

const getSolarTerms = async(req) => {
  const output = {
    test: 'test',
    test2: 'test2',
  }

  return output
}

// 列表頁資料
router.get('/', async (req, res)=>{
  const output = await getSolarTerms(req);
  res.json(output);
})

module.exports = router;