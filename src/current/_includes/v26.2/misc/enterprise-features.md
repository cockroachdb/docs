## Cluster optimization

Feature | Description
--------+-------------------------
[Read Committed isolation]({% link {{ page.version.version }}/read-committed.md %}) | Achieve predictable query performance at high workload concurrencies, but without guaranteed transaction serializability.
[Follower Reads]({% link {{ page.version.version }}/follower-reads.md %}) | Reduce read latency in multi-region deployments by using the closest replica at the expense of reading slightly historical data.
[Multi-Region Capabilities]({% link {{ page.version.version }}/multiregion-overview.md %}) | Row-level control over where your data is stored to help you reduce read and write latency and meet regulatory requirements.
[PL/pgSQL]({% link {{ page.version.version }}/plpgsql.md %}) | Use a procedural language in [user-defined functions]({% link {{ page.version.version }}/user-defined-functions.md %}) and [stored procedures]({% link {{ page.version.version }}/stored-procedures.md %}) to improve performance and enable more complex queries.
[Node Map]({% link {{ page.version.version }}/enable-node-map.md %}) | Visualize the geographical distribution of a cluster by plotting its node localities on a world map.
[Generic query plans]({% link {{ page.version.version }}/cost-based-optimizer.md %}#query-plan-type) | Improve performance for prepared statements by enabling generic plans that eliminate most of the query latency attributed to planning.
[`VECTOR` type]({% link {{ page.version.version }}/vector.md %}) | Represent data points in multi-dimensional space, using fixed-length arrays of floating-point numbers.

## Recovery and streaming

Feature | Description
--------+-------------------------
[`BACKUP`]({% link {{ page.version.version }}/backup.md %}) and restore capabilities | Taking and restoring [full backups]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}), [incremental backups]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}), [backups with revision history]({% link {{ page.version.version }}/take-backups-with-revision-history-and-restore-from-a-point-in-time.md %}), [locality-aware backups](take-and-restore-locality-aware-backups.html), and [encrypted backups](take-and-restore-encrypted-backups.html).
[Changefeeds into a Configurable Sink]({% link {{ page.version.version }}/create-changefeed.md %}) | For every change in a configurable allowlist of tables, configure a changefeed to emit a record to a configurable sink: Apache Kafka, cloud storage, Google Cloud Pub/Sub, or a webhook sink. These records can be processed by downstream systems for reporting, caching, or full-text indexing.
[Change Data Capture Queries]({% link {{ page.version.version }}/cdc-queries.md %}) | Use `SELECT` queries to filter and modify change data before sending it to a changefeed's sink.
[Physical Cluster Replication]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %}) | Send all data at the byte level from a primary cluster to an independent standby cluster. Existing data and ongoing changes on the active primary cluster, which is serving application data, replicate asynchronously to the passive standby cluster.

## Security and IAM

Feature | Description
--------+-------------------------
[Encryption at Rest]({% link {{ page.version.version }}/security-reference/encryption.md %}#encryption-at-rest-enterprise) | Enable automatic transparent encryption of a node's data on the local disk using AES in counter mode, with all key sizes allowed. This feature works together with CockroachDB's automatic encryption of data in transit.
[Column-level encryption]({% link {{ page.version.version }}/column-level-encryption.md %}) | Encrypt specific columns within a table.
[GSSAPI with Kerberos Authentication]({% link {{ page.version.version }}/gssapi_authentication.md %}) | Authenticate to your cluster using identities stored in an external enterprise directory system that supports Kerberos, such as Active Directory.
[Cluster Single Sign-on (SSO)]({% link {{ page.version.version }}/sso-sql.md %}) | Grant SQL access to a cluster using JSON Web Tokens (JWTs) issued by an external identity provider (IdP) or custom JWT issuer.
[Single Sign-on (SSO) for DB Console]({% link {{ page.version.version }}/sso-db-console.md %}) | Grant access to a cluster's DB Console interface using SSO through an IdP that supports OIDC.
[Role-based SQL Audit Logs]({% link {{ page.version.version }}/role-based-audit-logging.md %}) | Enable logging of queries being executed against your system by specific users or roles.
[Certificate-based authentication using multiple values from the X.509 Subject field]({% link {{ page.version.version }}/certificate-based-authentication-using-the-x509-subject-field.md %}) | Map SQL user [roles]({% link {{ page.version.version }}/security-reference/authorization.md %}#roles) to values in the Subject field of the [X.509 certificate](https://en.wikipedia.org/wiki/X.509) used for [TLS authentication]({% link {{ page.version.version }}/security-reference/transport-layer-security.md %}#what-is-transport-layer-security-tls).
