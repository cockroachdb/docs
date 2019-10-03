---
title: Stability Guarantees
summary: Stability commitment of various APIs throughout the lifecycle of CockroachDB.
toc: true
---

This page outlines the stability guarantees for CockroachDB's [interfaces](overview-of-apis-and-interfaces.html) around CockroachDB's lifecycle.

## Overview

### Interface stability in CockroachDB's lifecycle

Cockroach Labs pushes bug fixes and other updates as patch revisions to CockroachDB, with the goal that the changes will not break user applications. For [programmable interfaces](interface-types.html), we provide an API stability guarantee across patch revisions. Note that [exceptions to these stability guarantees](#exceptions-to-stability-guarantees) apply.

Note that users are required to step through intermediate major versions when migrating to a newer version, as major
changes are only introduced in major version releases. This process reduces the internal complexity of CockroachDB around live
upgrades.

### New interfaces

When introducing new features or changes to CockroachDB,
Cockroach Labs reserves a period of time to process and incorporate feedback
from users. During these [intermediate **experimental** and **beta**
stages](experimental-feature-lifecycle.html), changes to new interfaces can be larger and more frequent.

### Interface updates

In the presence of serious concerns about the behavior of a public interface, Cockroach Labs might need to update the interface.
Updates to stable interfaces are rare, and typically occur in cases of security vulnerabilities, or cases where CockroachDB's behavior is
incompatible with 3rd-party PostgreSQL client applications or frameworks.
To introduce API changes, we use patch revisions that preserve compatibility with
existing CockroachDB client applications. We enumerate the [**exceptions
to the stability guarantees**](#exceptions-to-stability-guarantees) below.

## Version and patch definitions

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

Cockroach Labs attempts to preserve compatibility between a CockroachDB major version *N* and existing applications built on major versions *N*, *N*+1, and later. There are four main exceptions to this rule: [Implementation errors](#implementation-errors) (bugs), [Incompatibility with PostgreSQL](#compatibility-with-postgresql), [Architectural changes](#architectural-changes), and [Product changes](#product-changes).

| Issue in “stable” phase of major version *N*                  | Earliest version where change can occur, if backward-compatible with existing apps | Earliest version where change can occur, when backward-incompatible |
|-----------------------------------------------------------------|------------------------------------------------------------------------------------|---------------------------------------------------------------------|
| Implementation errors (bugs)          | *N*.(X+1)  (patch revision)                                                          | *N*.(X+1) or *N*+1 depending on severity                                |
| Incompatibility with PostgreSQL | *N*.(X+1)  (patch revision)                                                          | *N*.(X+1) opt-in<br>*N*+1 opt-out<br>*N*+2  definitive                    |
| Architectural changes                | *N*+1                                                                                | *N*+2                                                                 |
| Product changes                      | *N*+1                                                                                | *N*+2                                                                 |

Examples:

- A bug is found in version 19.1.2. A bug fix is available, which does
  not require changes to client apps. This fix may be implemented in
  version 19.1.3.
- A minor bug is found in version 19.1.3. A bug fix is available, but
  requires minor changes to client apps or a cluster configuration
  variable. This fix may be implemented no earlier than version 19.2.

### Implementation errors

If a public interface does not behave as expected, this interface may be fixed
in a subsequent patch revision.

For example, the check for SQL access privileges, or the
output of a SQL built-in function on edge case inputs, can be
corrected across patch revisions.

Cockroach Labs uses extensive testing to ensure that existing
clients and tools are not negatively impacted by bug fixes.
Note that bug fixes are worked into patch releases with no consideration for
tooling that relies on mis-behaving interfaces.

### Compatibility with PostgreSQL

Cockroach Labs might determine that a CockroachDB feature needs to be updated to behave like PostgreSQL if:

- The feature is supported by both CockroachDB and PostgreSQL.
- The feature has a programmable interface.
- The feature's behavior differs between CockroachDB and PostgreSQL.
- There are well-known or sufficiently-widely used 3rd-party tools built for PostgreSQL that do not work well with existing CockroachDB behavior.
- Changing the feature to behave more like PostgreSQL would not be overly disruptive to existing CockroachDB-specific applications or features.

For example, the rules to derive data types for intermediate results in complex [SQL scalar expressions](scalar-expressions.html) might be subject to change in order to behave more like PostgreSQL.

Changes for PostgreSQL compatibility may occur in a new patch revision if there is a way to make the
change without disrupting existing CockroachDB applications or features. If the change also requires changing
existing CockroachDB applications or features, after the change is
prepared by Cockroach Labs, it will be finalized and published at the
latest in major version *N*+2.

During an update's development period,
compatibility with PostgreSQL may also be configurable with other CockroachDB interfaces,
such as [session variables](set-vars.html) or [cluster settings](cluster-settings.html).

### Architectural changes

If a feature is based on an architectural choice inside CockroachDB,
and the architecture of CockroachDB changes in such a way that the
feature is no longer needed, that feature might be changed or removed in the next major release.

For example, the output of the [`EXPLAIN` statement](explain.html) has changed significantly across major versions of
CockroachDB due to the evolution of the [query optimizer](cost-based-optimizer.html).

### Product changes

When Cockroach Labs decides to change CockroachDB to better match the needs of users, some existing public interfaces may change. In such cases, existing clients will continue to work for patch revisions in the current major version and next, but may need to change in version *N*+2.

For example, the features and data output of [`cockroach` commands](cockroach-commands.html) have changed across releases.

## See also

- [Interface Types](interface-types.html)
- [The Lifecycle of Experimental, Beta, and Stable Features](experimental-feature-lifecycle.html)
- [Overview of CockroachDB Interfaces](overview-of-apis-and-interfaces.html)
