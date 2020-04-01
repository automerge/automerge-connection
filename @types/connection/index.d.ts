declare module 'connection' {

  class Connection<T> {
    constructor(docSet: DocSet<T>, sendMsg: (msg: Message) => void)
    close(): void
    docChanged(docId: string, doc: Doc<T>): void
    maybeSendChanges(docId: string): void
    open(): void
    receiveMsg(msg: Message): Doc<T>
    sendMsg(docId: string, clock: Clock, changes: Automerge.Change[]): void
  }

  type DocSetHandler<T> = (docId: string, doc: Doc<T>) => void

  class DocSet<T> {
    constructor()
    applyChanges(docId: string, changes: Automerge.Change[]): T
    getDoc(docId: string): Doc<T>
    removeDoc(docId: string): void
    setDoc(docId: string, doc: Doc<T>): void
    docIds: string[]
    registerHandler(handler: DocSetHandler<T>): void
    unregisterHandler(handler: DocSetHandler<T>): void
  }

  type WatchableDocHandler<T> = (doc: Doc<T>) => void

  class WatchableDoc<D, T = Proxy<D>> {
    constructor(doc: D)
    applyChanges(changes: Automerge.Change[]): D
    get(): D
    set(doc: D): void
    registerHandler(handler: WatchableDocHandler<T>): void
    unregisterHandler(handler: WatchableDocHandler<T>): void
  }

  interface Message {
    docId: string
    clock: Clock
    changes?: Change[]
  }

  interface Clock {
    [actorId: string]: number
  }

}
