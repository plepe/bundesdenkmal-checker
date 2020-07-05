const escHTML = require('html-escape')

module.exports = {
  title: 'Kunstwerke im öff. Raum (Kulturgut Wien)',

  listTitle: 'Kunstwerke im öff. Raum (Kulturgut Wien)',

  filename: 'kunstwien.json',

  idField: 'ID',

  ortFilterField: 'PLZ',

  checks: [
  //  require('../checks/osmRefBda.js')('ref:at:bda'),
    require('../checks/commonsTemplateToWikidata.js')('/\\{\\{[Pp]ublic Art Austria\\s*\\|\\s*(1=)*$1\\|\\s*(2=)*AT-9\\}\\}/'),
    require('../checks/wikidataLoaded.js')(),
  //  require('../checks/loadWikidata.js')('P2951'),
    require('../checks/wikidataCoords.js')(),
    require('../checks/wikidataIsA.js')(),
    require('../checks/wikidataRecommendations.js')(),
  //  require('../checks/commonsLoad.js')(),
    require('../checks/commonsImage.js')(),
    require('../checks/commonsWikidataInfobox.js')(),
    require('../checks/wikipediaKunstwerkliste.js')(),
    require('../checks/osmLoadFromWikidata.js')(),
  //  require('../checks/commonsTemplate.js')()
    require('../checks/osmTags.js')()
  ],

  listEntry (entry, dom) {
    const tr = document.createElement('tr')
    const td = document.createElement('td')
    tr.appendChild(td)

    const a = document.createElement('a')
    a.innerHTML = '<span class="Bezeichnung">' + escHTML(entry.OBJEKTTITEL) + '</span><span class="Adresse">' + escHTML(entry.STRASSE) + '</span>'
    a.href = '#' + entry.ID
    td.appendChild(a)
    td.appendChild(document.createElement('br'))

    dom.appendChild(tr)
  },

  showEntry (data, dom) {
    const div = document.createElement('div')
    dom.appendChild(div)

    div.innerHTML = '<h2>Stadt Wien</h2>'

    const ul = document.createElement('ul')
    div.appendChild(ul)

    ul.innerHTML += '<li>ID: ' + data.ID + '</li>'
    ul.innerHTML += '<li>Titel: ' + escHTML(data.OBJEKTTITEL) + '</li>'
    ul.innerHTML += '<li>Vulgonamen: ' + escHTML(data.VULGONAMEN) + '</li>'
    ul.innerHTML += '<li>Typ: ' + escHTML(data.TYP) + '</li>'
    ul.innerHTML += '<li>Adresse: ' + escHTML(data.STRASSE) + ', ' + escHTML(data.PLZ) + ' ' + escHTML(data.ORT) + '</li>'
    let coords = data.SHAPE.match(/POINT \((-?\d+\.\d+) (-?\d+\.\d+)\)/)
    if (coords) {
      ul.innerHTML += '<li>Koordinaten: <a target="_blank" href="https://openstreetmap.org/?mlat=' + coords[2] + '&mlon=' + coords[1] + '#map=19/' + coords[2] + '/' + coords[1] + '">' + parseFloat(coords[2]).toFixed(5) + ', ' + parseFloat(coords[1]).toFixed(5) + '</a></li>'
    }
    ul.innerHTML += '<li>Standort: ' + escHTML(data.STANDORT) + '</li>'
    ul.innerHTML += '<li>Beschreibung: ' + escHTML(data.BESCHREIBUNG) + '</li>'
    ul.innerHTML += '<li>Geschichte: ' + escHTML(data.GESCHICHTE) + '</li>'
    ul.innerHTML += '<li>Entstehung: ' + escHTML(data.ENTSTEHUNG) + ' (' + escHTML(data.EPOCHE) + ')</li>'
    ul.innerHTML += '<li>Künstler*in: ' + escHTML(data.KUENSTLER) + '</li>'
    ul.innerHTML += '<li>Material: ' + escHTML(data.MATERIAL) + '</li>'

    //const pre = document.createElement('pre')
    //dom.appendChild(pre)
    //pre.appendChild(document.createTextNode(JSON.stringify(data, null, '  ')))
  }
}
