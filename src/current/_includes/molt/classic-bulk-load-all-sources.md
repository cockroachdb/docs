A [*Classic Bulk Load Migration*]({% link molt/migration-approach-classic-bulk-load.md %}) is the simplest way of [migrating data to CockroachDB]({% link molt/migration-overview.md %}). In this approach, you stop application traffic to the source database and migrate data to the target cluster using [MOLT Fetch]({% link molt/molt-fetch.md %}) during a **significant downtime window**. Application traffic is then cut over to the target after schema finalization and data verification.

- All source data is migrated to the target [at once]({% link molt/migration-considerations-granularity.md %}).

- This approach does not utilize [continuous replication]({% link molt/migration-considerations-replication.md %}).

- [Rollback]({% link molt/migration-considerations-rollback.md %}) is manual, but in most cases it's simple, as the source database is preserved and write traffic begins on the target all at once. If you wish to roll back before the target has received any unique writes, nothing needs to be done. If you wish to roll back after the target has received unique writes, you must manually replicate these new rows on the source.

This approach is best for small databases (<100 GB), internal tools, dev/staging environments, and production environments that can handle business disruption. It's a simple approach that guarantees full data consistency and is easy to execute with limited resources, but it can only be performed if your system can handle significant downtime.

This page describes an example scenario. While the commands provided can be copy-and-pasted, they may need to be altered or reconsidered to suit the needs of your specific environment.

<div style="text-align: center;">
<img src="{{ 'images/molt/molt_classic_bulk_load_flow.svg' | relative_url }}" alt="Classic Bulk Load Migration flow" style="max-width:100%" />
</div>

## Example scenario

You have a small (50 GB) database that provides the data store for a web application. You want to migrate the entirety of this database to a new CockroachDB cluster. You schedule a maintenance window for Saturday from 2 AM to 6 AM, and announce it to your users several weeks in advance.

The application runs on a Kubernetes cluster.

**Estimated system downtime:** 4 hours.


## Before the migration

