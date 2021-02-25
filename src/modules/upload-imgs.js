const multer = require('multer');
const {v4: uuidv4} = require('uuid');

const extMap = {
    'image/jpeg' : '.jpg',
    'image/png' : '.png',
    'image/gif' : '.gif',
}

const storage = multer.diskStorage({
    destination: function(req,file, cb){
        cb(null, __dirname + '/../../public/img');
    },
    filename: function(req,file, cb){
        cb(null, uuidv4() + extMap[file.mimetype])
    },
});

const fileFilter = function (req, file, cb){
    cb(null, !!extMap[file.mimetype])
};

module.exports = multer({storage, fileFilter});
