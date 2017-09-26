/**
 * A dumb tool to grab Comic Earth Star
 */
const puppeteer = require('puppeteer')
const escapeRegExp = require('lodash.escaperegexp')
const { URL } = require('url')
const EventEmitter = require('events')
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter()

/**
 * Use yargs to handle arguments
 */
const yargs = require('yargs') // eslint-disable-line
  .command('start', 'start grabbing', (yargs) => {
    yargs.option({
      'url': {
        alias: 'u',
        describe: 'Page to grab'
      },
      'interval': {
        alias: 'i',
        default: 1,
        describe: 'Interval seconds between shots, increase when suffering from bad network. Shall be larger than 1'
      }
    })
  }, (argv) => {
    if (argv.interval < 1) {
      console.log('Interval shall be larger than 1')
      process.exit()
    }
    if (argv.url) main(new URL(argv.url))
  })
  .demandOption(['url'], 'Please provide the URL to work with')
  .argv
const interval = yargs.i

/**
 * Main entry function
 * @async
 * @function main
 * @param {string} url - The URL of the page
 */
async function main (url) {
  /** Mocking mobile platform to get rid of page scroll animation */
  const mobileUa = 'Mozilla/5.0 (Linux; Android 5.1.1; Nexus 6 Build/LYZ28E) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Mobile Safari/537.36'

  /**
   * Getting a random number between two values
   * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random | Random() on MDN}
   * @param {number} min - min value for random number
   * @param {number} max - max value for random number
   */
  function getRandomArbitrary (min, max) {
    return Math.random() * (max - min) + min
  }

  /** Init puppeteer */
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  try {
    let pageData = null
    let totalPages = null
    let dimension = null
    let counter = 0
    let readyPages = []

    /** Set a large viewport first and mock user-agent */
    await page.emulate({
      viewport: {
        width: 2160,
        height: 3840,
        isMobile: true,
        hasTouch: true
      },
      userAgent: mobileUa
    })

    /** Handle 'loaddone' event */
    myEmitter.on('loaddone', async () => {
      console.log('invisible page loaded!')
      /** Check if page data is ready */
      if (pageData) {
        /** Manga seems has 'cty=1' in URL */
        if (url.searchParams.get('cty') === '1') {
          totalPages = pageData.configuration.contents.length
        }
        /** Light novel seems has 'cty=0 in URL */
        if (url.searchParams.get('cty') === '0') {
          for (let key of pageData.configuration.contents) {
            const filename = key.file
            totalPages += pageData[filename].FileLinkInfo.PageCount
          }
        }
        console.log(`Total Pages: ${totalPages}`)
        /**
         * While counter is smaller then total pages
         * grab the current page until counter reaches
         * total pages then close browser
         */
        while (counter < totalPages) {
          let retry = 0
          while (readyPages.length > 0) {
            console.log(`Cache size: ${readyPages.length}`)
            await intervalScreenshot(interval * 1000, counter, dimension)
            const shiftFileName = readyPages.shift()
            counter++
            console.log(`Done: ${counter}, name: ${shiftFileName}`)
          }
          while (readyPages.length === 0) {
            if (counter === totalPages) {
              await browser.close()
              return
            }
            const waitInterval = interval * 1000
            await page.waitFor(waitInterval)
            ++retry
            console.log(`Retried ${retry} time(s)`)
            if (retry === 60) {
              console.log(`Retried ${retry} times, aborting...`)
              await browser.close()
              return
            }
          }
        }
      }
    })
    /** Handle 'requestfinished' event */
    page.on('requestfinished', async req => {
      console.log(req.url)
      try {
        /**
         * When configuration_pack.json loaded get all the content
         * which contains much useful infomation about page structure
         */
        if (req.response().url.endsWith('configuration_pack.json')) {
          if (!pageData) {
            pageData = await req.response().json()
          }
        }
        if (req.response().url.endsWith('invisible.png')) {
          /**
           * Loaddone event
           *
           * @event loaddone
           */
          myEmitter.emit('loaddone')
        }
        if (pageData) {
          /**
           * Iterate through pageData.configuration.contents, set viewport according to dimension.
           * Add counts to readPages
           */
          for (let key of pageData.configuration.contents) {
            const filename = key.file
            /**
             * File name are like
             * '../shared/item/xhtml/p-001.xhtml/number.jpeg' or
             * 'item/xhtml/p-001.xhtml/number.jpeg'
             */
            const re = new RegExp(`${escapeRegExp(filename.replace(/\.\.\//i, ''))}/[0-9]*.jpeg`, 'i')
            if (re.test(req.response().url)) {
              dimension = pageData[filename].FileLinkInfo.PageLinkInfoList[0].Page.Size
              dimension = {
                height: dimension.Height,
                width: dimension.Width,
                isMobile: true,
                hasTouch: true
              }
              await page.setViewport(dimension)
              readyPages.push(re.exec(req.response().url))
            }
          }
        }
      } catch (error) {
        console.log(error)
      }
    })
    /** Navigate to the page, set wait method to idle, time out 10 seconds */
    await page.goto(url.toString(), {
      waitUntil: 'networkidle',
      networkIdleTimeout: 10000
      // timeout: 10000
    })
  } catch (error) {
    console.log(error)
  }
  /**
   * Take screenshots at interval
   *
   * @async
   * @function intervalScreenshot
   * @param {number} interval - interval between
   * @param {string} filename - file name to save
   * @param {object} dimension - file dimension
   */
  async function intervalScreenshot (interval, filename, dimension) {
    try {
      /**
       * Click mocking
       */
      await page.waitFor(interval * getRandomArbitrary(1, 1.1))
      await page.screenshot({ path: `output/${filename}.png` })
      await page.touchscreen.tap(dimension.width * 0.1 + getRandomArbitrary(-5, 5), dimension.height * 0.7 + getRandomArbitrary(-5, 5))
    } catch (error) {
      console.log(error)
    }
  }
}
