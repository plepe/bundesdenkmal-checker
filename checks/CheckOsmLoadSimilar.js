const stringSimilarity = require('string-similarity')

const STATUS = require('../src/status.js')
const osmFormat = require('../src/osmFormat.js')
const getCoords = require('../src/getCoords.js')
const calcDistance = require('../src/calcDistance.js')
const Check =  require('../src/Check.js')

class CheckOsmLoadSimilar extends Check {
  // result:
  // - null/false: not finished yet
  // - true: check is finished
  check (ob) {
    if (!ob.data.wikidata) { // wait for wikidata info to be populated
      return
    }

    if (!ob.isDone('CheckWikidataLoadViaRef') && !ob.isDone('CheckWikidataLoadFromCommons')) {
      return
    }

    let allCoords = []
    let coords = getCoords(ob.refData, this.options.coordField)
    if (coords) {
      allCoords.push(coords)
    }

    ob.data.wikidata.forEach(
      wikidata => {
        if (wikidata.claims.P625) {
          wikidata.claims.P625.forEach(
            P625 => {
              allCoords.push(P625.mainsnak.datavalue.value)
            }
          )
        }
      }
    )

    if (!ob.data.osm && ob.data.wikidata) {
      let query = ob.dataset.compileOverpassQuery(ob)
      if (query === null) {
        return true
      }

      allCoords.forEach(coords => ob.load('osm', query.replace(/\(filter\)/g, '(around:30,' + coords.latitude + ',' + coords.longitude + ')')))
      return
    }

    // if one of the OSM objects has a matching wikidata tag, we are happy
    if (!ob.osmSimilar && ob.data.wikidata.length) {
      let match = ob.data.osm.filter(el => el.tags.wikidata === ob.data.wikidata[0].id)
      if (match.length) {
        return true
      }
    }

    // if one of the OSM objects has a matching refField tag (e.g. ref:at:bda), we are happy
    if (!ob.osmSimilar && ob.dataset.osmRefField) {
      let match = ob.data.osm.filter(el => el.tags[ob.dataset.osmRefField] === ob.id)
      if (match.length) {
        return true
      }
    }

    ob.data.osm.forEach(el => {
      let distances = allCoords.map(coords => calcDistance(coords, el.bounds))
      el.distance = Math.min.apply(null, distances)
    })

    let osmPoss = ob.data.osm.filter(el => stringSimilarity.compareTwoStrings(ob.refData[this.options.nameField], el.tags.name || '') > 0.4)

    // No objects with similar names found, return objects without a name
    if (osmPoss.length === 0) {
      osmPoss = ob.data.osm.filter(el => !el.tags.name)
    }

    // Order objects by distance
    osmPoss.sort((a, b) => a.distance - b.distance)

    if (osmPoss.length) {
      let msg = [
        'Ein Objekt in der Nähe gefunden, das passen könnte',
        'Objekte in der Nähe gefunden, die passen könnten'
      ]

      ob.message('osm', STATUS.SUCCESS, (osmPoss.length === 1 ? msg[0] : osmPoss.length + ' ' + msg[1]) + ':<ul>' + osmPoss.map(el => '<li>' + osmFormat(el, ob, ' (Entfernung: ' + Math.round(el.distance * 1000) + 'm)') + '</li>').join('') + '</ul>')

      if (osmPoss.length === 1 && osmPoss[0].tags.wikidata && ob.data.wikidata.length === 0) {
        ob.load('wikidata', {key: 'id', id: osmPoss[0].tags.wikidata})
        ob.message('wikidata', STATUS.WARNING, 'Bitte kontrollieren, ob <a target="_blank" href="https://wikidata.org/wiki/' + osmPoss[0].tags.wikidata + '">' + osmPoss[0].tags.wikidata + '</a> der richtige Wikidata Eintrag ist. Er wurde von möglicherweise passendem OpenStreetMap Objekt <a target="_blank" href="https://openstreetmap.org/' + osmPoss[0].type + '/' + osmPoss[0].id + '">' + osmPoss[0].type + '/' + osmPoss[0].id + '</a> geladen.')
        ob.osmSimilar = true
      }
    } else {
      ob.message('osm', STATUS.ERROR, 'Kein passendes Objekt in der Nähe gefunden.')
    }
    return true
  }
}

module.exports = options => new CheckOsmLoadSimilar(options)
