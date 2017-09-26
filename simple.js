(async () => {
  const puppeteer = require('puppeteer')
  const url = 'http://some-url-here'
  const mobileUa = 'Mozilla/5.0 (Linux; Android 5.1.1; Nexus 6 Build/LYZ28E) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Mobile Safari/537.36'

  function getRandomArbitrary (min, max) {
    return Math.random() * (max - min) + min
  }
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.emulate({
    viewport: {
      width: 2160,
      height: 3840,
      isMobile: true,
      hasTouch: true
    },
    userAgent: mobileUa
  })
  const totalPages = 120
  async function intervalScreenshot (interval, filename) {
    try {
      // Click mocking
      await page.waitFor(interval)
      await page.screenshot({ path: `output/${filename}.png` })
      await page.touchscreen.tap(dimension.width * 0.1 + getRandomArbitrary(-10, 10), dimension.height * 0.5 + getRandomArbitrary(-10, 10))
    } catch (error) {
      console.log(error)
    }
  }
  let dimension = {
    width: 2160,
    height: 3840,
    isMobile: true,
    hasTouch: true
  }
  await page.setViewport(dimension)
  await page.goto(url)
  dimension.width = 768
  dimension.height = 1024
  await page.waitFor(10000)
  await page.setViewport(dimension)
  for (let i of Array(totalPages).keys()) {
    await intervalScreenshot(2000, i)
    console.log(i)
  }
  await browser.close()
})()
