---
title: Enterprise Features
summary: Request and set trial and enterprise license keys for CockroachDB
toc: true
---

CockroachDB distributes a single binary that contains both core and [enterprise features](https://www.cockroachlabs.com/pricing/). You can use core features without any license key. However, to use the enterprise features, you need either a trial or an enterprise license key.

This page lists enterprise features, and shows you how to obtain and set trial and enterprise license keys for CockroachDB.

## Enterprise features

Feature | Description
--------+-------------------------
[Geo-Partitioning](topology-geo-partitioned-replicas.html) | This feature gives you row-level control of how and where your data is stored to dramatically reduce read and write latencies and assist in meeting regulatory requirements in multi-region deployments.
[Follower Reads](follower-reads.html) | This feature reduces read latency in multi-region deployments by using the closest replica at the expense of reading slightly historical data (currently, at least 48 seconds in the past).
[`BACKUP`](backup.html) | This feature creates full or incremental backups of your cluster's schema and data that are consistent as of a given timestamp, stored on a service such as AWS S3, Google Cloud Storage, NFS, or HTTP storage.<br><br><span class="version-tag">New in v19.2:</span> Backups can be locality-aware such that each node writes files only to the backup destination that matches the node's [locality](start-a-node.html#locality). This is useful for reducing cloud storage data transfer costs by keeping data within cloud regions and complying with data domiciling requirements.
[`RESTORE`](restore.html) | This feature restores your cluster's schemas and data from an enterprise `BACKUP`.
[Change Data Capture](change-data-capture.html) (CDC) | This feature provides efficient, distributed, row-level [change feeds into Apache Kafka](create-changefeed.html) for downstream processing such as reporting, caching, or full-text indexing.
[Node Map](enable-node-map.html) | This feature visualizes the geographical configuration of a cluster by plotting node localities on a world map.
[Locality-Aware Index Selection](cost-based-optimizer.html#preferring-the-nearest-index) | Given [multiple identical indexes](topology-duplicate-indexes.html) that have different locality constraints using [replication zones](configure-replication-zones.html), the cost-based optimizer will prefer the index that is closest to the gateway node that is planning the query. In multi-region deployments, this can lead to performance improvements due to improved data locality and reduced network traffic.
[Encryption at Rest](encryption.html#encryption-at-rest-enterprise) | Supplementing CockroachDB's encryption in flight capabilities, this feature provides transparent encryption of a node's data on the local disk. It allows encryption of all files on disk using AES in counter mode, with all key sizes allowed.
[GSSAPI with Kerberos Authentication](gssapi_authentication.html) | CockroachDB supports the Generic Security Services API (GSSAPI) with Kerberos authentication, which lets you use an external enterprise directory system that supports Kerberos, such as Active Directory.
[Role-Based Access Control (RBAC)](authorization.html#create-and-manage-roles) | This feature simplifies the process of defining data access policies for groups of authenticated users.
[`EXPORT`](export.html) | This feature uses the CockroachDB distributed execution engine to quickly get large sets of data out of CockroachDB in a CSV format that can be ingested by downstream systems.

## Types of licenses

Type | Description
-------------|------------
**Trial License** | A trial license enables you to try out CockroachDB enterprise features for 30 days for free.
**Enterprise License** | A paid enterprise license enables you to use CockroachDB enterprise features for longer periods (one year or more).

{{site.data.alerts.callout_success}}
<span class="version-tag">New in v19.2:</span> For quick local testing of Enterprise features, you can use the [`cockroach demo`](cockroach-demo.html) command, which starts a temporary, in-memory cluster with a SQL shell open and a trial license applied automatically.
{{site.data.alerts.end}}

## Obtain a license

To obtain a trial license, fill out [the registration form](https://www.cockroachlabs.com/get-cockroachdb/) and receive your trial license via email within a few minutes.

To upgrade to an enterprise license, <a href="mailto:sales@cockroachlabs.com">contact Sales</a>.

## Set a license

As the CockroachDB `root` user, open the [built-in SQL shell](use-the-built-in-sql-client.html) in insecure or secure mode, as per your CockroachDB setup. In the following example, we assume that CockroachDB is running in insecure mode. Then use the `SET CLUSTER SETTING` command to set the name of your organization and the license key:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure
~~~

{% include copy-clipboard.html %}
~~~ sql
>  SET CLUSTER SETTING cluster.organization = 'Acme Company';
~~~

{% include copy-clipboard.html %}
~~~ sql
>  SET CLUSTER SETTING enterprise.license = 'xxxxxxxxxxxx';
~~~

## Verify a license

To verify a license, open the [built-in SQL shell](use-the-built-in-sql-client.html) and use the `SHOW CLUSTER SETTING` command to check the organization name and license key:

{% include copy-clipboard.html %}
~~~ sql
>  SHOW CLUSTER SETTING cluster.organization;
~~~
~~~
  cluster.organization
+----------------------+
  Acme Company
(1 row)
~~~

{% include copy-clipboard.html %}
~~~ sql
>  SHOW CLUSTER SETTING enterprise.license;
~~~
~~~
             enterprise.license
+-------------------------------------------+
  crl-0-ChB1x...
(1 row)
~~~

The license setting is also logged in the cockroach.log on the node where the command is run:

{% include copy-clipboard.html %}
~~~ sql
$ cat cockroach.log | grep license
~~~
~~~
I171116 18:11:48.279604 1514 sql/event_log.go:102  [client=[::1]:56357,user=root,n1] Event: "set_cluster_setting", target: 0, info: {SettingName:enterprise.license Value:xxxxxxxxxxxx User:root}
~~~

## Renew an expired license

After your license expires, the enterprise features stop working, but your production setup is unaffected. For example, the backup and restore features would not work until the license is renewed, but you would be able to continue using all other features of CockroachDB without interruption.

To renew an expired license, <a href="mailto:sales@cockroachlabs.com">contact Sales</a> and then [set](enterprise-licensing.html#set-a-license) the new license.

## See also

- [`SET CLUSTER SETTING`](set-cluster-setting.html)
- [`SHOW CLUSTER SETTING`](show-cluster-setting.html)
- [Enterprise Trial –– Get Started](get-started-with-enterprise-trial.html)
