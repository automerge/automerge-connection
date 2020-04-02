const Automerge = require('../node_modules/automerge/src/automerge')

class DocSet {
  constructor () {
    this.docs = {}
    this.handlers = []
  }

  get docIds () {
    return Object.keys(this.docs)
  }

  getDoc (docId) {
    return this.docs[docId]
  }

  removeDoc (docId) {
    delete this.docs[docId]
  }

  setDoc (docId, doc) {
    this.docs[docId] = doc
    for (let handler of this.handlers) handler(docId, doc)
  }

  applyChanges (docId, changes) {
    let doc = this.docs[docId] || Automerge.init()
    doc = Automerge.applyChanges(doc, changes)
    this.setDoc(docId, doc)
    return doc
  }

  registerHandler (handler) {
    this.handlers.push(handler)
  }

  unregisterHandler (handler) {
    this.handlers = this.handlers.filter(h => h !== handler)
  }
}

module.exports = DocSet
