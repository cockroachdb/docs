---
title: Managed CockroachDB Security
summary: Learn about the authentication, encryption, authorization, and audit log features for Managed CockroachDB clusters.
toc: true
build_for: [managed]
---

A Managed CockroachDB cluster is single-tenant (no shared machines) running in a Virtual Private Cloud (no shared network) and has data encryption-in-flight enabled by default. Additionally, Managed CockroachDB provides authentication, authorization, and SQL audit logging features to secure your clusters.

The following table summarizes the Managed CockroachDB security features and provides links to detailed documentation for each feature where applicable.

Security feature | Description
-------------|------------
[Authentication](managed-authentication.html) | <ul><li>Inter-node and node identity authentication using TLS 1.2</li><li>Client identity authentication using TLS 1.2 or username/password</li></ul>
Encryption | <ul><li>Encryption in flight using TLS 1.2</li>
[Authorization](managed-authorization.html) | <ul><li>User Authorization: <ul><li>Users and privileges</li><li> Role-based access control</li></ul><li>Network authorization</li></ul>
[Audit logging](managed-sql-audit-logging.html) | `ALTER TABLE...EXPERIMENTAL AUDIT` to get detailed information about queries being executed against your system
