const Automerge = require('../node_modules/automerge/src/automerge')

// Updates the vector clock for `docId` in `clockMap` (mapping from docId to
// vector clock) by merging in the new vector clock `clock` (taking the
// element-wise maximum).
function clockUnion(clockMap, docId, clock) {
  const newClock = Object.assign({}, clockMap[docId])
  for (let [key, value] of Object.entries(clock)) {
    if (!newClock[key] || newClock[key] < value) newClock[key] = value
  }
  clockMap[docId] = newClock
}

// Returns true if all components of `clock1` equal those of `clock2`.
function clockEqual(clock1, clock2) {
  for (let key of Object.keys(clock1).concat(Object.keys(clock2))) {
    if (clock1[key] !== clock2[key]) return false
  }
  return true
}

// Returns true if all components of `clock1` are less than or equal to those
// of `clock2`. Returns false if there is at least one component in which
// `clock1` is greater than `clock2` (that is, either `clock1` is overall
// greater than `clock2`, or the clocks are incomparable).
function lessOrEqual(clock1, clock2) {
  for (let [key, value] of Object.entries(clock1)) {
    if (value > 0 && (!clock2[key] || clock2[key] < value)) return false
  }
  return true
}

// Keeps track of the communication with one particular peer. Allows updates for many documents to
// be multiplexed over a single connection.
//
// To integrate a connection with a particular networking stack, two functions are used:
// * `sendMsg` (callback passed to the constructor, will be called when local state is updated)
//   takes a message as argument, and sends it out to the remote peer.
// * `receiveMsg` (method on the connection object) should be called by the network stack when a
//   message is received from the remote peer.
//
// The documents to be synced are managed by a `DocSet`. Whenever a document is changed locally,
// call `setDoc()` on the docSet. The connection registers a callback on the docSet, and it figures
// out whenever there are changes that need to be sent to the remote peer.
//
// theirClock is the most recent VClock that we think the peer has (either because they've told us
// that it's their clock, or because it corresponds to a state we have sent to them on this
// connection). Thus, everything more recent than theirClock should be sent to the peer.
//
// ourClock is the most recent VClock that we've advertised to the peer (i.e. where we've
// told the peer that we have it).
class Connection {
  constructor (docSet, sendMsg) {
    this._docSet = docSet
    this._sendMsg = sendMsg
    this._theirClock = {}
    this._ourClock = {}
    this._docChangedHandler = this.docChanged.bind(this)
  }

  open () {
    for (let docId of this._docSet.docIds) this.docChanged(docId, this._docSet.getDoc(docId))
    this._docSet.registerHandler(this._docChangedHandler)
  }

  close () {
    this._docSet.unregisterHandler(this._docChangedHandler)
  }

  sendMsg (docId, clock, changes) {
    const msg = {docId, clock}
    clockUnion(this._ourClock, docId, clock)
    if (changes) msg.changes = changes
    this._sendMsg(msg)
  }

  maybeSendChanges (docId) {
    const doc = this._docSet.getDoc(docId)
    const state = Automerge.Frontend.getBackendState(doc)
    const clock = Automerge.Backend.getClock(state)

    if (this._theirClock[docId]) {
      const changes = Automerge.Backend.getChanges(state, this._theirClock[docId])
      if (changes.length > 0) {
        clockUnion(this._theirClock, docId, clock)
        this.sendMsg(docId, clock, changes)
        return
      }
    }

    if (!clockEqual(clock, this._ourClock[docId] || {})) this.sendMsg(docId, clock)
  }

  // Callback that is called by the docSet whenever a document is changed
  docChanged (docId, doc) {
    const state = Automerge.Frontend.getBackendState(doc)
    const clock = Automerge.Backend.getClock(state)
    if (!clock) {
      throw new TypeError('This object cannot be used for network sync. ' +
                          'Are you trying to sync a snapshot from the history?')
    }

    if (!lessOrEqual(this._ourClock[docId] || {}, clock)) {
      throw new RangeError('Cannot pass an old state object to a connection')
    }

    this.maybeSendChanges(docId)
  }

  receiveMsg (msg) {
    if (msg.clock) {
      clockUnion(this._theirClock, msg.docId, msg.clock)
    }
    if (msg.changes) {
      return this._docSet.applyChanges(msg.docId, msg.changes)
    }

    if (this._docSet.getDoc(msg.docId)) {
      this.maybeSendChanges(msg.docId)
    } else if (!this._ourClock[msg.docId]) {
      // If the remote node has data that we don't, immediately ask for it.
      // TODO should we sometimes exercise restraint in what we ask for?
      this.sendMsg(msg.docId, {})
    }

    return this._docSet.getDoc(msg.docId)
  }
}

Connection.DocSet = require('./doc_set')
Connection.WatchableDoc = require('./watchable_doc')

module.exports = Connection
