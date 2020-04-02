const { Set } = require('immutable')
const Automerge = require('../node_modules/automerge/src/automerge')

class WatchableDoc {
  constructor (doc) {
    if (!doc) throw new Error("doc argument is required")
    this.doc = doc
    this.handlers = Set()
  }

  get () {
    return this.doc
  }

  set (doc) {
    this.doc = doc
    this.handlers.forEach(handler => handler(doc))
  }

  applyChanges (changes) {
    const newDoc = Automerge.applyChanges(this.doc, changes)
    this.set(newDoc)
    return newDoc
  }

  registerHandler (handler) {
    this.handlers = this.handlers.add(handler)
  }

  unregisterHandler (handler) {
    this.handlers = this.handlers.remove(handler)
  }
}

module.exports = WatchableDoc
