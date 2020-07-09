const escHTML = require('html-escape')

const STATUS = require('../src/status.js')

module.exports = function init (options) {
  return check.bind(this, options)
}

// result:
// - null/false: not finished yet
// - true: check is finished
function check (options, ob) {
  if (!ob.data.commons) {
    return ob.load('commons', { search: 'insource:' + options.replace(/\$1/g, ob.id) })
  }

  const files = ob.data.commons.filter(page => page.title.match(/^File:/))
  const categories = ob.data.commons.filter(page => page.title.match(/^Category:/))
  if (files.length) {
    ob.message('commons', STATUS.SUCCESS, files.length + ' Bild(er) gefunden, die auf das Objekt verweisen: ' + files.map((page, i) => '<a target="_blank" href="https://commons.wikimedia.org/wiki/' + escHTML(page.title) + '">#' + (i + 1) + '</a>').join(', ') + '.')
  }

  if (categories.length) {
    ob.message('commons', STATUS.SUCCESS, categories.length + ' Kategorie(n) gefunden, die auf das Objekt verweisen: ' + categories.map((page, i) => '<a target="_blank" href="https://commons.wikimedia.org/wiki/' + escHTML(page.title) + '">#' + (i + 1) + '</a>').join(', ') + '.')
  } else {
    ob.message('commons', STATUS.WARNING, 'Keine Kategorie gefunden, die auf das Objekt verweist.')
  }

  if (files.length + categories.length === 0) {
    ob.message('commons', STATUS.ERROR, 'Weder Bilder noch Kategorien gefunden, die auf dieses Objekt verweisen.')
  }

  ob.data.commons.forEach(page => {
    if (page.title.match(/^File:/)) {
      // Disable, as this query does not work
      // ob.load('wikidata', {key: 'P18', id: page.title.substr(5)})
    } else if (page.title.match(/^Category:/)) {
      ob.load('wikidata', { key: 'P373', id: page.title.substr(9) })
    }
  })

  return true
}
