// 上传单个文件的中间件 
// 主要处理 图片jpg、文档txt、pdf等
var router = new require('koa-router')();
const multer = require('koa-multer'); //文件上传
const port = require('../config').port
const pathHead = 'file' //资源存放路径 web下的一级路径
//配置
var storage = multer.diskStorage({
    //文件保存路径
    destination: function (req, file, cb) {
        cb(null, './web/' + pathHead)
    },
    //修改文件名称
    filename: function (req, file, cb) {
        // var fileFormat = (file.originalname).split(".");
        // cb(null, Date.now() + "." + fileFormat[fileFormat.length - 1]);
        cb(null, file.originalname);
    }
})
//加载配置
var upload = multer({
    storage: storage
});
//路由
router.post('/uploadFile', upload.single('file'), async (ctx, next) => {
    ctx.body = {
        ret: 1,
        fileUrl: `http://localhost:${port}/${pathHead}/${ctx.request.files.file.name}`,
        filename: ctx.request.files.file.name //返回文件名
    }
})

module.exports = router