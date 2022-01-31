---
title: Data Domiciling with CockroachDB
summary: Learn how to use CockroachDB's improved multi-region capabilities to implement data domiciling.
toc: true
---

As you scale your usage of [multi-region clusters](multiregion-overview.html), you may need to keep certain subsets of data in specific localities. Keeping specific data on servers in specific geographic locations is also known as _data domiciling_.

CockroachDB has basic support for data domiciling in multi-region clusters using the process described below. At a high level, this process involves:

1. Creating separate databases per domicile.
2. Adding regions to those databases using the [`ADD REGION`](add-region.html) statement.
3. Making sure your application is adding data meant for a specific domicile to the correct database.

For more information, see the sections below.

## Overview

The best way to keep a specific data set cordoned off from others in CockroachDB is also the simplest: keep it in a separate database. Data that needs to meet specific domiciling requirements such as "data from EU residents must be domiciled in the EU" is most easily met by creating a separate database only for EU residents' data.

In a multi-region setting, you can associate that database with only those regions which should accept and store EU user data. Luckily, CockroachDB supports cross-database [selection queries](selection-queries.html), so you can still join this data with other data sets to keep track of what is happening across your application, while meeting the requirement that data is stored on disk in the allowed localities. Depending on your requirements, you may want to further require that even read queries are only generated from the region in which you are allowed to access the data.

{{site.data.alerts.callout_info}}
As of CockroachDB v21.1 and earlier, some metadata about the user data may be stored in system ranges, system tables, etc. This might result in potential "leakage" outside of the desired domicile if your schema includes table names, etc., that may reveal information about their contents (e.g., `SELECT * FROM germany_users_with_iphones_over_35`, to provide a silly example).
{{site.data.alerts.end}}

Therefore, make sure to design your schema such that information that must remain domiciled _cannot_ be deduced from the schema design (e.g., primary keys, table names, column names, usernames).

For a complete list of the limitations of the data domiciling approach described here, see the [Limitations](#limitations) section below.

### Step 1. Create separate databases per domiciled data requirement

As mentioned above, the best way to keep specific data sets cordoned off from each other in CockroachDB is to keep them in separate databases. To create a separate database for EU-based users, run the following statement:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE DATABASE eu_users;
USE eu_users;
~~~

### Step 2. Add specific regions to each database

Make sure that CockroachDB is storing the data in the `eu_users` database in European regions using the [`ALTER DATABASE ... SET PRIMARY REGION`](set-primary-region.html) and [`... ADD REGION`](add-region.html) statements:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER DATABASE eu_users SET PRIMARY REGION 'eu-west-1';
ALTER DATABASE eu_users ADD REGION 'eu-west-2';
ALTER DATABASE eu_users ADD REGION 'eu-central-1';
~~~

{{site.data.alerts.callout_info}}
In order to be able to add these regions from SQL, you must have started the cluster with these regions using the [`cockroach start --locality`](cockroach-start.html#locality) flag.
{{site.data.alerts.end}}

### Step 3. Add domiciled data to the right databases

You will need to make sure that user data associated with EU users is only added to the `eu_users` database.

How exactly you will accomplish that is beyond the scope of this document, but you will likely need to add some logic to your application and/or to your load balancing infrastructure to make sure that when your application code is [inserting](insert.html) or [updating](update.html) EU user data, the data only ever hits the `eu_users` database. For example, you can set the target database in your [connection string](connection-parameters.html). For example:

~~~
postgres://maxroach:mypassword@region.cockroachlabs.cloud:26257/eu_users?sslmode=verify-full&sslrootcert=certs/app-ca.crt
~~~

For a more detailed example showing how to deploy an application and CockroachDB in multiple regions, see [Deploy a Global, Serverless Application](movr-flask-deployment.html#global-application-deployment).

### Step 4. Query across databases

Storing data on EU users in a separate database is made easier by the fact that CockroachDB supports cross-database [joins](joins.html). For example, to join data from EU and non-EU user tables in a hypothetical application, you might issue a query like the following, which joins users from separate databases on a shared application ID:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT us_users.name, eu_users.name
  FROM us_users.users, eu_users.users
 WHERE us_users.users.application_id = eu_users.users.application_id ...
~~~

## Limitations

As noted above, there are several limitations to this approach:

- As mentioned above, some metadata about the objects in a schema may be stored in system ranges, system tables, etc. CockroachDB synchronizes system ranges and system tables across nodes. This synchronization does not respect any multi-region settings applied via either the multi-region SQL commands described above, or the low-level [zone configs](configure-replication-zones.html) mechanism. This might result in potential "leakage" outside of the desired domicile if your schema includes primary keys, table names, etc., that may reveal information about their contents.
- If you start a node with a [`--locality`](cockroach-start.html#locality) flag that says the node is in region _A_, but the node is actually running in some region _B_, this approach will not work. A CockroachDB node only knows its locality based on the text supplied to the `--locality` flag; it can not ensure that it is actually running in that physical location.
- Finally, remember that cross-region writes are slower than intra-region writes. This may be an issue depending on your application's performance needs, since following the advice above would result in having different databases' data stored in different regions.

## See also

- [Multi-region overview](multiregion-overview.html)
- [Choosing a multi-region configuration](choosing-a-multi-region-configuration.html)
- [When to use ZONE vs REGION survival goals](when-to-use-zone-vs-region-survival-goals.html)
- [When to use REGIONAL vs GLOBAL tables](when-to-use-regional-vs-global-tables.html)
- [Multi-region SQL Performance](demo-low-latency-multi-region-deployment.html)
- [`ADD REGION`](add-region.html)
