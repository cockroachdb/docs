---
title: Compatibility and programmability guarantees
summary: Stability commitment of various APIs throughout the lifecycle of CockroachDB.
toc: true
---

This page outlines the stability guarantees offered with CockroachDB's
[external interfaces](overview-of-apis-and-interfaces.html).

## Overview

### API stability in relation to CockroachDB's lifecycle

Cockroach Labs uses patch revisions as a way to push corrections of
implementation mistakes towards users (bug fixes and other
adjustments). We expect users to be able to adopt patch revisions
frequently, without fearing their applications will break in this
process. The counterpoint is a **guarantee of API stability across
patch revisions**.

To reduce the internal complexity of CockroachDB around live
upgrades, users are required to step through intermediate
versions. We acknowledge this process is somewhat inconvenient.  To
reduce this inconvenience, we choose to limit this requirement to
intermediate major versions.  This in turn implies that **major
changes will only be introduced in major versions**.

### Scope of API stability

Stability mainly matters when an interface is exploited by
automation: stability ensures that this automation is preserved.
However, a commitment to stability also comes with an engineering
burden.

To reduce this burden and preserve Cockroach Labs's ability to move
CockroachDB forward, Cockroach Labs designs separate [programmable and
non-programmable interfaces](interface-types.html) and restricts the
stronger API stability guarantees to just those interfaces marked as
programmable.

### Introduction of new APIs

When introducing new features or performing changes in CockroachDB,
Cockroach Labs wishes to preserve a period of time to gather feedback
from users and potentially make API changes accordingly. We thereby
introduce [intermediate **experimental** and **beta**
stages](experimental-feature-lifecycle.html)
during which new APIs may change more frequently or more radically.

### API evolution

In rare cases, we may find overwhelming evidence that the current
behavior of a public API is inadequate for most users. This includes
security vulnerabilities, or cases where CockroachDB's behavior is
incompatible with the expectation of 3rd-party PostgreSQL client
applications or frameworks. In those cases, we may choose to
introduce an API change in a patch revision to facilitate adoption
of CockroachDB, with extra care to preserve compatibility with
existing CockroachDB client apps. We enumerate these [**exceptions
to the stability guarantees**](#exceptions-to-stability-guarantees)
below.

## Definitions

Major versions are identified by the first two numbers in the full
version string, and patch revisions are identified by the last number
in the string.

For example:

| Version string | Major version | Patch revision |
|----------------|---------------|----------------|
| 2.1            | 2.1           | 0              |
| 2.1.4          | 2.1           | 4              |
| 19.1           | 19.1          | 0              |
| 19.1.2         | 19.1          | 2              |

## Exceptions to stability guarantees

Generally, the CockroachDB team will attempt to preserve compatibility
with existing CockroachDB apps built on major version N with versions N+1,
N+2 and further. There are four main exceptions to this rule however:

| Situation in “stable” phase of major version N                  | Earliest version where change can occur, if backward-compatible with existing apps | Earliest version where change can occur, when backward-incompatible |
|-----------------------------------------------------------------|------------------------------------------------------------------------------------|---------------------------------------------------------------------|
| [Implementation errors](#implementation-errors) (bugs)          | N.(X+1)  (patch revision)                                                          | N.(X+1) or N+1 depending on severity                                |
| [Compatibility with PostgreSQL](#compatibility-with-postgresql) | N.(X+1)  (patch revision)                                                          | N.(X+1) opt-in<br>N+1 opt-out<br>N+2  definitive                    |
| [Architectural changes](#architectural-changes)                 | N+1                                                                                | N+2                                                                 |
| [Product evolution](#product-evolution)                         | N+1                                                                                | N+2                                                                 |

Examples:

- a bug is found in version 19.1.2. A bug fix is available, which does
  not require changes to client apps. This fix may be implemented in
  version 19.1.3.
- a minor bug is found in version 19.1.3. A bug fix is available, but
  requires minor changes to client apps or a cluster configuration
  variable. This fix may be implemented no earlier than version 19.2.

### Implementation errors

If a public interface misbehaves in a way
that is blatantly against expectations, this may be fixed
in a subsequent patch revision.

For example, the check for SQL access privileges (security), or the
output of a SQL built-in function on edge case inputs, can be
corrected across patch revisions.

The CockroachDB team will work (via testing) to ensure that existing
clients/tools are not negatively impacted by bug fixes; however
there will be no consideration for tooling built expressely to rely
on blatantly mis-behaving interfaces.

### Compatibility with PostgreSQL

If a feature combines the following properties:

- It is supported both by CockroachDB and PostgreSQL.
- Its interface is programmable.
- Its behavior differs between CockroachDB and PostgreSQL.
- There are well-known or sufficiently-widely used 3rd party apps built for PostgreSQL which do not react well to the CockroachDB behavior.
- Changing CockroachDB to become more alike to PostgreSQL will not be overly disruptive to existing CockroachDB-specific apps.

Then, CockroachDB will evolve to adopt the PostgreSQL behavior. This
may occur in the next patch revision if there is a way to make the
change invisible to existing CockroachDB apps. Once the change is
prepared by Cockroach Labs, it will be finalized and published at the
latest in major version N+2 if the change also requires changing
existing CockroachDB apps. In-between, the compatibility may be
adjustable with session variables or cluster settings.

For example, the rules to derive data types for intermediate results
in complex [SQL scalar expressions](scalar-expressions.html) may
evolve in this way.

### Architectural changes

If a feature is based off an architectural choice inside CockroachDB,
and the architecture of CockroachDB evolves in such a way that the
feature becomes non-sensical or overly costly to maintain, it may be
changed or removed in the next major release.

For example, the structure and meaning of the output of the [`EXPLAIN`
statement](explain.html) changes radically across major versions of
CockroachDB due to the evolution of its query optimizer.

### Product evolution

When Cockroach Labs decides to evolve
CockroachDB to better match demand by users, some existing public
interfaces may change.

In that case, existing clients will continue to work for patch
revisions in the current major version and next, but may need to
evolve in version N+2.

For example, the features and particular data output of [`cockroach`
sub-commands](cockroach-commands.html) is
likely to evolve in this way.

## See also

- [Interface types](interface-types.html)
- [Experimental feature lifecycle](experimental-feature-lifecycle.html)
- [Overview of APIs and interfaces](overview-of-apis-and-interfaces.html)
