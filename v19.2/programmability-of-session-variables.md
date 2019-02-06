---
title: Programmability of SQL session variables
summary: Which session variables can be considered programmable and future compatibility guarantees.
toc: false
---

The SQL session variables are customizable in each separate client
session using [`SET`](set-vars.html) and can be queried using
e.g. [`SHOW`](show-vars.html).

The set of supproted session variable is a combination of

- a subset of session variables also supported by PostgreSQL, where
  they are also called "run-time parameters".
- additional session variables specific to CockroachDB.

The specific [stability and forward compatibility
guarantees](compatibility-and-programmability-guarantees.html)
associated with session variables are listed in the table below.

| Component                                                                          | Status if feature documented on this site                                                    | Status if not documented on this site |
|------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------|---------------------------------------|
| Effect and configurability of variable whose name contains the word `experimental` | [public and programmable] with  [“experimental” status](experimental-feature-lifecycle.html) | [reserved]                            |
| Effect and configurability of variable, when identical to PostgreSQL               | [public and programmable]                                                                    | [public and programmable]             |
| Effect and configurability of variable, when incomplete compared to PostgreSQL     | [public and programmable] with  [“experimental” status](experimental-feature-lifecycle.html) | [public and non-programmable]         |
| Effect and configurability of variable, when CockroachDB-specific                  | [public and programmable]                                                                    | [reserved]                            |

## See also

- [`SET` (session variable)](set-vars.html)
- [`SHOW` (session variable)](show-vars.html)
- [Interface types](interface-types.html)
- [Compatibility and programmability guarantees](compatibility-and-programmability-guarantees.html)
- [Experimental feature lifecycle](experimental-feature-lifecycle.html)
- [Overview of APIs and interfaces](overview-of-apis-and-interfaces.html)

[public and programmable]: interface-types.html#public-and-programmable-interfaces
[public and non-programmable]: interface-types.html#public-and-non-programmable-interfaces
[reserved]: interface-types.html#reserved-interfaces
