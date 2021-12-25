## github-jsdelivr-upload

### 简介

这是一个使用免费cdn的webpack插件。

它的原理是将文件上传到github的public仓库中，然后利用jsdelivr生成cdn，并且在合适的webpack生命周期中通过html-webpack-plugin提供的hook，修改页面中link、script标签，更换为jsdelivr中的cdn路径。



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

