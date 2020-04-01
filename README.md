# Automerge Connection

💬 [Join the Automerge Slack community](https://communityinviter.com/apps/automerge/automerge)

[![Build Status](https://travis-ci.org/automerge/automerge-connection.svg?branch=master)](https://travis-ci.org/automerge/automerge-connection)

This repository extends [Automerge](https://github.com/automerge/automerge) with a barebones
network protocol for syncing the state of a document between different devices.

The protocol is not tied to any particular transport protocol; you can run it over
[plain TCP](https://github.com/automerge/automerge-net),
[WebSocket](https://gitlab.com/codewitchbella/automerge-client-server),
[WebRTC](https://github.com/automerge/mpl),
or any other transport protocol that allows you to exchange a sequence of messages
between two peers. The only requirement is that within the scope of one connection,
messages do not get reordered or duplicated, and messages should only be dropped if
the connection as a whole is torn down.

More documentation to come. For now, you can just look at the code and the tests —
it's quite compact.

## License

Copyright 2017–2020, the Automerge contributors. Released under the terms of the
MIT license (see `LICENSE`).
