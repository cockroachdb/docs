---
title: Client-server protocol
summary: Compatibility and stability guarantees for the low-level SQL wire protocol
toc: true
---

CockroachDB uses a subset of the low level client-server byte protocol
as PostgreSQL, called "pgwire" inside CockroachDB's source code and
"Frontend/Backend protocol" inside PostgreSQL.

For those wire protocol features that are common between PostgreSQL
and CockroachDB, the [forward compatibility
guarantees](compatibility-and-programmability-guarantees.html) are
spelled out in this table:

| Component                                                       | Status                        |
|-----------------------------------------------------------------|-------------------------------|
| Client status parameters passed during connection set-up        | [public and programmable]     |
| Server status parameters passed during connection set-up        | [public and programmable]     |
| Text data encoding for values                                   | [public and programmable]     |
| Binary data encoding for values                                 | [public and programmable]     |
| Error code 40001 for [retry errors](transactions.html)          | [public and programmable]     |
| Error codes for other errors, error message text for all errors | [public and non-programmable] |

## See also

- [PostgreSQL Frontend/Backend Protocol](https://www.postgresql.org/docs/11/protocol.html)
- [Client drivers](install-client-drivers.html)
- [Client connection parameters](connection-parameters.html)
- [Interface types](interface-types.html)
- [Compatibility and programmability guarantees](compatibility-and-programmability-guarantees.html)
- [Overview of APIs and interfaces](overview-of-apis-and-interfaces.html)

[public and programmable]: interface-types.html#public-and-programmable-interfaces
[public and non-programmable]: interface-types.html#public-and-non-programmable-interfaces
[reserved]: interface-types.html#reserved-interfaces