- Install the [MOLT (Migrate Off Legacy Technology)]({% link molt/molt-fetch-installation.md %}#installation) tools.
- Review the [MOLT Fetch]({% link molt/molt-fetch-best-practices.md %}) documentation.
- [Develop a migration plan]({% link molt/migration-strategy.md %}#develop-a-migration-plan) and [prepare for the migration]({% link molt/migration-strategy.md %}#prepare-for-migration).
- **Recommended:** Perform a dry run of this full set of instructions in a development environment that closely resembles your production environment. This can help you get a realistic sense of the time and complexity it requires.
- Announce the maintenance window to your users.
- Understand the prequisites and limitations of the MOLT tools:

<section class="filter-content" markdown="1" data-scope="oracle">
{% include molt/oracle-migration-prerequisites.md %}
</section>

{% include molt/molt-limitations.md %}

## Step 1: Prepare the source database

In this step, you will:

- [Create a dedicated migration user on your source database](#create-migration-user-on-source-database).

{% include molt/migration-prepare-database.md %}

## Step 2: Prepare the target database

In this step, you will:

- [Provision and run a new CockroachDB cluster](#provision-a-cockroachdb-cluster).
- [Define the tables on the target cluster](#define-the-target-tables) to match those on the source.
- [Create a SQL user on the target cluster](#create-the-sql-user) with the necessary write permissions.

### Provision a CockroachDB cluster

Use one of the following options to create and run a new CockroachDB cluster. This is your migration **target**.

#### Option 1: Create a secure cluster locally

If you have the CockroachDB binary installed locally, you can manually deploy a multi-node, self-hosted CockroachDB cluster on your local machine.

Learn how to [deploy a CockroachDB cluster locally]({% link {{ site.versions["stable"] }}/secure-a-cluster.md %}).

#### Option 2: Create a CockroachDB Self-Hosted cluster on AWS

You can manually deploy a multi-node, self-hosted CockroachDB cluster on Amazon's AWS EC2 platform, using AWS's managed load-balancing service to distribute client traffic.

Learn how to [deploy a CockroachDB cluster on AWS]({% link {{ site.versions["stable"] }}/deploy-cockroachdb-on-aws.md %}).

#### Option 3: Create a CockroachDB Cloud cluster

CockroachDB Cloud is a fully-managed service run by Cockroach Labs, which simplifies the deployment and management of CockroachDB.

[Sign up for a CockroachDB Cloud account](https://cockroachlabs.cloud) and [create a cluster]({% link cockroachcloud/create-your-cluster.md %}) using [trial credits]({% link cockroachcloud/free-trial.md %}).

### Define the target tables

{% include molt/migration-prepare-schema.md %}

### Create the SQL user

{% include molt/migration-create-sql-user.md %}

## Step 3: Stop application traffic

With both the source and target databases prepared for the data load, it's time to stop application traffic to the source. At the start of the maintenance window, scale down the Kubernetes cluster to zero pods. 

{% include_cached copy-clipboard.html %}
~~~shell
kubectl scale deployment app --replicas=0
~~~

{{ site.data.alerts.callout_danger }}
Application downtime begins now.

It is strongly recommended that you perform a dry run of this migration in a test environment. This will allow you to practice using the MOLT tools in real time, and it will give you an accurate sense of how long application downtime might last.
{{ site.data.alerts.end }}

## Step 4: Load data into CockroachDB

In this step, you will:

- [Configure MOLT Fetch with the flags needed for your migration](#configure-molt-fetch).
- [Run MOLT Fetch](#run-molt-fetch).
- [Understand how to continue a load after an interruption](#continue-molt-fetch-after-an-interruption).

### Configure MOLT Fetch

The [MOLT Fetch documentation]({% link molt/molt-fetch.md %}) includes detailed information about how to [configure MOLT Fetch]({% link molt/molt-fetch.md %}#run-molt-fetch), and how to [monitor MOLT Fetch metrics]({% link molt/molt-fetch-monitoring.md %}).

When you run `molt fetch`, you can configure the following options for data load:

<a id="schema-and-table-filtering"></a>
<a id="source-connection-string"></a>
<a id="table-handling-mode"></a>
<a id="target-connection-string"></a>
<a id="cloud-storage-authentication"></a>
<a id="secure-connections"></a>
<a id="intermediate-file-storage"></a>
<a id="data-load-mode"></a>
<a id="connection-strings"></a>

- [Specify source and target databases]({% link molt/molt-fetch.md %}#specify-source-and-target-databases): Specify URL‑encoded source and target connections.
- [Select data to migrate]({% link molt/molt-fetch.md %}#select-data-to-migrate): Specify schema and table names to migrate.
- [Define intermediate file storage]({% link molt/molt-fetch.md %}#define-intermediate-storage): Export data to cloud storage or a local file server.
- [Define fetch mode]({% link molt/molt-fetch.md %}#define-fetch-mode): Specifies whether data will only be loaded into/from intermediate storage.
- [Shard tables]({% link molt/molt-fetch.md %}#shard-tables-for-concurrent-export): Divide larger tables into multiple shards during data export.
- [Data load mode]({% link molt/molt-fetch.md %}#import-into-vs-copy-from): Choose between `IMPORT INTO` and `COPY FROM`.
- [Table handling mode]({% link molt/molt-fetch.md %}#handle-target-tables): Determine how existing target tables are initialized before load.
- [Define data transformations]({% link molt/molt-fetch.md %}#define-transformations): Define any row-level transformations to apply to the data before it reaches the target.
- [Monitor fetch metrics]({% link molt/molt-fetch-monitoring.md %}): Configure metrics collection during initial data load.

Read through the documentation to understand how to configure your `molt fetch` command and its flags. Follow [best practices]({% link molt/molt-fetch-best-practices.md %}), especially those related to security.

At minimum, the `molt fetch` command should include the source, target, data path, and [`--ignore-replication-check`]({% link molt/molt-fetch-commands-and-flags.md %}#ignore-replication-check) flags:

{% include_cached copy-clipboard.html %}
~~~ shell
molt fetch \
--source $SOURCE \
--target $TARGET \
--bucket-path 's3://bucket/path' \
--ignore-replication-check
~~~

However, depending on the needs of your migration, you may have many more flags set, and you may need to prepare some accompanying .json files.

### Run MOLT Fetch

Perform the bulk load of the source data.

1. Run the [MOLT Fetch]({% link molt/molt-fetch.md %}) command to move the source data into CockroachDB. This example command passes the source and target connection strings [as environment variables](#secure-connections), writes [intermediate files](#intermediate-file-storage) to S3 storage, and uses the `truncate-if-exists` [table handling mode](#table-handling-mode) to truncate the target tables before loading data. It limits the migration to a single schema and filters for three specific tables. The [data load mode]({% link molt/molt-fetch.md %}#import-into-vs-copy-from) defaults to `IMPORT INTO`. Include the `--ignore-replication-check` flag to skip replication checkpoint queries, which eliminates the need to configure the source database for logical replication.

    <section class="filter-content" markdown="1" data-scope="postgres">
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    molt fetch \
    --source $SOURCE \
    --target $TARGET \
    --schema-filter 'migration_schema' \
    --table-filter 'employees|payments|orders' \
    --bucket-path 's3://migration/data/cockroach' \
    --table-handling truncate-if-exists \
    --ignore-replication-check
    ~~~
    </section>

    <section class="filter-content" markdown="1" data-scope="mysql">
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    molt fetch \
    --source $SOURCE \
    --target $TARGET \
    --table-filter 'employees|payments|orders' \
    --bucket-path 's3://migration/data/cockroach' \
    --table-handling truncate-if-exists \
    --ignore-replication-check
    ~~~
    </section>

    <section class="filter-content" markdown="1" data-scope="oracle">
    The command assumes an Oracle Multitenant (CDB/PDB) source. [`--source-cdb`]({% link molt/molt-fetch-commands-and-flags.md %}#source-cdb) specifies the container database (CDB) connection string.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    molt fetch \
    --source $SOURCE \
    --source-cdb $SOURCE_CDB \
    --target $TARGET \
    --schema-filter 'migration_schema' \
    --table-filter 'employees|payments|orders' \
    --bucket-path 's3://migration/data/cockroach' \
    --table-handling truncate-if-exists \
    --ignore-replication-check
    ~~~
    </section>

{% include molt/fetch-data-load-output.md %}

### Continue MOLT Fetch after an interruption

{% include molt/fetch-continue-after-interruption.md %}

## Step 5: Verify the data

In this step, you will use [MOLT Verify]({% link molt/molt-verify.md %}) to confirm that the source and target data is consistent. This ensures that the data load was successful.

### Run MOLT Verify

{% include molt/verify-output.md %}

## Step 6: Finalize the target schema

### Add constraints and indexes

{% include molt/migration-modify-target-schema.md %}

## Step 7: Cut over application traffic

With the target cluster verified and finalized, it's time to resume application traffic.

### Modify application code

In the application back end, make sure that the application now directs traffic to the CockroachDB cluster. For example:

~~~yml
env:
  - name: DATABASE_URL
    value: postgres://root@localhost:26257/defaultdb?sslmode=verify-full
~~~

### Resume application traffic 

Scale up the Kubernetes deployment to the original number of replicas:

{% include_cached copy-clipboard.html %}
~~~shell
kubectl scale deployment app --replicas=3
~~~

This ends downtime.

## Troubleshooting

{% include molt/molt-troubleshooting-fetch.md %}

## See also

- [MOLT Fetch]({% link molt/molt-fetch.md %})
- [MOLT Verify]({% link molt/molt-verify.md %})
- [Migration Overview]({% link molt/migration-overview.md %})
- [MOLT Schema Conversion Tool]({% link cockroachcloud/migrations-page.md %})
