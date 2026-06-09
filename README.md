# 小鱼钓猫猫 AI 提示词收录

一个本地优先的 Chrome / Edge 浏览器扩展，用来收藏、搜索、编辑、复制和管理 AI 提示词模板。

项目无需后端、无需账号、无需数据库。所有提示词数据默认保存在浏览器扩展本地存储中，适合个人提示词库、团队内部模板库、跨境电商视觉提示词整理等场景。

## 功能

- 快速搜索提示词标题、分类、标签和正文
- 按分类筛选：电商、产品、品牌、视频、海报
- 收藏常用提示词
- 新增、编辑、删除提示词模板
- 一键复制提示词内容
- JSON 导入 / 导出，方便备份和迁移
- Manifest V3，支持 Chrome 和 Microsoft Edge
- 本地运行，不依赖云服务

## 直接安装使用

1. 下载或克隆本项目。
2. 打开 Chrome 或 Edge 的扩展管理页面：
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
3. 打开右上角的“开发者模式”。
4. 点击“加载已解压的扩展程序”。
5. 选择本项目文件夹。
6. 点击浏览器工具栏中的扩展图标即可使用。

## 文件结构

```text
.
├── manifest.json
├── popup.html
├── popup.css
├── popup.js
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── README.md
├── LICENSE
└── .gitignore
```

## 本地预览

如果只想预览弹窗页面，可以在项目目录运行任意静态服务器，例如：

```bash
npx vite --host 127.0.0.1 --port 4173
```

然后打开：

```text
http://127.0.0.1:4173/popup.html
```

## 数据说明

扩展会把提示词数据保存到：

- Chrome 扩展环境：`chrome.storage.local`
- 普通网页预览环境：`localStorage`

导出的 JSON 可以重新导入，也可以迁移到其他浏览器。

## 开发说明

这是一个纯前端浏览器扩展项目，没有构建步骤。

修改后可直接在扩展管理页面点击“重新加载”查看效果。

## 许可证

MIT License
