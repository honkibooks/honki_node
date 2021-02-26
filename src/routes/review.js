const express =require("express");
const { isDate } = require("moment-timezone");
const db = require(__dirname + "/../modules/db_connect");
const moment = require('moment-timezone');
const router = express.Router();


const getMemberList = async(req) =>{
  const output={
    rows:[],
    f_rows:[],
    perPage:6,
    total_rows:0,
    totalPages:0,
    v_rows:[],
  }

  let sql ="";
  const solarterm = req.query.solarterm;
  const search = req.query.search;
  const member_search = req.query.member;

  const solarterm_sql = ` WHERE category = "${solarterm}"`;

  const search_sql = `WHERE booktitle OR category LIKE '%${search}%'`
  
  const member_sql = `WHERE review_nickname LIKE '%${member_search}%' `

  solarterm ? sql += solarterm_sql : sql;
  search ? sql += search_sql : sql;
  member_search ? sql += member_sql : sql;

  output.search = sql 

  //after filter

  const [f_rows] = await db.query("SELECT * FROM `book_review`" + sql + "ORDER BY `sid` DESC")

  f_rows.forEach(item => {
    item.creatdate = moment(item.creatdate).format('YYYY-MM-DD')
  })
 
  output.f_rows = f_rows

  //all reviews
  const [q_rows] = await db.query("SELECT * FROM `book_review` ORDER BY `sid` DESC")

  q_rows.forEach(item => {
    item.creatdate = moment(item.creatdate).format('YYYY-MM-DD')
  })


  output.rows = q_rows

  //all rows
  const [t_rows] = await db.query("SELECT COUNT(1) number FROM `book_review`" + sql)

  output.total_rows = t_rows[0].number
  output.totalPages = Math.ceil(output.total_rows/output.perPage)

  let page = parseInt(req.query.page) || 1;

  if(page < 1){
   output.page = 1
   } else if(page === output.totalPages){
  output.page = output.totalPages
  } else{
  output.page = page
  }
  const [v_rows] = await db.query("SELECT * FROM `book_review`" + sql + "ORDER BY `sid` DESC LIMIT ?, ?", [(output.page-1)* output.perPage, output.perPage]);
  output.v_rows = v_rows
  return output
}


//review list 
router.get('/list', async (req, res)=>{
  const chia_output ={
      perPage: 6,
  };



const [t_rows] = await db.query("SELECT COUNT(1) number FROM `book_review`")

chia_output.totalRows = t_rows[0].number
chia_output.totalPages = Math.ceil(chia_output.totalRows/chia_output.perPage)

let page = parseInt(req.query.page) || 1;
chia_output.page = page

    const [rows] = await db.query("SELECT * FROM `book_review` ORDER BY `sid` DESC LIMIT ?, ?", [(page-1)*chia_output.perPage, chia_output.perPage]);
    rows.forEach(item=>{
      item.creatdate = moment(item.creatdate).format('YYYY-MM-DD')
    })
 chia_output.rows = rows;
 
 res.json(chia_output)
    
})

//review list test second 
router.get('/list_try/:name?', async (req, res)=>{
  const chia_output ={

  }
  const [m_rows] = await db.query("SELECT * FROM `book_review` WHERE `review_nickname` =?",[req.query.name])
  chia_output.merber = m_rows
  const [y_rows] = await db.query("SELECT * FROM `book_review`  ORDER BY `sid` DESC");
  y_rows.forEach(item => {
    item.creatdate = moment(item.creatdate).format('YYYY-MM-DD')
  })

  
  chia_output.rows = y_rows
  res.json(chia_output)




})

//test

router.get('/test', async(req, res)=>{
  const output = await getMemberList(req)
  res.json(output)

})

//add likes

