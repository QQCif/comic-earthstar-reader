/* Only works with comic */

const puppeteer = require('puppeteer')
const escapeRegExp = require('lodash.escaperegexp')
const url = 'http://viewer.comic-earthstar.jp/viewer.html?cid=fc221309746013ac554571fbd180e1c8&cty=1&lin=0'

function getRandomArbitrary (min, max) {
  return Math.random() * (max - min) + min
}

(async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  try {
    let pageData = null
    let totalPages = null
    let dimension = null
    let counter = 0
    await page.setViewport({
      width: 2160,
      height: 3840
    })
    page.on('requestfinished', async req => {
      if (req.response().url.endsWith('configuration_pack.json')) {
        pageData = await req.response().json()
        totalPages = pageData.configuration.contents.length
        console.log(`Total Pages: ${totalPages}`)
      }
      for (const key in pageData) {
        const re = new RegExp(`${escapeRegExp(key)}/[0-9].jpeg`, 'i')
        const filenameRe = new RegExp(/p-[0-9, a-z]*/)
        const firstPageRe = new RegExp(/p-(001|002|003|c)/)
        if (re.test(req.response().url)) {
          dimension = pageData[key].FileLinkInfo.PageLinkInfoList[0].Page.Size
          dimension = {
            height: dimension.Height,
            width: dimension.Width
          }
          console.log(dimension)
          await page.setViewport(dimension)
          if (firstPageRe.test(req.response().url)) {
            await intervalScreenshot(6000 * getRandomArbitrary(1, 1.1), filenameRe.exec(key))
            ++counter
            console.log(`Current Page: ${counter}`)
          } else {
            await intervalScreenshot(2000 * getRandomArbitrary(1, 1.1), filenameRe.exec(key))
            ++counter
            console.log(`Current Page: ${counter}`)
            if (counter === totalPages) {
              await browser.close()
            }
          }
        }
      }
    })
    await page.goto(url)
  } catch (error) {
    console.log(error)
  }
  async function intervalScreenshot (interval, filename) {
    try {
      // Click mocking
      await page.waitFor(interval * getRandomArbitrary(1, 1.5))
      await page.screenshot({ path: `${filename}.png` })
      await page.mouse.click(100 + getRandomArbitrary(-10, 10), 500 + getRandomArbitrary(-10, 10))
    } catch (error) {
      console.log(error)
    }
  }
})()
