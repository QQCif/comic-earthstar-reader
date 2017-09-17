var casper = require('casper').create()
// var x = require('casper').selectXPath
casper.start('https://bbs.saraba1st.com/2b/forum.php')
casper.then(function () {
  this.click('#category_1 > table > tbody > tr:nth-child(7) > td:nth-child(2) > h2 > a')
})
casper.then(function () {
  this.echo('First Page: ' + this.getTitle())
})

casper.run()
