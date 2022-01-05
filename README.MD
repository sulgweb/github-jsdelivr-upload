## github-jsdelivr-upload

### 简介

这是一个使用`免费cdn`的`webpack插件`。

它的原理是将文件上传到`github`的public仓库中，然后通过不同的服务生成对应的`cdn`链接，并且在合适的webpack生命周期中通过`html-webpack-plugin`提供的hook，修改页面中link、script标签，更换为cdn提供的链接。目前支持`jsdelivr`和`staticaly`两种cdn，默认为`jsdelivr`。

此外，它还会往页面中插入`cdn异常处理`代码，原理是通过`onerror`事件，重新改写你的文件路径，将使用index.html相对路径下的源文件（即部署时，建议不要删除源文件）。



注：使用的html-webpack-plugin为`4.x`以上。如果版本低于4，则可能需要升级html-webpack-plugin到对应的版本。

- `webpack4`对应html-webpack-plugin4.x
- `webpack5`对应html-webpack-plugin5.x



**ps：建议不要使用自己常用的github账号作为cdn的存储仓库，该插件会使用的github中提供给的token，拥有该tonken的用户则可以通过相关的api修改你的github中的内容。**



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
            cdnType: 'jsDelivr' // staticaly、jsDelivr, 默认为：jsDelivr
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

// craco.config.js
module.exports = {
    webpack:{
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

