const express = require("express");
const router = express.Router();
const db = require(__dirname + "/../modules/db_connect");

const getSolarTerms = async (req) => {
  const output = {
    solar_term_list: [],
    solar_term_books: [],
    current_solar_term_id: [],
  };

  const [solarTerms] = await db.query("SELECT * FROM solar_terms ");
  output.solar_term_list = solarTerms;

  const [solarTermsBooks] = await db.query(
    "SELECT solar_term_books.sid as st_sid, solar_term_books.year, solar_term_books.solar_term_id, solar_term_books.this_year_happened, solar_term_books.why_this_book, solar_term_books.related_link, book_product.sid as book_sid, book_product.book_pics, book_product.title, book_product.book_overview, book_product.ISBN, book_product.final_price FROM solar_term_books INNER JOIN book_product ON solar_term_books.book_id=book_product.sid WHERE solar_term_books.visible=1"
  );
  output.solar_term_books = solarTermsBooks;

  const [currentSolarTermID] = await db.query(
    "SELECT solar_term_books.sid as st_sid, solar_term_books.year, solar_term_books.solar_term_id, book_product.sid as book_sid, book_product.book_pics, book_product.title FROM solar_term_books INNER JOIN book_product ON solar_term_books.book_id=book_product.sid WHERE solar_term_books.visible=1 AND solar_term_books.year > NOW()"
  );

  output.current_solar_term_id = currentSolarTermID;

  return output;
};

// 列表頁資料
router.get("/", async (req, res) => {
  const output = await getSolarTerms(req);
  res.json(output);
});

module.exports = router;
