// import fs from 'fs'
const fs = require('fs')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {
  Octokit
} = require('octokit')

const fileToBase64 = (filePath) => {
  const data = fs.readFileSync(filePath);
  return new Buffer(data).toString("base64")
}

const getAssets = (compilation) => {
  const entrypoints = compilation.entrypoints;
  const entryNames = Array.from(entrypoints.keys());
  let files = []
  for (let i = 0; i < entryNames.length; i++) {
    const entryName = entryNames[i];
    const entryFiles = entrypoints.get(entryName).getFiles();
    files.push(...entryFiles)
  }
  function unique(arr) {
    return arr.filter(function (item, index, arr) {
      return arr.indexOf(item, 0) === index;
    });
  }

  files = unique(files)
  const assets = {
    js: [],
    css: [],
    uncase: [] // 意料之外的文件
  }

  files.forEach(f => {
    const sp = f.split('.')
    const ext = sp[sp.length - 1]
    if (assets[ext]) {
      assets[ext].push(f)
    } else {
      assets.uncase.push(f)
    }
  })
  return assets
}

class UploadGithub {
  octokit: any
  pluginName: string
  jsDelivrUrl: string
  owner: string
  repo: string
  outputPath: string
  basePath: string | number
  constructor(data) {
    const {
      token,
      owner,
      repo
    } = data;
    this.octokit = new Octokit({
      auth: token
    })
    this.pluginName = 'UploadGithub'
    this.jsDelivrUrl = 'https://cdn.jsdelivr.net/gh'
    this.owner = owner
    this.repo = repo
    this.outputPath = ''
    this.basePath = new Date().getTime()
  }

  upload(path, content, message = 'update cdn') {
    return this.octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
      owner: this.owner,
      repo: this.repo,
      path,
      message,
      content
    }).catch(err => {
      console.log(JSON.parse(JSON.stringify(err)))
    })
  }

  apply(compiler) {
    compiler.hooks.compilation.tap(this.pluginName, (compilation) => {
      HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(this.pluginName, async (data, cb) => {
        const assets = getAssets(compilation)
        const cdnUrl = `${this.jsDelivrUrl}/${this.owner}/${this.repo}/${this.basePath}`
        const newAssetJson = ['/']
        const errorFunc = `<script>
          function errorCDN(e) {
            var target = e.getAttribute("data-cdn");
            var tagName = e.tagName
            var cdnDOM = document.createElement(tagName);
            if(tagName === 'SCRIPT'){
              cdnDOM.src = "./" + target;
            }else{
              cdnDOM.href = "./" + target;
            }
            document.head.appendChild(cdnDOM);
            e.remove();
          }
        </script>`
        const dataHtmlList = data.html.toString().split('<head>')
        data.html = dataHtmlList.shift() + '<head>' + errorFunc + dataHtmlList.join('')
        for(let i in assets){
          for(let item of assets[i]){
            const srcReg = new RegExp('src=' + `['|"]` + `/${item}`+ `['|"]`, 'gi')
            const hrefReg = new RegExp('href=' + `['|"]` + `/${item}`+ `['|"]`, 'gi')
            data.html = data.html.replace(srcReg, `src="${cdnUrl}/${item}" data-cdn="${item}" onerror="errorCDN(this)"`)
            data.html = data.html.replace(hrefReg, `href="${cdnUrl}/${item}" data-cdn="${item}" onerror="errorCDN(this)"`)
            newAssetJson.push(`${cdnUrl}/${item}`)
          }
        }
        data.plugin.assetJson = newAssetJson
        cb(null, data)
      })
    })
    compiler.hooks.afterEmit.tapAsync(this.pluginName, async(compilation, callback)=>{
      const assets = getAssets(compilation)
      const outputPath = compilation.compiler.outputPath;
      const githubUploadList = []
      for (let i in assets) {
        for (let fileName of assets[i]) {
          const filePath = `${outputPath}/${fileName}`
          const base64 = fileToBase64(filePath)
          const fileUploadPromise = this.upload(`${this.basePath}/${fileName}`, base64).then(res => {
            console.log(`${fileName} upload success`)
            return res
          }).catch(err => {
            console.log(`${fileName} upload error`)
            return err
          })
          githubUploadList.push(fileUploadPromise)
        }
      }

      await Promise.all(githubUploadList).then(() => {
        console.log('upload github success')
      }).catch(() => {
        console.log('upload github error')
      })

      callback()
    })
  }
}
module.exports = UploadGithub