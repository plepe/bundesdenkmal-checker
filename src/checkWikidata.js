const loadWikidata = require('./loadWikidata.js')

const recommendedReferences = {
  P31: 'ist ein(e)',
  P84: 'Architekt_in',
  P170: 'Urheber_in',
  P186: 'Material',
  P580: 'Startzeitpunkt',
  P417: 'Patron_in',
  P180: 'Motiv',
  P7842: 'Wien Geschichte Wiki ID'
}

module.exports = function checkWikidata (id, dom, callback) {
  let div = document.createElement('div')
  dom.appendChild(div)

  div.innerHTML = '<h2>Wikidata</h2>'

  let ul = document.createElement('ul')
  ul.className = 'check'
  div.appendChild(ul)

  loadWikidata(id, (err, result) => {
    if (result.length > 1) {
      ul.innerHTML += '<li class="success">' + result.length + " Objekt gefunden: " + result.map(el => '<a target="_blank" href="' + el.item.value + '">' + el.item.value.match(/(Q[0-9]+)$/)[1] + '</a>').join(', ') + '</li>'
    } else if (result.length === 1) {
      let el = result[0]
      ul.innerHTML += '<li class="success">1 Objekt gefunden: <a target="_blank" href="https://wikidata.org/wiki/' + el.id + '">' + el.id + '</a></li>'

      // coords
      if (el.claims.P625) {
        let coords = el.claims.P625[0].mainsnak.datavalue.value

        ul.innerHTML += '<li class="success">Eintrag hat Koordinaten: <a target="_blank" href="https://openstreetmap.org/#map=19/' + coords.latitude + '/' + coords.longitude + '">' + coords.latitude + ', ' + coords.longitude + '</a></li>'
      } else {
        ul.innerHTML += '<li class="warning">Eintrag hat keine Koordinaten</li>'
      }

      let recommandations = []
      for (let k in recommendedReferences) {
        if (!(k in el.claims)) {
          recommandations.push(recommendedReferences[k])
        }
      }

      if (recommandations.length) {
        ul.innerHTML += '<li class="warning">Empfohlene weitere Angaben: ' + recommandations.join(', ') + '</li>'
      }
    } else {
      ul.innerHTML += '<li class="error">Kein Eintrag gefunden!</li>'
    }

    callback()
  })
}
