const Koa = new require('koa')
const _static_serve = require('koa-static');
const path = require('path')
const cors = require('koa2-cors'); //应答跨域
const koaBody = require('koa-body');
const uploadResources = require('./middleware/uploadResources')
const app = new Koa()
const {origin,port} = require('./config')

// 放开跨域限制
app.use(cors({
  origin: function (ctx) {
    return "*";
  },
}))

app.use(koaBody({
  multipart: true
}))

// 设置上传文件大小最大限制，默认2M 
// app.use(koaBody({
  // multipart: true,
  // formidable: {
    // maxFileSize: 200 * 1024 * 1024
  // }
// }))

// 【静态资源serve】
app.use(_static_serve(path.join(__dirname) + '/web'))

// 【上传接收】spa打包资源上传 文件夹上传 单个资源上传 
app.use(uploadResources.routes())


app.use(async (ctx, next) => {
  try {
    ctx.error = (code, message) => {
      if (typeof code === 'string') {
        message = code;
        code = 500;
      }
      ctx.throw(code || 500, message || '服务器错误');
    };
    await next();
  } catch (e) {
    let status = e.status || 500;
    let message = e.message || '服务器错误';
    ctx.response.body = {
      status,
      message
    }
  }
})

app.listen(port, () => {
  console.log('start at ' + origin + ':' + port+' | '+`上传路径 ${origin}:${port}/upload`)
})

