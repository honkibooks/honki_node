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

  const solarterm_sql = ` WHERE category LIKE "%${solarterm}%"`;

  const search_sql = `WHERE category LIKE '%${search}%' OR booktitle LIKE '%${search}%'`

  
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

 //order by ranking 

  let ordersql ='ORDER BY `sid` DESC '
  const orderranking = req.query.ranking
  const time = req.query.time

  if(orderranking){
    ordersql = 'ORDER BY ranking DESC '
  }

  if(time){
    ordersql ='ORDER BY `creatdate`'
  }

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
  const [v_rows] = await db.query("SELECT * FROM `book_review`" + sql + ordersql + " LIMIT ?, ?", [(output.page-1)* output.perPage, output.perPage]);
  v_rows.forEach(item => {
    item.creatdate = moment(item.creatdate).format('YYYY-MM-DD')
  })


  output.v_rows = v_rows

  //order by date

  const [d_rows] = await db.query("SELECT * FROM `book_review` ORDER BY `creatdate` LIMIT ?, ?", [(output.page - 1) * output.perPage, output.perPage])

  d_rows.forEach(item => {
    item.creatdate = moment(item.creatdate).format('YYYY-MM-DD')
  })

  output.d_rows = d_rows
 

 
  return output
}

//order by ranking
router.get('/rankings', async(req,res)=>{
  const output = {
  
    perPage: 6,
    total_rows: 0,
    totalPages: 0,
   
  }

  const [t_rows] = await db.query("SELECT COUNT(1) number FROM `book_review`")

  output.total_rows = t_rows[0].number
  output.totalPages = Math.ceil(output.total_rows / output.perPage)

  let page = parseInt(req.query.page) || 1;

  if (page < 1) {
    output.page = 1
  } else if (page === output.totalPages) {
    output.page = output.totalPages
  } else {
    output.page = page
  }
  const [r_rows] = await db.query("SELECT * FROM `book_review` ORDER BY `ranking` DESC LIMIT ?, ?", [(output.page - 1) * output.perPage, output.perPage])

  r_rows.forEach(item => {
    item.creatdate = moment(item.creatdate).format('YYYY-MM-DD')
  })

  output.r_rows = r_rows

  res.json(output)
})

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
  const curFace = req.body.curFace;
  const curHair = req.body.curHair;
  const curTerms = req.body.curTerms;
  const curAcc = req.body.curAcc;
  const curCloth = req.body.curCloth;


  // const sql = "INSERT INTO `book_review_comments`(`commentsid`, `review_nickname`, `comment`, `writtentime`) VALUES (?,?,?,NOW())"
  const sql = "INSERT INTO `book_review_comments`(`commentsid`, `review_nickname`, `comment`, `curFace`, `curHair`, `curTerms`, `curAcc`, `curCloth`, `writtentime`) VALUES (?,?,?,?,?,?,?,?,NOW())";

  

  const [comment_rows] = await db.query(sql, [commentsid, commentname, comment, curFace, curHair, curTerms, curAcc, curCloth])

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

//update review

router.put('/list/content/update', async(req, res)=>{
  const chia_content={
    body: req.body,
    success: false,
    message: ""
  }

  const category = req.body.reviewcategory;
  const booktitle = req.body.reviewbooktitle;
  const ranking = req.body.reviewRanking;
  const review = req.body.reviewContent
    const num = req.body.isNum 

  const sql = "UPDATE `book_review` SET`category`=?,`booktitle`=?,`ranking`=?,`review`=? WHERE `sid`=?"
  const [rows] = await db.query(sql, [category, booktitle, ranking, review, num])

  chia_content.rows = rows

  if (rows.affectedRows === 1) {
    res.json({
      success: true,
      body: req.body
    });
    console.log(rows)
  } else {
    res.json({
      success: false,
      body: req.body
    })
  }
  res.json(chia_content)
})

//delete review

router.delete('/list/content/delete/:isNum', async(req, res)=>{
  const chia_output={

  }
  const contentsid = req.params.isNum

  const sql ="DELETE FROM `book_review` WHERE `sid`=?"

  const [rows] = await db.query(sql,[contentsid])

  chia_output.rows = rows
  if (rows.affectedRows === 2) {
    res.json({
      success: true,
      body: req.body
    });
    console.log(rows)
  } else {
    res.json({
      success: false,
      body: req.body
    })
  }
  res.json(chia_output)
}

)
//index event

router.get('/honkiindex/event', async(req, res)=>{
  const honkiindex={
    
  }

  const t_num = "SELECT COUNT(1) number FROM`event` WHERE `act_time` LIKE '%2021-03%'"

  const [t_num_a] = await db.query(t_num)

  honkiindex.num= t_num_a[0].number

  let x = honkiindex.num
honkiindex.x =x 

  let num = 1* Math.floor(Math.random() * x +1)

  honkiindex.o = num
  // let num = 1* Math.floor(Math.random() * x +1)

  // const sql = "SELECT * FROM`event` WHERE `act_time` LIKE '%2021-03%' ORDER BY`act_time` DESC"
  const sql = "SELECT * FROM`event` WHERE `act_time` LIKE '%2021-03%' LIMIT ?, ?"

  const [e_rows] = await db.query(sql,[num,2])
  e_rows.forEach((v)=>{
    v.act_time = moment(v.act_time).format('YYYY-MM-DD')
  })

  honkiindex.e_rows=e_rows

  res.json(honkiindex)

})


//post reply
router.post('/comment/reply', async (req, res)=>{
  const comment_output = {
    body: req.body,
    success: false,
    mesage: ''
  };

  const review_nickname = req.body.reviewnickname
  const reply = req.body.reply;
  const replyid = req.body.replyid;
  const commentid = req.body.commentid;
  const commentnickname = req.body.commentniakname;
  const curFace = req.body.curFace;
  const curHair = req.body.curHair;
  const curTerms = req.body.curTerms;
  const curAcc = req.body.curAcc;
  const curCloth = req.body.curCloth;


  const sql = "INSERT INTO `book_review_comments_reply`(`review_nickname`, `reply`, `replyid`,`curFace`, `curHair`, `curTerms`, `curAcc`, `curCloth`, `commentid`, `commentnickname`, `createtime`) VALUES (?,?,?,?,?,?,?,?,?,?,NOW())"

  const [rows] = await db.query(sql, [review_nickname, reply, replyid, curFace, curHair, curTerms, curAcc, curCloth,commentid, commentnickname])

  comment_output.rows =rows
  console.log(rows)

  if (rows.affectedRows === 1) {
    res.json({
      success: true,
      body: req.body
    });
    console.log(rows)
  } else {
    res.json({
      success: false,
      body: req.body
    })
  }
  res.json(comment_output)
  
})

//get reply
router.get('/comment/reply/content', async(req, res)=>{
  const replycomment = {
 
  }

  // const sql = "SELECT * FROM `book_review_comments` INNER JOIN `book_review_comments_reply` ON `book_review_comments`.`commentsid` = `book_review_comments_reply`.`commentid`"
  const sql = "SELECT * FROM `book_review_comments` INNER JOIN `book_review_comments_reply` ON `book_review_comments`.`sid` = `book_review_comments_reply`.`replyid`"

  const [c_rows] = await db.query(sql)
  c_rows.forEach((v, i) => {
    v.createtime = moment(v.createtime).format('YYYY-MM-DD')
  })
  replycomment.c_rows = c_rows

  res.json(replycomment)
})


module.exports = router;