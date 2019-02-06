---
title: Interface types
summary: Programmable, non-programmable and reserved interfaces in CockroachDB.
toc: true
---

Cockroach Labs understands the need of users to rely on stable product
interfaces that they can use to build further tooling and automation.
Meanwhile, we have found from observing users that certain interfaces
are mostly used interactively.

We capture this difference by separating
[**programmable**](#public-and-programmable-interfaces) interfaces,
suitable for automation, from
[**non-programmable**](#public-and-non-programmable-interfaces)
interfaces which are meant for human consumption.

Our [strong API stability and forward compatibility
guarantees](compatibility-and-programmability-guarantees.html) are
limited to those interfaces marked as programmable. The motivation is
to limit the engineering burden incurred by a strong commitment to
stability and forward compatibility, and enable faster and nimble
evolutions of features intended for interactive use.

Additionally, certain features exist only as a mean to aid
development of CockroachDB itself and not meant to be consumed by
end-users. However, because CockroachDB is an open source project, users
often stumble upon these interfaces. To prevent users from accidentally
starting to rely on an internal interface without any stability
guarantee, we aim to call them out explicitly as [**reserved**](#reserved-interfaces).

## Public and programmable interfaces

These interfaces are meant for interfacing with third party automated
tools. For example, the output of a `SELECT` query is public and
programmable.

The full list of public and programmable interfaces is given in the
[Overview of APIs and
interfaces](overview-of-apis-and-interfaces.html) and its linked sub-pages.

For these interfaces, an app/client that works with major version N is
expected to work with all patch revisions. Compatibility with version
N+1 and later depends on the stability phase, as detailed in
[Experimental feature lifecycle](experimental-feature-lifecycle.html).

Additionally, the CockroachDB team commits to documenting remaining
programmable interfaces over time, and/or upon request.

## Public and non-programmable interfaces

These interfaces are meant to be consumed by humans and are not
suitable for automation. For example, the output of SQL `SHOW`
statements is public but non-programmable.

A partial list of public and non-programmable interfaces is given in the
[Overview of APIs and
interfaces](overview-of-apis-and-interfaces.html) and its linked sub-pages.

For these interfaces, the stability guarantees are as follows:

- the particular data format of the inputs and outputs may change across patch
  revisions, although the CockroachDB team will make some effort to avoid this;
- the particular data format of the inputs and outputs are likely to change
  across major versions.

These interfaces may not be documented, but can be incidentally
explained on-demand by the CockroachDB team during discussions on
public forums or during troubleshooting sessions. **Users are invited
to reuse this knowledge.**

## Reserved interfaces

These interfaces are meant for use by CockroachDB developers and are
not suitable for use, neither in automation by 3rd parties, nor by
external documentation that aims to remain relevant across CockroachDB
revisions.

For example, the contents of certain tables in the
`crdb_internal` SQL virtual schema is a reserved interface.

**As a general rule, an interface should be considered reserved if it is
not explicitly documented as public.** A partial list of reserved
interfaces is given in the [Overview of APIs and
interfaces](overview-of-apis-and-interfaces.html) and its linked
sub-pages.

For these, the stability guarantees are as follows:

- the particular data format of inputs or outputs may change between
  patch revisions.
- there is no expectation of accurate nor up-to-date documentation.

## See also

- [Compatibility and programmability guarantees](compatibility-and-programmability-guarantees.html)
- [Overview of APIs and interfaces](overview-of-apis-and-interfaces.html)
