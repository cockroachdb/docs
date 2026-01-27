A [*Phased Bulk Load Migration*]({% link molt/migration-approach-phased-bulk-load.md %}) involves [migrating data to CockroachDB]({% link molt/migration-overview.md %}) in several phases. Data can be sliced per tenant, per service, per region, or per table to suit the needs of the migration. In this approach, you stop application traffic to the source database _only_ for the tables in a particular slice of data. You then migrate that phase of data to the target cluster using [MOLT Fetch]({% link molt/molt-fetch.md %}) during a **downtime window**. Application traffic is then cut over to those target tables after schema finalization and data verification. This process is repeated for each phase of data.

- Data is migrated to the target [in phases]({% link molt/migration-considerations-phases.md %}).

- This approach does not utilize [continuous replication]({% link molt/migration-considerations-replication.md %}).

- [Rollback]({% link molt/migration-considerations-rollback.md %}) is manual.

This approach is comparable to the [Classic Bulk Load Migration]({% link molt/migration-approach-classic-bulk-load.md %}), but dividing the data into multiple phases allows each downtime window to be shorter, and it allows each phase of the migration to be less complex. Depending on how you divide the data, it also may allow your downtime windows to affect only a subset of users. For example, dividing the data per region could mean that, when migrating the data from Region A, application usage in Region B may remain unaffected. This approach may increase overall migration complexity: its duration is longer, you will need to do the work of partitioning the data, and you will have a longer period when you run both the source and the target database concurrently.

This approach is best for databases that are too large to migrate all at once, internal tools, dev/staging environments, and production environments that can handle business disruption. It can only be performed if your system can handle downtime for each migration phase, and if your source database can easily be divided into the phases you need.

This page describes an example scenario. While the commands provided can be copy-and-pasted, they may need to be altered or reconsidered to suit the needs of your specific environment.

<div style="text-align: center;">
<img src="{{ 'images/molt/molt_phased_bulk_load_flow.svg' | relative_url }}" alt="Phased Bulk Load Migration flow" style="max-width:100%" />
</div>

## Example scenario

You have a moderately-sized (500GB) database that provides the data store for a web application. You want to migrate the entirety of this database to a new CockroachDB cluster. You will divide this migration into four geographic regions (A, B, C, and D). You schedule a maintenance window for each region over four subsequent evenings, and you announce them to your users (per region) several weeks in advance.

The application runs on a Kubernetes cluster with an NGINX Ingress Controller.

**Estimated system downtime:** 4 hours per region.

## Before the migration

