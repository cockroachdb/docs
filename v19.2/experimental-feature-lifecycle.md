---
title: The Lifecycle of Experimental, Beta, and Stable Features
summary: The expected lifecycle of features initially marked as "experimental".
toc: true
---

Cockroach Labs works with users and customers to design and prototype features such that the initial release of a new feature in a new major
version of CockroachDB can be considered stable and ready for use. Some features, however, require a longer trial periods in which Cockroach Labs can gather and incorporate feedback from users in real-world scenarios.

As features are released with varying levels of stability, we document all features that are not stable for production environments as “experimental” or "beta". After extensive testing, [experimental features](experimental-features.html) might be marked as “beta”. Then, after patch revisions from user feedback and design iterations have stabilized the feature, it can be considered stable.

These three stages correspond to different levels of commitment from Cockroach Labs to provide support and guarantee forward
compatibility for feature-specific APIs:

| Guarantee                                                                               | Experimental | Beta              | Stable          |
|-----------------------------------------------------------------------------------------|--------------|-------------------|-----------------|
| Client/app built on patch revision *N*.X works on revision *N*.X+1                          | No guarantee | Yes (best effort) | Yes             |
| Client/app built on major version *N* works on version *N*+1 with only configuration change | No guarantee | Yes (best effort) | Yes             |
| Client/app built on major version *N* works on version *N*+1 without any changes            | No guarantee | No guarantee      | Yes (see below) |
| Client/app built on major version *N* works on version *N*+2 with only configuration change | No guarantee | No guarantee      | Yes (see below) |
| Client/app built on major version *N* works on version *N*+2 without any changes            | No guarantee | No guarantee      | Yes (see below) |

Stable features are linked to [stronger API stability and forward compatibility guarantees](compatibility-and-programmability-guarantees.html).

## Experimental markers in the SQL syntax

In addition to mentioning the “experimental” or “beta” status in the documentation, a feature may be marked as such directly in its API:

- By including the prefix `experimental_` in the name of an
  identifier, for example in [session variables](show-vars.html) or
  [built-in functions](functions-and-operators.html).
- By including the keyword `EXPERIMENTAL` in the SQL syntax,
  for example in [SQL statements](sql-statements.html).

## See also

- [The Lifecycle of Experimental, Beta, and Stable Features](experimental-features.html)
- [Interface Types](interface-types.html)
- [Stability Guarantees](compatibility-and-programmability-guarantees.html)
- [Overview of CockroachDB Interfaces](overview-of-apis-and-interfaces.html)
