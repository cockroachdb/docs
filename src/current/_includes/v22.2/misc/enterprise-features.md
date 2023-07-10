## Cluster optimization

Feature | Description
--------+-------------------------
[Follower Reads](follower-reads.html) | Reduce read latency in multi-region deployments by using the closest replica at the expense of reading slightly historical data.
[Multi-Region Capabilities](multiregion-overview.html) | Row-level control over where your data is stored to help you reduce read and write latency and meet regulatory requirements.
[Node Map](enable-node-map.html) | Visualize the geographical distribution of a cluster by plotting its node localities on a world map.

## Recovery and streaming

Feature | Description
--------+-------------------------
Enterprise [`BACKUP`](backup.html) and restore capabilities | Taking and restoring [incremental backups](take-full-and-incremental-backups.html), [backups with revision history](take-backups-with-revision-history-and-restore-from-a-point-in-time.html), [locality-aware backups](take-and-restore-locality-aware-backups.html), and [encrypted backups](take-and-restore-encrypted-backups.html) require an Enterprise license. [Full backups](take-full-and-incremental-backups.html) do not require an Enterprise license.
[Changefeeds into a Configurable Sink](create-changefeed.html) | For every change in a configurable allowlist of tables, configure a changefeed to emit a record to a configurable sink: Apache Kafka, cloud storage, Google Cloud Pub/Sub, or a webhook sink. These records can be processed by downstream systems for reporting, caching, or full-text indexing.

## Security and IAM

Feature | Description
--------+-------------------------
[Encryption at Rest](security-reference/encryption.html#encryption-at-rest-enterprise) | Enable automatic transparent encryption of a node's data on the local disk using AES in counter mode, with all key sizes allowed. This feature works together with CockroachDB's automatic encryption of data in transit.
[GSSAPI with Kerberos Authentication](gssapi_authentication.html) | Authenticate to your cluster using identities stored in an external enterprise directory system that supports Kerberos, such as Active Directory.
[Cluster Single Sign-on (SSO)](sso-sql.html) | Grant SQL access to a cluster using JSON Web Tokens (JWTs) issued by an external identity provider (IdP) or custom JWT issuer.
[Single Sign-on (SSO) for DB Console](sso-db-console.html) | Grant access to a cluster's DB Console interface using SSO through an IdP that supports OIDC.