- Install the [MOLT (Migrate Off Legacy Technology)]({% link molt/molt-fetch-installation.md %}#installation) tools.
- Review the [MOLT Fetch]({% link molt/molt-fetch-best-practices.md %}) documentation.
- Announce the maintenance window to your users on a per-region basis.
- **Recommended:** Perform a dry run of this full set of instructions in a development environment that closely resembles your production environment. This can help you get a realistic sense of the time and complexity it requires.
- Understand the prequisites and limitations of the MOLT tools:

<section class="filter-content" markdown="1" data-scope="oracle">
{% include molt/oracle-migration-prerequisites.md %}
</section>

{% include molt/molt-limitations.md %}


## Step 1: Prepare the source database

In this step, you will:

- [Create a dedicated migration user on your source database](#create-migration-user-on-source-database).

{% include molt/migration-prepare-database.md %}

#### Checkpoint

By this point in the migration, your **source** database should be configured so that a dedicated migration user is able to read its data.

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

#### Checkpoint

By this point in the migration, your source and target tables should match one another, although you may have dropped non-`PRIMARY KEY` constraints and indexes from the target to optimize data load performance. Additionally, both databases should have the correct read/write permissions to allow the MOLT tools to perform the migration.

## Migrating each phase

Steps 3-7 are run for each phase of the data migration. Within the first migration downtime window, you will run through these steps for Region A. You will repeat these steps for the other regions during each subsequent downtime window.

## Step 3: Stop application traffic

With both the source and target databases prepared for the data load, it's time to stop application traffic to the source for a particular region. 

If the Kubernetes cluster that deploys the application has pre-region deployments (for example, `app-us`, `app-eu`, `app-apac`), you can scale down only the deployment for that region.

{% include_cached copy-clipboard.html %}
~~~shell
kubectl scale deploy/app-eu --replicas=0
~~~

Or this can be handled by the NGINX Ingress Controller, by including the following to your NGINX configuration, ensuring that the conditional statement is suitable for your deployment:

{% include_cached copy-clipboard.html %}
~~~yml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app
  annotations:
    nginx.ingress.kubernetes.io/server-snippet: |
      if ($http_x_region = "eu") {
        return 503;
      }
spec:
  ingressClassName: nginx
  rules:
  - host: api.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: app
            port:
              number: 80
~~~

{{ site.data.alerts.callout_danger }}
Application downtime begins now, for users in the given region.
{{ site.data.alerts.end }}

## Step 4: Load data into CockroachDB

In this step, you will:

- [Configure MOLT Fetch with the flags needed for your migration](#configure-molt-fetch).
- [Run MOLT Fetch](#run-molt-fetch).
- [Understand how to continue a load after an interruption](#continue-molt-fetch-after-an-interruption).

### Configure MOLT Fetch

When you run `molt fetch`, you can configure the following options for data load:

- [Connection strings](#connection-strings): Specify URL‑encoded source and target connections.
- [Intermediate file storage](#intermediate-file-storage): Export data to cloud storage or a local file server.
- [Table handling mode](#table-handling-mode): Determine how existing target tables are initialized before load.
- [Schema and table filtering](#schema-and-table-filtering): Specify schema and table names to migrate.
- [Row-level filtering](#row-level-filtering): Define criteria that determines which rows within a table to migrate.
- [Data load mode](#data-load-mode): Choose between `IMPORT INTO` and `COPY FROM`.
- [Fetch metrics](#fetch-metrics): Configure metrics collection during initial data load.

#### Connection strings

{% include molt/molt-connection-strings.md %}

#### Intermediate file storage

{% include molt/fetch-intermediate-file-storage.md %}

#### Table handling mode

{% include molt/fetch-table-handling.md %}

#### Schema and table filtering

{% include molt/fetch-schema-table-filtering.md %}

#### Row-level filtering

MOLT Fetch enables you to move a subset of data in a table, rather than all data in the table. This may be especially useful in a phased data migration. If data for multiple regions occupies the same table, and the region of each row is included in the data, you can use row-level filtering to move only the relevant rows. You do so with the [`--filter-path`]({% link molt/molt-fetch-commands-and-flags.md %}#filter-path) flag, specifying the path to a JSON file that defines row-level filtering for data load.

{% include_cached copy-clipboard.html %}
~~~
--filter-path 'data-filter.json'
~~~

The JSON file should contain one or more entries in `filters`, each with a `resource_specifier` (`schema` and `table`) and a SQL expression `expr`. For example, the following example exports only rows from `migration_schema.t1` where `v > 100`:

~~~ json
{
  "filters": [
    {
      "resource_specifier": {
        "schema": "migration_schema",
        "table": "t1"
      },
      "expr": "v > 100"
    }
  ]
}
~~~

#### Data load mode

{% include molt/fetch-data-load-modes.md %}

#### Fetch metrics

{% include molt/fetch-metrics.md %}

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

In this step, you will use [MOLT Verify]({% link molt/molt-verify.md %}) to confirm that the source and target data is consistent. This ensures that the data load was successful. Use MOLT Verify's [`--schema-filter`]({% link molt/molt-verify.md %}#flags) or [`--table-filter`]({% link molt/molt-verify.md %}#flags) to select only the tables that are relevant for the given phase.

### Run MOLT Verify

{% include molt/verify-output.md %}

## Step 6: Finalize the target schema

### Add constraints and indexes

{% include molt/migration-modify-target-schema.md %}

## Step 7: Cut over application traffic

With the target cluster verified and finalized, it's time to resume application traffic for the current migration phase.

### Modify application code

In the application back end, update the application to route traffic for this migration phase to the CockroachDB cluster. A simple example:

~~~yml
env:
  - name: DATABASE_URL_US_EAST
    value: postgres://root@cockroachdb.us-east:26257/defaultdb?sslmode=verify-full
  - name: DATABASE_URL_US_WEST
    value: postgres://legacy-db.us-west:5432/defaultdb  # Still on source
~~~

In your application code, route database connections based on the user's region:

~~~python
def get_db_connection(user_region):
    if user_region == "us-east":
        return os.getenv("DATABASE_URL_US_EAST")  # CockroachDB
    else:
        return os.getenv("DATABASE_URL_US_WEST")  # Source database
~~~

### Resume application traffic 

If you halted traffic by scaling down a regional Kubernetes deployment, scale it back up.

{% include_cached copy-clipboard.html %}
~~~shell
kubectl scale deploy/app-eu --replicas=3
~~~

Or if this was handled by the NGINX Controller, remove the 503 block that was written in step 3:

{% include_cached copy-clipboard.html %}
~~~yml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app
#   annotations:
#     nginx.ingress.kubernetes.io/server-snippet: |
#       if ($http_x_region = "eu") {
#         return 503;
#       }
spec:
  ingressClassName: nginx
  rules:
  - host: api.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: app
            port:
              number: 80
~~~

This ends downtime for the current migration phase.

## Repeat for each phase

During the next scheduled, regional downtime window, [return to step 3](#step-3-stop-application-traffic) to migrate the next phase of data. Repeat steps 3-7 for each phase of data, until every region's data has been migrated and all application traffic has been cut over to the target.

## Troubleshooting

{% include molt/molt-troubleshooting-fetch.md %}

## See also

- [Migration Overview]({% link molt/migration-overview.md %})
- [Migration Considerations]({% link molt/migration-considerations.md %})
- [Classic Bulk Load Migration]({% link molt/migration-approach-classic-bulk-load.md %})
- [MOLT Fetch]({% link molt/molt-fetch.md %})
- [MOLT Verify]({% link molt/molt-verify.md %})