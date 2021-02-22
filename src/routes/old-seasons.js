const express = require('express');
const router = express.Router();
const db = require(__dirname+'/../modules/db_connect');

const getSolarTerms = async(req) => {
  const output = {
    solar_term_list: [],
  }

  const [solarTerms] = await db.query("SELECT * FROM solar_terms ")
  output.solar_term_list = solarTerms;

  return output
}

// 列表頁資料
router.get('/', async (req, res)=>{
  const output = await getSolarTerms(req);
  res.json(output);
})

module.exports = router;