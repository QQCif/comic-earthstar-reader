/* Only works with manga */

(async () => {
  const puppeteer = require('puppeteer')
  const escapeRegExp = require('lodash.escaperegexp')
  // const url = 'http://viewer.comic-earthstar.jp/viewer.html?cid=fec8d47d412bcbeece3d9128ae855a7a&cty=1&lin=0'
  const mobileUa = 'Mozilla/5.0 (Linux; Android 4.4.2; LGL22 Build/KOT49I.LGL2220c) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.116 Mobile Safari/537.36'
  function getRandomArbitrary (min, max) {
    return Math.random() * (max - min) + min
  }

  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  try {
    if (process.argv.length < 3) {
      throw new Error('Please enter proper url')
    }
    const url = `http://viewer.comic-earthstar.jp/viewer.html?cid=${process.argv[2]}&cty=1&lin=0`
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
      console.log(req.url)
      try {
        if (req.response().url.endsWith('configuration_pack.json')) {
          pageData = await req.response().json()
          totalPages = pageData.configuration.contents.length
          console.log(`Total Pages: ${totalPages}`)
        }
        if (pageData) {
          for (let key of pageData.configuration.contents) {
            const filename = key.file
            const re = new RegExp(`${escapeRegExp(filename).slice(2)}/[0-9].jpeg`, 'i')
            const filenameRe = new RegExp(/p-[0-9, a-z]*/)
            if (re.test(req.response().url)) {
              dimension = pageData[filename].FileLinkInfo.PageLinkInfoList[0].Page.Size
              dimension = {
                height: dimension.Height,
                width: dimension.Width,
                isMobile: true,
                hasTouch: true
              }
              await page.setViewport(dimension)
              readyPages.push(filenameRe.exec(filename))
            }
          }
        }
      } catch (error) {
        console.log(error)
      }
    })
    await page.goto(url, {
      waitUntil: 'networkidle',
      networkIdleTimeout: 10000
      // timeout: 10000
    })
    if (pageData) {
      await page.waitFor(10000)
      while (counter < totalPages) {
        while (counter === readyPages.length) {
          console.log(`Loaded Pages: ${readyPages.length}`)
          console.log('waiting 1000ms')
          await page.waitFor(1000)
        }
        await intervalScreenshot(1000, counter, dimension)
        console.log(`Done: ${counter}`)
        ++counter
        if (counter === totalPages) {
          await browser.close()
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
      await page.touchscreen.tap(dimension.width * 0.1 + getRandomArbitrary(-10, 10), dimension.height * 0.7 + getRandomArbitrary(-10, 10))
    } catch (error) {
      console.log(error)
    }
  }
})()
