---
title: Sign Up for a Managed Cluster
summary:
toc: true
build_for: [managed]
redirect_from: /v2.2/managed-sign-up-for-a-cluster.html
---

The Managed CockroachDB offering is currently in Limited Availability and accepting customers on a qualified basis. The offering provides a running CockroachDB cluster suitable to your needs, fully managed by Cockroach Labs on GCP or AWS. Benefits include:

- No provisioning or deployment efforts for you
- Daily full backups and hourly incremental backups of your data
- Upgrades to the latest stable release of CockroachDB
- Monitoring to provide SLA-level support

## Application process

To be considered for participation:

1. [Sign up for an Enterprise Trial license](https://www.cockroachlabs.com/get-cockroachdb/).

2. During sign up, check **I am interested in Managed CockroachDB**. You'll be asked to provide some basic details about your company and deployment requirements.

    {% comment %}- The type of app you want to run against CockroachDB (e.g., point-in-time retail transactions)
    - The cloud and regions where you want CockroachDB running
    - The general shape of your workload (e.g., reads vs. writes, overwriting keys vs. new keys)
    - Your expected QPS or TPS
    - Your current data size and expected growth in size{% endcomment %}

3. Once you've submitted your request, two things will happen:
    - Cockroach Labs will consider your use case and follow up with you within 1 business day.
    - You'll receive an email with links to download and start exploring CockroachDB right away.

        The email will include a 30-day license key for CockroachDB with Enterprise features (backup & restore, geo-partitioning, priority support, cluster visualization).

## Confirmation email

Once your Managed CockroachDB cluster is available, you'll receive an email confirming its shape (e.g., regions, number of nodes per region, etc.) and providing you the following important details:

### Connection details

You use these details in your connection strings when [connecting to your cluster](managed-connect-to-your-cluster.html) from the CockroachDB SQL shell and Postgres-compatible drivers or ORMs.

Detail | Description
-------|------------
Hosts | The hostnames to use in your connection strings.<br><br>Typically, you'll receive one global hostname and a load balancer hostname per region. The global hostname will route connections to one of the regional load balancers and so is suitable for ad-hoc querying via the CockroachDB SQL client. Applications, on the other hand, should always use the load balancer hostname that is closest to the client.
Ports | The ports to use for SQL connections and for reaching the [Admin UI](managed-use-the-admin-ui.html), usually `26257` and `8080` respectively.
User | Your initial user. This user has "admin" privileges and can [create databases](learn-cockroachdb-sql.html#create-a-database), [import data](migration-overview.html), and [create and grant privileges to other users](managed-user-management.html).   
Password | The password for your "admin" user. Be sure to [connect to the CockroachSQL shell](managed-connect-to-your-cluster.html#use-the-cockroachdb-sql-client) and [change this password](managed-user-management.html#managing-users) right away.
Database name | The initial database created for you. Your "admin" user can [create additional databases](learn-cockroachdb-sql.html#create-a-database).
CA Certificate | The `ca.crt` file that must be available on every machine from which you want to connect the cluster and referenced in connection strings.

**SQL connection URL with placeholders**

~~~
postgres://<username>:<password>@<host>:26257/<database>?sslmode=verify-full&sslrootcert=certs/ca.crt'
~~~

**SQL connection URL with example details**

~~~
postgres://maxroach:LeiCisGclLcmaWOls@gcp-us-east1.company-domain.cockroachcloud.com:26257/firstdb?sslmode=verify-full&sslrootcert=certs/ca.crt'
~~~

### Admin UI URL

You use this URL to reach the [Admin UI for your cluster](managed-use-the-admin-ui.html). This URL is typically the combination of the global hostname and port `8080`.

Once you open the URL, you'll need to log in with your username and password.
