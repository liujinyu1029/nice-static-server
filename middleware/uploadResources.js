const router = new require('koa-router')()
const path = require('path')
const fs = require('fs')
const config = require('../config')

const pathHead = 'resources' //资源存放路径 web下的一级路径

// 图片保存 中间件
const fileSaveMid = (ctx)=>{
  let {file,filePath} = ctx.state.fileData || {}
  // 创建可读流
  const reader = fs.createReadStream(file.path)
  // 创建可写流
  let targeFilePath = path.join(__dirname, '../web', pathHead, filePath)
  try{
    let upStream = fs.createWriteStream(targeFilePath)
    // 可读流通过管道写入可写流
    reader.pipe(upStream)
  }catch(e){
    console.log(11,e)
  }
  
  ctx.body = {
    ret: 1,
    data: `${config.origin}:${config.port}/${pathHead}/${filePath}`
  }
}

// 【中间件】在服务器资源中 创建于上传一致的文件夹  
const mkdirSync = (ctx,next) => {
  let {filePath} = ctx.state.fileData || {}
  // 有prefix假名优先用假名 没有假名采用真实路径
  let pathArr = filePath.split('/').slice(0, -1)
  pathArr.forEach((v, i) => {
    let dirPath = pathArr.slice(0, i + 1).join('/')
    // 判断文件夹是否存在 并确定是文件夹
    let targDir = path.join(__dirname, '../web', pathHead, dirPath)
    if (!fs.existsSync(targDir)) {
      // 不存在 则创建文件夹
      fs.mkdirSync(targDir, 0777)
    }
  }) 
  next()
}
// 文件格式鉴定 上传的必须是有格式有后缀的文件
const isValueFile = (ctx,next) => {
  // 获取上传文件
  const file = ctx.request.files.file || {} 
  // 获取上传文件路径
  let filePath = (ctx.req.headers['file-path'] || '').replace(/[\.\/]*/, '') // ../../dist/js/a.js  => dist/js/a.js
  let filePrefixPath = (ctx.req.headers['file-prefix-path'] || '').replace(/[\.\/]*/, '') // ../../dist/js/a.js  => dist/js/a.js
  // 鉴定文件是否为有效格式
  if (!(file.name || '').match(/^.+\..+$/)){
    ctx.body = {
      ret:0,
      error: `该文件有误，缺少文件格式后缀: ${filePath}`
    }
  }else{
    // filePrefix && filePath.replace(targPathOrg, prefix) || ''
    ctx.state.fileData = {
      file,
      filePath: filePrefixPath || filePath || file.name,
    }
    next()
  }  
}

router.post('/upload', isValueFile, mkdirSync, fileSaveMid)


module.exports = router