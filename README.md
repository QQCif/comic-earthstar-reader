# comic-earthstar-reader
A dumb screen grabber for comic earthstart

## Usage for beginner like myself
1. Install Node 8
2. Clone this repo
3. Use your command line tool to navigate to the project folder and run `npm install`
4. `node reader.js start -u URL -t INTERVAL` where URL is the page url, add single quotation mark as needed, interval is seconds between screenshots

## How it works
The raw image file is cropped in 64*64 and randomized, I have no way to reconstruct the image, so I used puppeteer to grab screenshot the page.

## Disclaimer
Made for learning javascript, use at own discretion.

## 中文说明
Neet在家学习js，看到S1有一个帖子问怎么抓取comic earth star上面的小说试读，图片都是打碎的，楼里面有个大大说这是绘制在canvas上面的，推荐casperjs，自己太菜试了一下不会写循环。搜搜其他headless chrome，看到官方出品puppeteer，正好拿来研究一下。
1. 先安装node，因为用到async/await，需要7以上版本，我用的是8.x
2. 下载这个包
3. 国内的话把npm的源切到淘宝`npm config set registry https://registry.npm.taobao.org`
4. 切换到包所在的文件夹，执行`npm install` 安装期间会拉取chromium，不保证能成功，请自行准备梯子。我尝试使用stable的chrome, 但是起不来，不知道以后能不能用。
5. `node reader.js start -u '抓取地址' -t 时间间隔` 地址注意带上单引号，时间间隔是每次抓取的间隔，默认是1秒，即过一秒点一下鼠标等待图片加载完成然后截图。网络不好需要加大间隔。目前的算法很不可靠，失败了麻烦重来。如果图片长时间没有加载好程序会等待，默认60 * 间隔，之后失败退出。中途强行停止可以按两下Ctrl+C。抓到的图片会出现在output文件夹里面，从0开始命名。

## 申明
我写来自我娱乐用，请勿当真。
