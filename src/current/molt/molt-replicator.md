---
title: MOLT Replicator
summary: Learn how to use the MOLT Replicator tool to continuously replicate changes from source databases to CockroachDB.
toc: true
docs_area: migrate
---

MOLT Replicator continuously replicates changes from a source database to CockroachDB as part of a [database migration]({% link molt/migration-overview.md %}). It supports migrations from a source database to CockroachDB with minimal downtime, and enables backfill from CockroachDB to your source database for failback scenarios to preserve a rollback option during a migration window.

MOLT Replicator consumes change data from PostgreSQL [logical replication](https://www.postgresql.org/docs/current/logical-replication.html) streams, MySQL [GTID-based replication](https://dev.mysql.com/doc/refman/8.0/en/replication-gtids.html), Oracle [LogMiner](https://docs.oracle.com/en/database/oracle/oracle-database/21/sutil/oracle-logminer-utility.html), and [CockroachDB changefeeds]({% link {{ site.current_cloud_version }}/change-data-capture-overview.md %}) (for failback). For details, refer to [How it works](#how-it-works).

## Terminology

- *Checkpoint*: The position in the source database's transaction log from which replication begins or resumes: LSN (PostgreSQL), GTID (MySQL), or SCN (Oracle).
- *Staging database*: A CockroachDB database used by Replicator to store replication metadata, checkpoints, and buffered mutations. Specified with [`--stagingSchema`]({% link molt/replicator-flags.md %}#staging-schema) and automatically created with [`--stagingCreateSchema`]({% link molt/replicator-flags.md %}#staging-create-schema). For details, refer to [Staging database](#staging-database).
- *Forward replication*: Replicate changes from a source database (PostgreSQL, MySQL, or Oracle) to CockroachDB during a migration. For usage details, refer to [Forward replication with initial load](#forward-replication-with-initial-load).
- *Failback*: Replicate changes from CockroachDB back to the source database. Used for migration rollback or to maintain data consistency on the source during migration. For usage details, refer to [Failback to source database](#failback-to-source-database).

## Prerequisites

### Supported databases

MOLT Replicator supports the following source and target databases:

- PostgreSQL 11-16
- MySQL 5.7, 8.0 and later
- Oracle Database 19c (Enterprise Edition) and 21c (Express Edition)
- CockroachDB (all currently [supported versions]({% link releases/release-support-policy.md %}#supported-versions))

### Database configuration

The source database must be configured for replication:

|            Database           |                                                                                                                                                                                                                                                                                        Configuration Requirements                                                                                                                                                                                                                                                                                        |                                                                Details                                                                 |
|-------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------|
| PostgreSQL source             | <ul><li>Enable logical replication by setting `wal_level = logical`.</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | [Configure PostgreSQL for replication]({% link molt/migrate-load-replicate.md %}#configure-source-database-for-replication)            |
| MySQL source                  | <ul><li>Enable [global transaction identifiers (GTID)](https://dev.mysql.com/doc/refman/8.0/en/replication-options-gtids.html) and configure binary logging. Set `binlog-row-metadata` or `binlog-row-image` to `full`.</li><li>Configure sufficient binlog retention for migration duration.</li></ul>                                                                                                                                                                                                                                                                                                  | [Configure MySQL for replication]({% link molt/migrate-load-replicate.md %}?filters=mysql#configure-source-database-for-replication)   |
| Oracle source                 | <ul><li>Install [Oracle Instant Client]({% link molt/migrate-load-replicate.md %}?filters=oracle#oracle-instant-client).</li><li>[Enable `ARCHIVELOG` mode]({% link molt/migrate-load-replicate.md %}?filters=oracle#enable-archivelog-and-force-logging), supplemental logging for primary keys, and `FORCE LOGGING`.</li><li>[Create sentinel table]({% link molt/migrate-load-replicate.md %}#create-source-sentinel-table) (`REPLICATOR_SENTINEL`) in source schema.</li><li>Grant and verify [LogMiner privileges]({% link molt/migrate-load-replicate.md %}#grant-logminer-privileges).</li></ul> | [Configure Oracle for replication]({% link molt/migrate-load-replicate.md %}?filters=oracle#configure-source-database-for-replication) |
| CockroachDB source (failback) | <ul><li>[Enable rangefeeds]({% link {{ site.current_cloud_version }}/create-and-configure-changefeeds.md %}#enable-rangefeeds) (`kv.rangefeed.enabled = true`) (CockroachDB {{ site.data.products.core }} clusters only).</li></ul>                                                                                                                                                                                                                                                                                                                                                                      | [Configure CockroachDB for replication]({% link molt/migrate-failback.md %}#prepare-the-cockroachdb-cluster)                           |

### User permissions

The SQL user running MOLT Replicator requires specific privileges on both the source and target databases:

|                    Database                    |                                                                                                                                                                                                                                                                Required Privileges                                                                                                                                                                                                                                                                 |                                                                                                                                                                                     Details                                                                                                                                                                                     |
|------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| PostgreSQL source                              | <ul><li>`SUPERUSER` role (recommended), or the following granular permissions:</li><li>`CREATE` and `SELECT` on database and tables to replicate.</li><li>Table ownership for adding tables to publications.</li><li>`LOGIN` and `REPLICATION` privileges to create replication slots and access replication data.</li></ul>                                                                                                                                                                                                                       | [Create PostgreSQL migration user]({% link molt/migrate-load-replicate.md %}#create-migration-user-on-source-database)                                                                                                                                                                                                                                                          |
| MySQL source                                   | <ul><li>`SELECT` on tables to replicate.</li><li>`REPLICATION SLAVE` and `REPLICATION CLIENT` privileges for binlog access.</li><li>For [`--fetchMetadata`]({% link molt/replicator-flags.md %}#fetch-metadata), either `SELECT` on the source database or `PROCESS` globally.</li></ul>                                                                                                                                                                                                                                                           | [Create MySQL migration user]({% link molt/migrate-load-replicate.md %}?filters=mysql#create-migration-user-on-source-database)                                                                                                                                                                                                                                                 |
| Oracle source                                  | <ul><li>`SELECT`, `INSERT`, `UPDATE` on `REPLICATOR_SENTINEL` table.</li><li>`SELECT` on `V$` views (`V$LOG`, `V$LOGFILE`, `V$LOGMNR_CONTENTS`, `V$ARCHIVED_LOG`, `V$LOG_HISTORY`).</li><li>`SELECT` on `SYS.V$LOGMNR_*` views (`SYS.V$LOGMNR_DICTIONARY`, `SYS.V$LOGMNR_LOGS`, `SYS.V$LOGMNR_PARAMETERS`, `SYS.V$LOGMNR_SESSION`).</li><li>`LOGMINING` privilege.</li><li>`EXECUTE` on `DBMS_LOGMNR`.</li><li>For Oracle Multitenant, the user must be a common user (prefixed with `C##`) with privileges granted on both CDB and PDB.</li></ul> | [Create Oracle migration user]({% link molt/migrate-load-replicate.md %}?filters=oracle#create-migration-user-on-source-database)<br><br>[Create sentinel table]({% link molt/migrate-load-replicate.md %}?filters=oracle#create-source-sentinel-table)<br><br>[Grant LogMiner privileges]({% link molt/migrate-load-replicate.md %}?filters=oracle#grant-logminer-privileges)  |
| CockroachDB target (forward replication)       | <ul><li>`ALL` on target database.</li><li>`CREATE` on schema.</li><li>`SELECT`, `INSERT`, `UPDATE`, `DELETE` on target tables.</li><li>`CREATEDB` privilege for creating staging schema.</li></ul>                                                                                                                                                                                                                                                                                                                                                 | [Create CockroachDB user]({% link molt/migrate-load-replicate.md %}#create-the-sql-user)                                                                                                                                                                                                                                                                                        |
| PostgreSQL, MySQL, or Oracle target (failback) | <ul><li>`SELECT`, `INSERT`, `UPDATE` on tables to fail back to.</li><li>For Oracle, `FLASHBACK` is also required.</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                        | [Grant PostgreSQL user permissions]({% link molt/migrate-failback.md %}#grant-target-database-user-permissions)<br><br>[Grant MySQL user permissions]({% link molt/migrate-failback.md %}?filter=mysql#grant-target-database-user-permissions)<br><br>[Grant Oracle user permissions]({% link molt/migrate-failback.md %}?filter=oracle#grant-target-database-user-permissions) |

## Installation

{% include molt/molt-install.md %}

### Docker usage

{% include molt/molt-docker.md %}

## How it works

MOLT Replicator supports forward replication from PostgreSQL, MySQL, and Oracle, and failback from CockroachDB:

- PostgreSQL source ([`pglogical`](#commands)): MOLT Replicator uses [PostgreSQL logical replication](https://www.postgresql.org/docs/current/logical-replication.html), which is based on publications and replication slots. You create a publication for the target tables, and a slot marks consistent replication points. MOLT Replicator consumes this logical feed directly and applies the data in sorted batches to the target.

- MySQL source ([`mylogical`](#commands)): MOLT Replicator relies on [MySQL GTID-based replication](https://dev.mysql.com/doc/refman/8.0/en/replication-gtids.html) to read change data from MySQL binlogs. It works with MySQL versions that support GTID-based replication and applies transactionally consistent feeds to the target. Binlog features that do not use GTIDs are not supported.

- Oracle source ([`oraclelogminer`](#commands)): MOLT Replicator uses [Oracle LogMiner](https://docs.oracle.com/en/database/oracle/oracle-database/21/sutil/oracle-logminer-utility.html) to capture change data from Oracle redo logs. Both Oracle Multitenant (CDB/PDB) and single-tenant Oracle architectures are supported. Replicator periodically queries LogMiner-populated views and processes transactional data in ascending SCN windows for reliable throughput while maintaining consistency.

- Failback from CockroachDB ([`start`](#commands)): MOLT Replicator acts as an HTTP webhook sink for a single CockroachDB changefeed. Replicator receives mutations from source cluster nodes, can optionally buffer them in a CockroachDB staging cluster, and then applies time-ordered transactional batches to the target database. Mutations are applied as [`UPSERT`]({% link {{ site.current_cloud_version }}/upsert.md %}) or [`DELETE`]({% link {{ site.current_cloud_version }}/delete.md %}) statements while respecting [foreign-key]({% link {{ site.current_cloud_version }}/foreign-key.md %}) and table dependencies.

### Consistency modes

MOLT Replicator supports three consistency modes for balancing throughput and transactional guarantees:

1. *Consistent* (failback mode only, default for CockroachDB sources): Preserves per-row order and source transaction atomicity. Concurrent transactions are controlled by [`--parallelism`]({% link molt/replicator-flags.md %}#parallelism).

1. *BestEffort* (failback mode only): Relaxes atomicity across tables that do not have foreign key constraints between them (maintains coherence within FK-connected groups). Enable with [`--bestEffortOnly`]({% link molt/replicator-flags.md %}#best-effort-only) or allow auto-entry via [`--bestEffortWindow`]({% link molt/replicator-flags.md %}#best-effort-window) set to a positive duration (such as `1s`).

	{{site.data.alerts.callout_info}}
	For independent tables (with no foreign key constraints), BestEffort mode applies changes immediately as they arrive, without waiting for the resolved timestamp. This provides higher throughput for tables that have no relationships with other tables.
	{{site.data.alerts.end}}

1. *Immediate* (default for PostgreSQL, MySQL, and Oracle sources): Applies updates as they arrive to Replicator with no buffering or waiting for resolved timestamps. For CockroachDB sources, provides highest throughput but requires no foreign keys on the target schema.

## Commands

MOLT Replicator provides the following commands:

|     Command      |                                                                                                                   Description                                                                                                                    |
|------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `pglogical`      | Replicate from PostgreSQL source to CockroachDB target using logical replication.                                                                                                                                                                |
| `mylogical`      | Replicate from MySQL source to CockroachDB target using GTID-based replication.                                                                                                                                                                  |
| `oraclelogminer` | Replicate from Oracle source to CockroachDB target using Oracle LogMiner.                                                                                                                                                                        |
| `start`          | Replicate from CockroachDB source to PostgreSQL, MySQL, or Oracle target ([failback mode](#failback-to-source-database)). Requires a CockroachDB changefeed with rangefeeds enabled.                                                             |
| `make-jwt`       | Generate JWT tokens for authorizing changefeed connections in failback scenarios. Supports signing tokens with RSA or EC keys, or generating claims for external JWT providers. For details, refer to [JWT authentication](#jwt-authentication). |
| `version`        | Display version information and Go module dependencies with checksums. For details, refer to [Supply chain security](#supply-chain-security).                                                                                                    |

For command-specific flags and examples, refer to [Usage](#usage) and [Common workflows](#common-workflows).

## Flags

Refer to [Replicator Flags]({% link molt/replicator-flags.md %}).

## Usage

### Replicator commands

MOLT Replicator provides four commands for different replication scenarios. For detailed workflows, refer to [Common workflows](#common-workflows).

Use `pglogical` to replicate from PostgreSQL to CockroachDB:

{% include_cached copy-clipboard.html %}
~~~ shell
replicator pglogical
~~~

Use `mylogical` to replicate from MySQL to CockroachDB:

{% include_cached copy-clipboard.html %}
~~~ shell
replicator mylogical
~~~

Use `oraclelogminer` to replicate from Oracle to CockroachDB:

{% include_cached copy-clipboard.html %}
~~~ shell
replicator oraclelogminer
~~~

Use `start` to replicate from CockroachDB to PostgreSQL, MySQL, or Oracle (failback):

{% include_cached copy-clipboard.html %}
~~~ shell
replicator start
~~~

### Source connection strings

{{site.data.alerts.callout_success}}
Follow the security recommendations in [Connection security and credentials](#connection-security-and-credentials).
{{site.data.alerts.end}}

[`--sourceConn`]({% link molt/replicator-flags.md %}#source-conn) specifies the connection string of the source database for forward replication.

{{site.data.alerts.callout_info}}
The source connection string **must** point to the primary instance of the source database. Replicas cannot provide the necessary replication checkpoints and transaction metadata required for ongoing replication.
{{site.data.alerts.end}}

PostgreSQL connection string:

{% include_cached copy-clipboard.html %}
~~~
--sourceConn 'postgresql://{username}:{password}@{host}:{port}/{database}'
~~~

MySQL connection string:

{% include_cached copy-clipboard.html %}
~~~
--sourceConn 'mysql://{username}:{password}@{protocol}({host}:{port})/{database}'
~~~

Oracle connection string:

{% include_cached copy-clipboard.html %}
~~~
--sourceConn 'oracle://{username}:{password}@{host}:{port}/{service_name}'
~~~

For Oracle Multitenant databases, [`--sourcePDBConn`]({% link molt/replicator-flags.md %}#source-pdb-conn) specifies the pluggable database (PDB) connection. [`--sourceConn`]({% link molt/replicator-flags.md %}#source-conn) specifies the container database (CDB):

{% include_cached copy-clipboard.html %}
~~~
--sourceConn 'oracle://{username}:{password}@{host}:{port}/{cdb_service_name}'
--sourcePDBConn 'oracle://{username}:{password}@{host}:{port}/{pdb_service_name}'
~~~

For failback, [`--stagingConn`]({% link molt/replicator-flags.md %}#staging-conn) specifies the CockroachDB connection string:

{% include_cached copy-clipboard.html %}
~~~
--stagingConn 'postgresql://{username}:{password}@{host}:{port}/{database}'
~~~

### Target connection strings

[`--targetConn`]({% link molt/replicator-flags.md %}#target-conn) specifies the connection string of the target CockroachDB database for forward replication:

{% include_cached copy-clipboard.html %}
~~~
--targetConn 'postgresql://{username}:{password}@{host}:{port}/{database}'
~~~

{{site.data.alerts.callout_info}}
For failback, [`--targetConn`]({% link molt/replicator-flags.md %}#target-conn) specifies the original source database (PostgreSQL, MySQL, or Oracle). For details, refer to [Failback to source database](#failback-to-source-database).
{{site.data.alerts.end}}

### Replication checkpoints

MOLT Replicator requires a checkpoint value to start replication from the correct position in the source database's transaction log.

For PostgreSQL, use [`--slotName`]({% link molt/replicator-flags.md %}#slot-name) to specify the [replication slot created during the data load]({% link molt/migrate-load-replicate.md %}#start-fetch). The slot automatically tracks the LSN (Log Sequence Number):

{% include_cached copy-clipboard.html %}
~~~
--slotName molt_slot
~~~

For MySQL, set [`--defaultGTIDSet`]({% link molt/replicator-flags.md %}#default-gtid-set) to the [`cdc_cursor` value]({% link molt/molt-fetch.md %}#cdc-cursor) from the MOLT Fetch output:

{% include_cached copy-clipboard.html %}
~~~
--defaultGTIDSet '4c658ae6-e8ad-11ef-8449-0242ac140006:1-29'
~~~

For Oracle, set [`--scn`]({% link molt/replicator-flags.md %}#scn) and [`--backfillFromSCN`]({% link molt/replicator-flags.md %}#backfill-from-scn) to the [`cdc_cursor` values]({% link molt/molt-fetch.md %}#cdc-cursor) from the MOLT Fetch output:

{% include_cached copy-clipboard.html %}
~~~
--scn 26685786
--backfillFromSCN 26685444
~~~

### Staging database

The staging database stores replication metadata, checkpoints, and buffered mutations. Specify the staging database with [`--stagingSchema`]({% link molt/replicator-flags.md %}#staging-schema) in fully-qualified `database.schema` format and create it automatically with [`--stagingCreateSchema`]({% link molt/replicator-flags.md %}#staging-create-schema):

{% include_cached copy-clipboard.html %}
~~~
--stagingSchema defaultdb._replicator
--stagingCreateSchema
~~~

The staging database is used to:

- Store checkpoints that enable resuming from the correct point after interruptions.
- Buffer mutations before applying them to the target in transaction order.
- Maintain consistency for time-ordered transactional batches while respecting table dependencies.
- Provide restart capabilities after failures.

## Security

Cockroach Labs **strongly** recommends the following:

### Connection security and credentials

{% include molt/molt-secure-connection-strings.md %}

### CockroachDB changefeed security

For failback scenarios, secure the connection from CockroachDB to MOLT Replicator using TLS certificates. Generate TLS certificates using self-signed certificates, certificate authorities like Let's Encrypt, or your organization's certificate management system.

#### TLS from CockroachDB to Replicator

Configure MOLT Replicator with server certificates using the [`--tlsCertificate`]({% link molt/replicator-flags.md %}#tls-certificate) and [`--tlsPrivateKey`]({% link molt/replicator-flags.md %}#tls-private-key) flags to specify the certificate and private key file paths. For example:

{% include_cached copy-clipboard.html %}
~~~ shell
replicator start \
--tlsCertificate ./certs/server.crt \
--tlsPrivateKey ./certs/server.key \
...
~~~

These server certificates must correspond to the client certificates specified in the changefeed webhook URL to ensure proper TLS handshake.

Encode client certificates for changefeed webhook URLs:

- Webhook URLs: Use both URL encoding and base64 encoding: `base64 -i ./client.crt | jq -R -r '@uri'`
- Non-webhook contexts: Use base64 encoding only: `base64 -w 0 ca.cert`

#### JWT authentication

You can use JSON Web Tokens (JWT) to authorize incoming changefeed connections and restrict writes to a subset of SQL databases or user-defined schemas in the target cluster.

Replicator accepts any JWT token that meets the following requirements:

- Tokens must be signed using RSA or EC keys. HMAC and `None` signatures are automatically rejected.
- Tokens must include a `jti` (JWT ID) claim for revocation support.
- Tokens must include a custom claim with the schema authorization list.

{{site.data.alerts.callout_success}}
You can generate tokens using the [`make-jwt` command](#generate-jwt-tokens).
{{site.data.alerts.end}}

To configure JWT authentication:

1. Add PEM-formatted public signing keys to the `_replicator.jwt_public_keys` table in the staging database.

1. To revoke a specific token, add its `jti` value to the `_replicator.jwt_revoked_ids` table in the staging database.

The Replicator process re-reads these tables every minute to pick up changes.

To pass the JWT token from the changefeed to the Replicator webhook sink, use the [`webhook_auth_header` option]({% link {{ site.current_cloud_version }}/create-changefeed.md %}#options):

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE CHANGEFEED ... WITH webhook_auth_header='Bearer <encoded_token>';
~~~

##### Generate JWT tokens

The `make-jwt` command generates JWT tokens or claims for authorizing changefeed connections. It requires a signing key ([`-k`]({% link molt/replicator-flags.md %}#key)) and the database or schema to authorize ([`-a`]({% link molt/replicator-flags.md %}#allow)). You can output a signed token to a file ([`-o`]({% link molt/replicator-flags.md %}#out)) or generate an unsigned claim ([`--claim`]({% link molt/replicator-flags.md %}#claim)) for signing with an external JWT provider.

The format of the `-a` argument depends on your target database. For CockroachDB and PostgreSQL, which have a schema concept, use the `database.schema` format:

{% include_cached copy-clipboard.html %}
~~~ shell
replicator make-jwt -k ec.key -a database_name.schema_name -o out.jwt
~~~

For MySQL and Oracle, which do not have a schema concept, use only the database name:

{% include_cached copy-clipboard.html %}
~~~ shell
replicator make-jwt -k ec.key -a database_name -o out.jwt
~~~

{{site.data.alerts.callout_success}}
You can repeat the [`-a`]({% link molt/replicator-flags.md %}#allow) flag to authorize multiple schemas.
{{site.data.alerts.end}}

##### Token quickstart

The following example uses `OpenSSL` to generate keys, but any PEM-encoded RSA or EC keys will work. When using this example, ensure the `-a` argument format matches your target database as specified in [Generate JWT tokens](#generate-jwt-tokens).

{% include_cached copy-clipboard.html %}
~~~ shell
# Generate an EC private key using OpenSSL.
openssl ecparam -out ec.key -genkey -name prime256v1

# Write the public key components to a separate file.
openssl ec -in ec.key -pubout -out ec.pub

# Upload the public key for all instances of Replicator to find it.
cockroach sql -e "INSERT INTO _replicator.jwt_public_keys (public_key) VALUES ('$(cat ec.pub)')"

# Reload configuration, or wait one minute.
killall -HUP replicator

# Generate a token which can write to the ycsb.public schema.
# The key can be decoded using the debugger at https://jwt.io.
# Add the contents of out.jwt to the CREATE CHANGEFEED command:
# WITH webhook_auth_header='Bearer {out.jwt}'
replicator make-jwt -k ec.key -a ycsb.public -o out.jwt
~~~

##### External JWT providers

To use an external JWT provider, generate a claim with the `--claim` flag. The PEM-formatted public key or keys for that provider must be inserted into the `_replicator.jwt_public_keys` table. The `iss` (issuers) and `jti` (token id) fields will likely be specific to your auth provider, but the custom claim must be retained in its entirety:

{% include_cached copy-clipboard.html %}
~~~ shell
replicator make-jwt -a 'database.schema' --claim
~~~

~~~json
{
  "iss": "replicator",
  "jti": "d5ffa211-8d54-424b-819a-bc19af9202a5",
  "https://github.com/cockroachdb/replicator": {
    "schemas": [
      [
        "database",
        "schema"
      ]
    ]
  }
}
~~~

### Production considerations

- Avoid [`--disableAuthentication`]({% link molt/replicator-flags.md %}#disable-authentication) and [`--tlsSelfSigned`]({% link molt/replicator-flags.md %}#tls-self-signed) flags in production environments. These flags should only be used for testing or development purposes.

### Supply chain security

Use the `version` command to verify the integrity of your MOLT Replicator build and identify potential upstream vulnerabilities.

{% include_cached copy-clipboard.html %}
~~~ shell
replicator version
~~~

The output includes:

- Module name
- go.mod checksum
- Version

Use this information to determine if your build may be subject to vulnerabilities from upstream packages. Cockroach Labs uses Dependabot to automatically upgrade Go modules, and the team regularly merges Dependabot updates to address security issues.

## Common workflows

### Forward replication with initial load

<div class="filters filters-big clearfix">
    <button class="filter-button" data-scope="postgres">PostgreSQL</button>
    <button class="filter-button" data-scope="mysql">MySQL</button>
    <button class="filter-button" data-scope="oracle">Oracle</button>
</div>

<section class="filter-content" markdown="1" data-scope="postgres">
To start replication after an [initial data load with MOLT Fetch]({% link molt/migrate-load-replicate.md %}#start-fetch), use the `pglogical` command:

{% include_cached copy-clipboard.html %}
~~~ shell
replicator pglogical
~~~
</section>

<section class="filter-content" markdown="1" data-scope="mysql">
To start replication after an [initial data load with MOLT Fetch]({% link molt/migrate-load-replicate.md %}?filters=mysql#start-fetch), use the `mylogical` command:

{% include_cached copy-clipboard.html %}
~~~ shell
replicator mylogical
~~~
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
To start replication after an [initial data load with MOLT Fetch]({% link molt/migrate-load-replicate.md %}?filters=oracle#start-fetch), use the `oraclelogminer` command:

{% include_cached copy-clipboard.html %}
~~~ shell
replicator oraclelogminer
~~~
</section>

Specify the source and target database connections. For connection string formats, refer to [Source connection strings](#source-connection-strings) and [Target connection strings](#target-connection-strings):

{% include_cached copy-clipboard.html %}
~~~
--sourceConn $SOURCE
--targetConn $TARGET
~~~

<section class="filter-content" markdown="1" data-scope="oracle">
For Oracle Multitenant databases, also specify the PDB connection:

{% include_cached copy-clipboard.html %}
~~~
--sourcePDBConn $SOURCE_PDB
~~~

Specify the Oracle user that owns the tables to replicate. Oracle capitalizes identifiers by default, so use uppercase:

{% include_cached copy-clipboard.html %}
~~~
--sourceSchema MIGRATION_USER
~~~
</section>

Specify the target schema on CockroachDB with [`--targetSchema`]({% link molt/replicator-flags.md %}#target-schema) in fully-qualified `database.schema` format:

{% include_cached copy-clipboard.html %}
~~~
--targetSchema defaultdb.migration_schema
~~~

To replicate from the correct position, specify the appropriate checkpoint value. 

<section class="filter-content" markdown="1" data-scope="postgres">
Use [`--slotName`]({% link molt/replicator-flags.md %}#slot-name) to specify the slot [created during the data load]({% link molt/molt-fetch.md %}#load-before-replication), which automatically tracks the LSN (Log Sequence Number) checkpoint:

{% include_cached copy-clipboard.html %}
~~~
--slotName molt_slot
~~~
</section>

<section class="filter-content" markdown="1" data-scope="mysql">
Use [`--defaultGTIDSet`]({% link molt/replicator-flags.md %}#default-gtid-set) from the `cdc_cursor` field in the MOLT Fetch output:

{% include_cached copy-clipboard.html %}
~~~
--defaultGTIDSet '4c658ae6-e8ad-11ef-8449-0242ac140006:1-29'
~~~
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
Use the [`--scn`]({% link molt/replicator-flags.md %}#scn) and [`--backfillFromSCN`]({% link molt/replicator-flags.md %}#backfill-from-scn) values from the `cdc_cursor` field in the MOLT Fetch output:

{% include_cached copy-clipboard.html %}
~~~
--scn 26685786
--backfillFromSCN 26685444
~~~
</section>

Use [`--stagingSchema`]({% link molt/replicator-flags.md %}#staging-schema) to specify the staging database in fully-qualified `database.schema` format. Use [`--stagingCreateSchema`]({% link molt/replicator-flags.md %}#staging-create-schema) to create it automatically on first run:

{% include_cached copy-clipboard.html %}
~~~
--stagingSchema defaultdb._replicator
--stagingCreateSchema
~~~

At minimum, the `replicator` command should include the following flags:

<section class="filter-content" markdown="1" data-scope="postgres">
{% include_cached copy-clipboard.html %}
~~~ shell
replicator pglogical \
--sourceConn $SOURCE \
--targetConn $TARGET \
--targetSchema defaultdb.migration_schema \
--slotName molt_slot \
--stagingSchema defaultdb._replicator \
--stagingCreateSchema
~~~

For detailed steps, refer to [Load and replicate]({% link molt/migrate-load-replicate.md %}#start-replicator).
</section>

<section class="filter-content" markdown="1" data-scope="mysql">
{% include_cached copy-clipboard.html %}
~~~ shell
replicator mylogical \
--sourceConn $SOURCE \
--targetConn $TARGET \
--targetSchema defaultdb.public \
--defaultGTIDSet '4c658ae6-e8ad-11ef-8449-0242ac140006:1-29' \
--stagingSchema defaultdb._replicator \
--stagingCreateSchema
~~~

For detailed steps, refer to [Load and replicate]({% link molt/migrate-load-replicate.md %}?filters=mysql#start-replicator).
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
{% include_cached copy-clipboard.html %}
~~~ shell
replicator oraclelogminer \
--sourceConn $SOURCE \
--sourcePDBConn $SOURCE_PDB \
--targetConn $TARGET \
--sourceSchema MIGRATION_USER \
--targetSchema defaultdb.migration_schema \
--scn 26685786 \
--backfillFromSCN 26685444 \
--stagingSchema defaultdb._replicator \
--stagingCreateSchema
~~~

For detailed steps, refer to [Load and replicate]({% link molt/migrate-load-replicate.md %}?filters=oracle#start-replicator).
</section>

### Resume after interruption

<div class="filters filters-big clearfix">
    <button class="filter-button" data-scope="postgres">PostgreSQL</button>
    <button class="filter-button" data-scope="mysql">MySQL</button>
    <button class="filter-button" data-scope="oracle">Oracle</button>
</div>

When resuming replication after an interruption, MOLT Replicator automatically uses the stored checkpoint to resume from the correct position. 

Rerun the same `replicator` command used during [forward replication](#forward-replication-with-initial-load), specifying the same fully-qualified [`--stagingSchema`]({% link molt/replicator-flags.md %}#staging-schema) value as before. Omit [`--stagingCreateSchema`]({% link molt/replicator-flags.md %}#staging-create-schema) and any checkpoint flags. For example:

<section class="filter-content" markdown="1" data-scope="postgres">
{% include_cached copy-clipboard.html %}
~~~ shell
replicator pglogical \
--sourceConn $SOURCE \
--targetConn $TARGET \
--slotName molt_slot \
--stagingSchema defaultdb._replicator
~~~

For detailed steps, refer to [Resume replication]({% link molt/migrate-resume-replication.md %}).
</section>

<section class="filter-content" markdown="1" data-scope="mysql">
{% include_cached copy-clipboard.html %}
~~~ shell
replicator mylogical \
--sourceConn $SOURCE \
--targetConn $TARGET \
--stagingSchema defaultdb._replicator
~~~

For detailed steps, refer to [Resume replication]({% link molt/migrate-resume-replication.md %}?filters=mysql).
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
{% include_cached copy-clipboard.html %}
~~~ shell
replicator oraclelogminer \
--sourceConn $SOURCE \
--sourcePDBConn $SOURCE_PDB \
--sourceSchema MIGRATION_USER \
--targetConn $TARGET \
--stagingSchema defaultdb._replicator
~~~

For detailed steps, refer to [Resume replication]({% link molt/migrate-resume-replication.md %}?filters=oracle).
</section>

### Failback to source database

When replicating from CockroachDB back to the source database, MOLT Replicator acts as a webhook sink for a CockroachDB changefeed.

Use the `start` command for failback:

{% include_cached copy-clipboard.html %}
~~~ shell
replicator start
~~~

Specify the target database connection (the database you originally migrated from) with [`--targetConn`]({% link molt/replicator-flags.md %}#target-conn). For connection string formats, refer to [Target connection strings](#target-connection-strings):

{% include_cached copy-clipboard.html %}
~~~
--targetConn $TARGET
~~~

Specify the CockroachDB connection string with [`--stagingConn`]({% link molt/replicator-flags.md %}#staging-conn). For details, refer to [Connect using a URL]({% link {{ site.current_cloud_version }}/connection-parameters.md %}#connect-using-a-url).

{% include_cached copy-clipboard.html %}
~~~
--stagingConn $STAGING
~~~

Specify the staging database name with [`--stagingSchema`]({% link molt/replicator-flags.md %}#staging-schema) in fully-qualified `database.schema` format. This should be the same staging database created during [Forward replication with initial load](#forward-replication-with-initial-load):

{% include_cached copy-clipboard.html %}
~~~
--stagingSchema defaultdb._replicator
~~~

Specify a webhook endpoint address for the changefeed to send changes to with [`--bindAddr`]({% link molt/replicator-flags.md %}#bind-addr). For example:

{% include_cached copy-clipboard.html %}
~~~
--bindAddr :30004
~~~

Specify TLS certificate and private key file paths for secure webhook connections with [`--tlsCertificate`]({% link molt/replicator-flags.md %}#tls-certificate) and [`--tlsPrivateKey`]({% link molt/replicator-flags.md %}#tls-private-key):

{% include_cached copy-clipboard.html %}
~~~
--tlsCertificate ./certs/server.crt
--tlsPrivateKey ./certs/server.key
~~~

At minimum, the `replicator` command should include the following flags:

{% include_cached copy-clipboard.html %}
~~~ shell
replicator start \
--targetConn $TARGET \
--stagingConn $STAGING \
--stagingSchema defaultdb._replicator \
--bindAddr :30004 \
--tlsCertificate ./certs/server.crt \
--tlsPrivateKey ./certs/server.key
~~~

After starting `replicator`, create a CockroachDB changefeed to send changes to MOLT Replicator. For detailed steps, refer to [Migration failback]({% link molt/migrate-failback.md %}).

{{site.data.alerts.callout_info}}
When [creating the CockroachDB changefeed]({% link molt/migrate-failback.md %}#create-the-cockroachdb-changefeed), you specify the target database and schema in the webhook URL path. For PostgreSQL targets, use the fully-qualified format `/database/schema` (`/migration_db/migration_schema`). For MySQL targets, use the database name (`/migration_db`). For Oracle targets, use the uppercase schema name (`/MIGRATION_SCHEMA`).

Explicitly set a default `10s` [`webhook_client_timeout`]({% link {{ site.current_cloud_version }}/create-changefeed.md %}#options) value in the `CREATE CHANGEFEED` statement. This value ensures that the webhook can report failures in inconsistent networking situations and make crash loops more visible.
{{site.data.alerts.end}}

## Monitoring

### Metrics

MOLT Replicator metrics are not enabled by default. Enable Replicator metrics by specifying the [`--metricsAddr`]({% link molt/replicator-flags.md %}#metrics-addr) flag with a port (or `host:port`) when you start Replicator. This exposes Replicator metrics at `http://{host}:{port}/_/varz`. For example, the following flag exposes metrics on port `30005`:

~~~ 
--metricsAddr :30005
~~~

Metrics can additionally be written to snapshot files at repeated intervals. Metrics snapshotting is disabled by default. If metrics have been enabled, metrics snapshotting can also be enabled with the [`--metricsSnapshotPeriod`]({% link molt/replicator-flags.md %}#metrics-snapshot-period) flag. For example, the following flag enables metrics snapshotting every 15 seconds:

~~~
--metricsSnapshotPeriod 15s
~~~

For guidelines on using and interpreting replication metrics, refer to [Replicator Metrics]({% link molt/replicator-metrics.md %}).

### Logging

By default, MOLT Replicator writes two streams of logs: operational logs to `stdout` (including `warning`, `info`, `trace`, and some errors) and final errors to `stderr`.

Redirect both streams to ensure all logs are captured for troubleshooting:

{% include_cached copy-clipboard.html %}
~~~shell
# Merge both streams to console
./replicator ... 2>&1

# Redirect both streams to a file
./replicator ... > output.log 2>&1

# Merge streams to console while saving to file
./replicator > >(tee replicator.log) 2>&1

# Use logDestination flag to write all logs to a file
./replicator --logDestination replicator.log ...
~~~

Enable debug logging with [`-v`]({% link molt/replicator-flags.md %}#verbose). For more granularity and system insights, enable trace logging with [`-vv`]({% link molt/replicator-flags.md %}#verbose). Pay close attention to warning- and error-level logs, as these indicate when Replicator is misbehaving.

## Best practices

### Test and validate

To verify that your connections and configuration work properly, run MOLT Replicator in a staging environment before replicating any data in production. Use a test or development environment that closely resembles production.

### Optimize performance

{% include molt/optimize-replicator-performance.md %}

## Troubleshooting

<div class="filters filters-big clearfix">
    <button class="filter-button" data-scope="postgres">PostgreSQL</button>
    <button class="filter-button" data-scope="mysql">MySQL</button>
    <button class="filter-button" data-scope="oracle">Oracle</button>
</div>

{% include molt/molt-troubleshooting-replication.md %}

{% include molt/molt-troubleshooting-failback.md %}

## Examples

For detailed examples of using MOLT Replicator usage, refer to the migration workflow tutorials:

- [Load and Replicate]({% link molt/migrate-load-replicate.md %}): Load data with MOLT Fetch and set up ongoing replication with MOLT Replicator.
- [Resume Replication]({% link molt/migrate-resume-replication.md %}): Resume replication after an interruption.
- [Migration failback]({% link molt/migrate-failback.md %}): Replicate changes from CockroachDB back to the initial source database.

## See also

- [Migration Overview]({% link molt/migration-overview.md %})
- [Migration Strategy]({% link molt/migration-strategy.md %})
- [MOLT Fetch]({% link molt/molt-fetch.md %})