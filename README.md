# Wayne 前端插件仓库

存放[Wayne](https://github.com/Qihoo360/wayne)项目前端插件。

## 插件介绍

该插件主要包含三部分

- shared：存放model、client以及一些工具类

- portal：普通用户端界面

- router：管理员管理界面

### 新建插件

- 在shared目录下分别添加model和client

- admin或portal目录下添加相关组件，在index.ts文件中分别定义Routing和Module

- index.ts文件中定义的Routing和Module分别注册到对应的library-routing-XXX.ts和library-XXX.module.ts文件中。
