import * as assert from 'assert'
import * as Automerge from 'automerge'
import * as Connection from 'connection'

interface BirdList {
  birds: Automerge.List<string>
}

describe('TypeScript support', () => {
  describe('Connection.DocSet', () => {
    let beforeDoc: BirdList
    let afterDoc: BirdList
    let docSet: Connection.DocSet<BirdList>
    let changes: Automerge.Change[]
    let callback: Connection.DocSetHandler<BirdList>
    const ID = '1'

    beforeEach(() => {
      beforeDoc = Automerge.change(Automerge.init(), doc => (doc.birds = ['goldfinch']))
      afterDoc = Automerge.change(beforeDoc, doc => (doc.birds = ['swallows']))
      changes = Automerge.getChanges(beforeDoc, afterDoc)
      docSet = new Connection.DocSet()
      docSet.setDoc(ID, beforeDoc)
      callback = _doc => {}
      docSet.registerHandler(callback)
    })

    it('should have a document inside the docset', () => {
      assert.strictEqual(docSet.getDoc(ID), beforeDoc)
    })

    it('should call the handler via set', () => {
      docSet.setDoc(ID, afterDoc)
      assert.deepStrictEqual(docSet.getDoc(ID), afterDoc)
    })

    it('should call the handler via applyChanges', () => {
      docSet.applyChanges(ID, changes)
      assert.deepStrictEqual(docSet.getDoc(ID), afterDoc)
    })

    it('should allow removing the handler', () => {
      docSet.unregisterHandler(callback)
      docSet.applyChanges(ID, changes)
    })

    it('should allow removing a document', () => {
      docSet.removeDoc(ID)
      assert.strictEqual(docSet.getDoc(ID), undefined)
    })

    it('should list the ids of its documents', () => {
      assert.deepStrictEqual(Array.from(docSet.docIds), [ID])
    })
  })

  describe('Connection.WatchableDoc', () => {
    let beforeDoc: BirdList
    let afterDoc: BirdList
    let watchDoc: Connection.WatchableDoc<BirdList>
    let changes: Automerge.Change[]
    let callback: Connection.WatchableDocHandler<BirdList>

    beforeEach(() => {
      beforeDoc = Automerge.change(Automerge.init(), doc => (doc.birds = ['goldfinch']))
      afterDoc = Automerge.change(beforeDoc, doc => (doc.birds = ['swallows']))
      changes = Automerge.getChanges(beforeDoc, afterDoc)
      watchDoc = new Connection.WatchableDoc(beforeDoc)
      callback = _doc => {}
      watchDoc.registerHandler(callback)
    })

    it('should have a document', () => {
      assert.strictEqual(watchDoc.get(), beforeDoc)
    })

    it('should call the handler via set', () => {
      watchDoc.set(afterDoc)
      assert.deepStrictEqual(watchDoc.get(), afterDoc)
    })

    it('should call the handler via applyChanges', () => {
      watchDoc.applyChanges(changes)
      assert.deepStrictEqual(watchDoc.get(), afterDoc)
    })

    it('should allow removing the handler', () => {
      watchDoc.unregisterHandler(callback)
      watchDoc.applyChanges(changes)
    })
  })
})
