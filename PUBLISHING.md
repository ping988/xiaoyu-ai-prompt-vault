# 发布到 GitHub

本项目已经整理成可直接发布的开源浏览器扩展目录。

## 推荐仓库名

```text
xiaoyu-ai-prompt-vault
```

## 使用 GitHub CLI 发布

先安装 Git 和 GitHub CLI，并登录：

```bash
gh auth login
```

然后在本目录执行：

```bash
git init
git add .
git commit -m "Initial open source release"
gh repo create xiaoyu-ai-prompt-vault --public --source=. --remote=origin --push --description "A local-first Chrome extension for collecting, editing, searching, and copying AI prompt templates."
```

发布后，别人可以通过 GitHub 页面点击 `Code -> Download ZIP` 下载，或克隆仓库后在 Chrome / Edge 中加载已解压扩展。

## 如果已经创建了空仓库

把下面的地址换成你的仓库地址：

```bash
git init
git add .
git commit -m "Initial open source release"
git branch -M main
git remote add origin https://github.com/YOUR_NAME/xiaoyu-ai-prompt-vault.git
git push -u origin main
```
