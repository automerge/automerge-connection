const Automerge = require('../node_modules/automerge/src/automerge')

class WatchableDoc {
  constructor (doc) {
    if (!doc) throw new Error("doc argument is required")
    this.doc = doc
    this.handlers = []
  }

  get () {
    return this.doc
  }

  set (doc) {
    this.doc = doc
    for (let handler of this.handlers) handler(doc)
  }

  applyChanges (changes) {
    const newDoc = Automerge.applyChanges(this.doc, changes)
    this.set(newDoc)
    return newDoc
  }

  registerHandler (handler) {
    this.handlers.push(handler)
  }

  unregisterHandler (handler) {
    this.handlers = this.handlers.filter(h => h !== handler)
  }
}

module.exports = WatchableDoc
