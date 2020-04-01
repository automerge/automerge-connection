const assert = require('assert')
const sinon = require('sinon')
const Automerge = require('automerge')
const Connection = process.env.TEST_DIST === '1' ? require('../dist/connection') : require('../src/connection')

describe('Connection.WatchableDoc', () => {
  let watchDoc, beforeDoc, afterDoc, changes, callback

  beforeEach(() => {
    beforeDoc = Automerge.change(Automerge.init(), doc => doc.document = 'watch me now')
    afterDoc = Automerge.change(beforeDoc, doc => doc.document = 'i can mash potato')
    changes = Automerge.getChanges(beforeDoc, afterDoc)
    watchDoc = new Connection.WatchableDoc(beforeDoc)
    callback = sinon.spy()
    watchDoc.registerHandler(callback)
  })

  it('should have a document', () => {
    assert.strictEqual(watchDoc.get(), beforeDoc)
  })

  it('should call the handler via set', () => {
    watchDoc.set(afterDoc)
    assert.strictEqual(callback.calledOnce, true)
    assert.deepStrictEqual(watchDoc.get(), afterDoc)
  })

  it('should call the handler via applyChanges', () => {
    watchDoc.applyChanges(changes)
    assert.strictEqual(callback.calledOnce, true)
    assert.deepStrictEqual(watchDoc.get(), afterDoc)
  })

  it('should allow removing the handler', () => {
    watchDoc.unregisterHandler(callback)
    watchDoc.applyChanges(changes)
    assert.strictEqual(callback.notCalled, true)
  })
})
