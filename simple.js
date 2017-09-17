(async () => {
  const puppeteer = require('puppeteer')
  const url = 'http://viewer.comic-earthstar.jp/viewer.html?cid=24896ee4c6526356cc127852413ea3b4&cty=1&lin=0'
  function getRandomArbitrary (min, max) {
    return Math.random() * (max - min) + min
  }
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  let dimension = {
    width: 2160,
    height: 3840
  }
  const totalPages = 40
  async function intervalScreenshot (interval, filename) {
    try {
      // Click mocking
      await page.waitFor(interval)
      await page.screenshot({ path: `${filename}.png` })
      await page.mouse.click(50 + getRandomArbitrary(-10, 10), 1700 + getRandomArbitrary(-10, 10))
    } catch (error) {
      console.log(error)
    }
  }

  await page.setViewport(dimension)
  await page.goto(url)
  dimension = {
    width: 1352,
    height: 1920
  }
  await page.setViewport(dimension)
  for (const i of Array(totalPages).keys()) {
    await intervalScreenshot(6000, i)
  }
  await browser.close()
})()
