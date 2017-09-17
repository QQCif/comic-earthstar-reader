/* Only works with manga */

(async () => {
  const puppeteer = require('puppeteer')
  const escapeRegExp = require('lodash.escaperegexp')
  const url = 'http://viewer.comic-earthstar.jp/viewer.html?cid=c32d9bf27a3da7ec8163957080c8628e&cty=1&lin=0'
  const mobileUa = 'Mozilla/5.0 (Linux; Android 4.4.2; LGL22 Build/KOT49I.LGL2220c) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.116 Mobile Safari/537.36'
  function getRandomArbitrary (min, max) {
    return Math.random() * (max - min) + min
  }

  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  try {
    let pageData = null
    let totalPages = null
    let dimension = null
    let counter = 0
    let readyPages = []
    await page.emulate({
      viewport: {
        width: 2160,
        height: 3840,
        isMobile: true,
        hasTouch: true
      },
      userAgent: mobileUa
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

        if (re.test(req.response().url)) {
          dimension = pageData[key].FileLinkInfo.PageLinkInfoList[0].Page.Size
          dimension = {
            height: dimension.Height,
            width: dimension.Width,
            isMobile: true,
            hasTouch: true
          }
          await page.setViewport(dimension)
          readyPages.push(filenameRe.exec(key))
        }
      }
    })
    await page.goto(url, {
      timeout: 10000
    })
    await page.waitFor(7000)
    if (pageData) {
      while (readyPages.length < totalPages) {
        while (counter < readyPages.length) {
          await intervalScreenshot(500, counter, dimension)
          console.log(`Current Page: ${counter}`)
          ++counter
          if (counter === totalPages) {
            await browser.close()
          }
        }
      }
    }
  } catch (error) {
    console.log(error)
  }
  async function intervalScreenshot (interval, filename, dimension) {
    try {
      // Click mocking
      await page.waitFor(interval * getRandomArbitrary(1, 1.1))
      await page.screenshot({ path: `output/${filename}.png` })
      await page.touchscreen.tap(dimension.width * 0.1 + getRandomArbitrary(-10, 10), dimension.width * 0.9 + getRandomArbitrary(-10, 10))
    } catch (error) {
      console.log(error)
    }
  }
})()
