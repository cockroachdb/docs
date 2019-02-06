---
title: Experimental, beta and stable features
summary: The expected lifecycle of features initially marked as "experimental".
toc: true
---

New features are usually designed and prototyped in collaboration with
users and customers, so that their initial release in a new major
version of CockroachDB can be considered stable and ready for use
immediately.

Some features, however, require a longer period of time to explore uses
in real-world scenarios, gather feedback and potentially make API
changes accordingly.

For this purpose, features may be released first with an “experimental” marker.
At a later stage, they may be also marked as “beta”.
Finally, when user feedback and design iterations have stabilized the
result, the feature can be considered “stable”.

These three stages correspond to different levels of commitment from
Cockroach Labs to provide support and preserve API forward
compatibility, as follows:

| Guarantee                                                                               | Experimental | Beta              | Stable          |
|-----------------------------------------------------------------------------------------|--------------|-------------------|-----------------|
| Client/app built on patch revision N.X works on revision N.X+1                          | No guarantee | Yes (best effort) | Yes             |
| Client/app built on major version N works on version N+1 with only configuration change | No guarantee | Yes (best effort) | Yes             |
| Client/app built on major version N works on version N+1 without any changes            | No guarantee | No guarantee      | Yes (see below) |
| Client/app built on major version N works on version N+2 with only configuration change | No guarantee | No guarantee      | Yes (see below) |
| Client/app built on major version N works on version N+2 without any changes            | No guarantee | No guarantee      | Yes (see below) |

Stable features are linked to [stronger API stability and forward compatibility guarantees](compatibility-and-programmability-guarantees.html).

## Experimental markers in the SQL syntax

In addition to mentioning the “experimental” or “beta” status in the documentation,
a feature may be marked in its API directly:

- By including the prefix `experimental_` in the name of an
  identifier, for example in [session variables](show-vars.html) or
  [built-in functions](functions-and-operators.html).
- By including the keyword `EXPERIMENTAL` in the SQL syntax,
  for example in [SQL statements](sql-statements.html).

## See also

- [List of experimental features](experimental-features.html)
- [Interface types](interface-types.html)
- [Compatibility and programmability guarantees](compatibility-and-programmability-guarantees.html)
- [Overview of APIs and interfaces](overview-of-apis-and-interfaces.html)