router.post('/content/like', async(req, res)=>{
  const likes_output={
    body:req.body,
    success:false,
    message:""
  };
  
  const reviewlike = req.body.isLike;
  const reviewlikessid = req.body.isNum

  const sql ="INSERT INTO `book_reviewlike`(`likesid`, `good`) VALUES (?,?)";

  const [likes_rows] = await db.query(sql, [reviewlikessid, reviewlike ])

  console.log(likes_rows)

  if (likes_rows.affectedRows === 1) {
    res.json({
      success: true,
      body: req.body
    });
    console.log(likes_rows)
  } else {
    res.json({
      success: false,
      body: req.body
    })
  }
  res.json(likes_output)
  
})



//get likes
router.get('/content/likelike', async(req, res)=>{
  const likesoutput={
  }

  const reviewsql = "SELECT * FROM`book_review` ORDER BY`sid` DESC"

  const [c_rows] = await db.query(reviewsql)

  let sid = []

  c_rows.map((v,i)=>{
    sid.push(v.sid)
  })

  // console.log(sid)

likesoutput.commentsid =sid

  const sql ="SELECT COUNT(1) number FROM `book_reviewlike` INNER JOIN `book_review` ON `book_reviewlike`.`likesid` = `book_review`.`sid`";

  const l_sql ="SELECT * FROM `book_reviewlike` ORDER BY `likesid`"

  const [l_rows]= await db.query(sql)

  const [t_rows] = await db.query(l_sql)

  likesoutput.rows = l_rows
  likesoutput.t_rows = t_rows

  res.json(likesoutput)
})


//post review

router.post('/edit/add', async(req, res)=>{
  const review_output = {
    body:req.body,
    success:false,
    message:""
  };

  const review_nickname = req.body.reviewnickname;
  const booktitle = req.body.reviewbooktitle;
  const category = req.body.reviewcategory;
  const ranking = req.body.reviewRanking;
  const content = req.body.reviewContent;

  //sql language
  const sql ="INSERT INTO `book_review`(`review_nickname`, `category`, `booktitle`, `ranking`, `review`, `creatdate`) VALUES (?,?,?,?,?,NOW())";

  const [review_rows] = await db.query(sql, [review_nickname, category, booktitle, ranking, content]);

  console.log(review_rows)

  if(review_rows.affectedRows === 1){
    res.json({
      success:true,
      body:req.body
    });
    console.log(review_rows)
  }else{
    res.json({
      success:false,
      body:req.body
    })
  }
  res.json(review_output)


  
})

// post comment

router.post('/content/comment', async (req, res)=>{
  const comment_output={
    body: req.body,
    success:false,
    mesage:''
  };

  const commentsid= req.body.commentsid
  const commentname = req.body.commentNickname;
  const comment = req.body.comment;


  const sql = "INSERT INTO `book_review_comments`(`commentsid`, `review_nickname`, `comment`, `writtentime`) VALUES (?,?,?,NOW())"

  const [comment_rows] = await db.query(sql,[commentsid, commentname, comment])

  console.log(comment_rows)

  if (comment_rows.affectedRows === 1) {
    res.json({
      success: true,
      body: req.body
    });
    console.log(comment_rows)
  } else {
    res.json({
      success: false,
      body: req.body
    })
  }
  res.json(comment_output)


})

//get comment data
router.get('/content/getcomment', async (req, res)=>{
  const reviewcomment={
    perPage:6,
  }

  const sql ="SELECT * FROM `book_review` INNER JOIN `book_review_comments` ON `book_review`.`sid` = `book_review_comments`.`commentsid`"

  const[c_rows] = await db.query(sql)
  c_rows.forEach((v,i)=>{
    v.writtentime = moment(v.writtentime).format('YYYY-MM-DD')
  })
  reviewcomment.c_rows = c_rows

  res.json(reviewcomment)

})

// review content

router.get('/list/content', async (req, res)=>{
  const chia_content={

  }
  const [rows] = await db.query("SELECT * FROM `book_review`")
  chia_content.rows = rows
  res.json(chia_content)

})





module.exports = router;