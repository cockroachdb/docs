---
title: Interface Types
summary: Programmable, non-programmable and reserved interfaces in CockroachDB.
toc: true
---

To offer stability for tooling and automation, we separate CockroachDB interfaces into two stability categories: [**programmable**](#programmable-interfaces) interfaces, which are suitable for automation, testing, and other tooling, and [**non-programmable**](#non-programmable-interfaces) interfaces, which are meant for human consumption.

To enable the rapid development and improvement of CockroachDB features, our [API stability and forward compatibility guarantees](compatibility-and-programmability-guarantees.html) are limited to **programmable** interfaces.

Some CockroachDB features were created for the engineers who develop CockroachDB. These internal features are not meant to be consumed by users, but are often discovered through exposed interfaces. To prevent users from relying on unstable internal interfaces, we do not document how to use these features, and we refer to them as [**reserved**](#reserved-interfaces) interfaces.

## Programmable interfaces

Programmable interfaces are meant for interfacing with automated third-party tools. For example, the output of a [`SELECT`](selection-queries.html) query is programmable, as its output is stable across releases and ready for consumption by automated tooling.

For programmable interfaces, an application or client that works with major version *N* is
expected to work with [all releases of CockroachDB](compatibility-and-programmability-guarantees.html#version-and-patch-definitions). Compatibility with version
*N*+1 and later depends on the stability phase, as detailed in
[Experimental feature lifecycle](experimental-feature-lifecycle.html).

Cockroach Labs is committed to documenting all programmable interfaces over time, but some interfaces might not yet be documented. If there is a programmable feature that you believe should be documented, please open a GitHub issue in our [open-source documentation repo](https://github.com/cockroachdb/docs/issues/new).

## Non-programmable interfaces

Non-programmable interfaces are meant to be consumed by humans and are not suitable for automation. For example, the output of a SQL [`SHOW`](show-vars.html)
statement is exposed and documented, but non-programmable, as the output it meant to be read, but it may change significantly across minor releases.

Although Cockroach Labs aims for stable input/output formats for these interfaces, the stability guarantees for non-programmable interfaces are as follows:

- The data format of the inputs and outputs may change across patch
  revisions.
- The data format of the inputs and outputs are likely to change
  across major versions.

Not all of the non-programmable interfaces are documented. If you have a question or request regarding the usage of a non-programmable interface, please let us know on [the CockroachDB forum](https://forum.cockroachlabs.com/), or open a GitHub issue in our [open-source documentation repo](https://github.com/cockroachdb/docs/issues/new).

## Reserved interfaces

Reserved interfaces are meant for use by CockroachDB developers and are not suitable for any other use. These interfaces contrast with other programmable and non-programmable public interfaces. All other interfaces that are not explicitly documented as programmable or non-programmable, public features should be considered reserved. For example, some tables in the `crdb_internal` SQL virtual schema are reserved.

For reserved interfaces, the stability guarantees are as follows:

- The particular data format of inputs or outputs may change between
  patch revisions.
- We cannot guarantee accurate and up-to-date documentation.

## See also

- [Stability Guarantees](compatibility-and-programmability-guarantees.html)
- [Overview of APIs and interfaces](overview-of-apis-and-interfaces.html)
