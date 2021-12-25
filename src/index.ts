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

class UploadGithub {
  octokit: any
  pluginName: string
  jsDelivrUrl: string
  owner: string
  repo: string
  outputPath: string
  basePath: string | number
  assets: {
    js: string[];
    css: string[];
    uncase: string[]
  }
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
    this.assets = {
      js:[],
      css:[],
      uncase:[]
    }
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
    compiler.hooks.emit.tapAsync(this.pluginName, async (compilation, callback) => {
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
      this.assets = {
        js: [],
        css: [],
        uncase: [] // 意料之外的文件
      }

      files.forEach(f => {
        const sp = f.split('.')
        const ext = sp[sp.length - 1]
        if (this.assets[ext]) {
          this.assets[ext].push(f)
        } else {
          this.assets.uncase.push(f)
        }
      })
      HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync('UploadGithub', (data, cb) => {
        const cdnUrl = `${this.jsDelivrUrl}/${this.owner}/${this.repo}/${this.basePath}`
        const newAssetJson = ['/']
        for(let i in this.assets){
          for(let item of this.assets[i]){
            data.html = data.html.replace(`/${item}`, `${cdnUrl}/${item}`)
            newAssetJson.push(`${cdnUrl}/${item}`)
          }
        }
        data.plugin.assetJson = newAssetJson
        cb(null, data)
      })
      callback();
    })
    compiler.hooks.afterEmit.tapAsync(this.pluginName, async(compilation, callback)=>{
      const outputPath = compilation.compiler.outputPath;
      const githubUploadList = []
      for (let i in this.assets) {
        for (let fileName of this.assets[i]) {
          const filePath = `${outputPath}/${fileName}`
          console.log(filePath)
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