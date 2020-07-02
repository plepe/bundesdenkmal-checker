const EventEmitter = require('events')
const forEach = require('foreach')

const loader = {
  osm: require('./loader-osm.js'),
  wikidata: require('./loader-wikidata.js')
}

const modules = {
  wikipedia: 'Wikipedia',
  wikidata: 'Wikidata',
  commons: 'Wikimedia Commons',
  osm: 'OpenStreetMap'
}

module.exports = class Examinee extends EventEmitter {
  constructor (id, refData) {
    super()
    this.id = id
    this.refData = refData
    this.data = {}
    this.toLoad = {}
    this.loading = []
    this.doneLoading = {}
  }

  initMessages (dom) {
    this.messagesUl = {}

    forEach(modules, (title, id) => {
      const div = document.createElement('div')
      dom.appendChild(div)

      div.innerHTML = '<h2>' + title + '</h2>'

      const ul = document.createElement('ul')
      ul.className = 'check'
      div.appendChild(ul)
      this.messagesUl[id] = ul
    })
  }

  load (module, query) {
    if (!(module in this.toLoad)) {
      this.toLoad[module] = []
    }

    this.toLoad[module].push(query)
  }

  message (module, status, message) {
    const li = document.createElement('li')
    li.innerHTML = message
    li.className = status
    this.messagesUl[module].appendChild(li)

    return true
  }

  needLoad () {
    return Object.keys(this.toLoad).length + Object.keys(this.loading).length
  }

  _load () {
    const toLoad = this.toLoad
    this.loading = this.loading.concat(Object.values(this.toLoad))
    this.toLoad = {}

    for (const module in toLoad) {
      if (!(module in this.doneLoading)) {
        this.doneLoading[module] = []
      }

      const queries = toLoad[module].filter(query => !this.doneLoading[module].includes(JSON.stringify(query)))
      queries.forEach(query => this.doneLoading[module].push(JSON.stringify(query)))

      if (!queries.length) {
        this.loading.splice(this.loading.indexOf(toLoad[module]))
        continue
      }

      loader[module](queries,
        (err, result) => {
          this.loading.splice(this.loading.indexOf(toLoad[module]))
          if (err) { return this.emit('loadError', err) }
          this.data[module] = result
          this.emit('load')
        }
      )
    }
  }
}
