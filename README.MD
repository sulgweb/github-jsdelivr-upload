## github-jsdelivr-upload

### 简介

这是一个使用免费cdn的webpack插件。

它的原理是将文件上传到github的public仓库中，然后利用jsdelivr生成cdn，并且在合适的webpack生命周期中通过html-webpack-plugin提供的hook，修改页面中link、script标签，更换为jsdelivr中的cdn路径。

此外，它还会往页面中插入cdn异常处理代码，原理是通过onerror事件，重新改写你的文件路径，将使用index.html相对路径下的源文件（即部署时，建议不要删除源文件）。



注：使用的html-webpack-plugin为4.x以上。如果版本低于4，则可能需要升级html-webpack-plugin到对应的版本。

- webpack4对应html-webpack-plugin4.x
- webpack5对应html-webpack-plugin5.x



### 用法

```javascript
const UploadGithub = require('github-jsdelivr-upload');


// webpack.config.js
module.exports = {
    plugins:[
        new UploadGithub({
            token: 'your github token',
            owner: 'your github username',
            repo: 'your github repository',
        }),
    ]
}


// vue.config.js
module.exports = {
    configureWebpack:{
        plugins:[
            new UploadGithub({
                token: 'your github token',
                owner: 'your github username',
                repo: 'your github repository',
            }),
        ]
    }
}
```

