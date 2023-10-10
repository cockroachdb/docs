---
title: Physical Cluster Replication
summary: Follow a tutorial to set up physical replication between a primary and standby cluster.
toc: true
docs_area: manage
---

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

{% include_cached new-in.html version="v23.2" %} CockroachDB physical cluster replication continuously sends all data at the byte level from a _primary_ cluster to an independent _standby_ cluster. Existing data and ongoing changes on the active primary cluster, which is serving application data, replicate asynchronously to the passive standby cluster.

In a disaster recovery scenario, you can [_cut over_]({% link {{ page.version.version }}/cutover-replication.md %}) from the unavailable primary cluster to the standby cluster. This will stop the replication stream, reset the standby cluster to a point in time where all ingested data is consistent, and mark the standby as ready to accept application traffic.

{% comment %}A lot of links at the end of this section to general CV docs{% endcomment %}

## Use cases

You can use physical cluster replication in a disaster recovery plan to:

- Meet your RTO (Recovery Time Objective) and RPO (Recovery Point Objective) needs. Physical cluster replication provides lower RTO and RPO than [backup and restore](backup-and-restore-overview.html). {% comment %}link here to upcoming DR tool comparative table{% endcomment %}
- Automatically replicate everything in your primary cluster to recover quickly from a control plane or full cluster failure.
- Cover different regions when you cannot use individual [multi-region clusters](multiregion-overview.html). Primary and standby clusters can exist in different regions.
- Avoid conflicts in data after recovery because the replication completes to a transactionally consistent state as of a certain point in time.

## Features

- **Asynchronous byte-level replication**: When you initiate a replication stream, it will replicate byte-for-byte all existing user data and associated metadata (e.g., zone configurations) in the primary cluster to the standby cluster asynchronously. From then on, it will continuously replicate user data and metadata in the primary to the standby. Physical cluster replication will automatically replicate changes related to operations such as, schema changes, user and privilege modifications, and zone configuration updates without any manual work.
- **Transactional consistency**: When you cut over to the standby, you can specify `LATEST`, a certain point of time in the past, or future. The standby cluster will be in a transactionally consistent state as of a certain point in time after the cutover process. As a result, there is no need for conflict resolution.
- **Maintained/improved RPO and RTO**: Depending on workload and deployment configuration, [replication lag]({% link {{ page.version.version }}/physical-cluster-replication-technical-overview.md %}) between the primary and standby is generally in the tens of seconds range. The cutover process from the primary cluster to the standby will take 5 minutes or under when completing a cutover to the latest replicated time using `LATEST`.
- **Cutover to a timestamp in the past**: In the case of logical disasters or mistakes, you can cut over from the primary to the standby cluster to a timestamp in the past. This means that you can return the standby to a timestamp before the mistake was replicated to the standby. You can also configure the `WITH RETENTION` option to control how far in the past you can cut over to. {% comment %}link retention option here{% endcomment %}
- **Monitoring**: To monitor the replication progress, you can use metrics available in the [DB Console]({% link {{ page.version.version }}/ui-overview.md %}) and [Prometheus]({% link {{ page.version.version }}/monitor-cockroachdb-with-prometheus.md %}). For more detail, refer to [Physical Cluster Replication Monitoring]({% link {{ page.version.version }}/physical-cluster-replication-monitoring.md %}).

{% comment %}- **Data verification on standby**: You can verify that the data on the standby cluster matches that on the primary by checking the fingerprint of the data on the primary to compare to the standby. We recommend running data verification checks regularly as part of your monitoring processes. Refer to the [Physical Cluster Replication Monitoring]({% link {{ page.version.version }}/physical-cluster-replication-monitoring.md %}) page for a guide and considerations on data verification.(not yet merged as of 10/10){% endcomment %}

{{site.data.alerts.callout_info}}
[Cutting over to a timestamp in the past]({% link {{ page.version.version }}/cutover-replication.md %}#cut-over-to-a-point-in-time) involves reverting data on the standby cluster. As a result, the time it takes to cut over will be longer than cutover to the latest replicated time. The increase in cutover time will correlate to how much data you are reverting from the standby. For more detail, refer to the [Technical Overview]({% link {{ page.version.version }}/physical-cluster-replication-technical-overview.md %}) page for physical cluster replication.
{{site.data.alerts.end}}

## Limitations

- Physical cluster replication is only supported on CockroachDB {{ site.data.products.core }} in new v23.2 clusters. That is, clusters that have been upgraded from a previous version of CockroachDB will not support physical cluster replication.
- Read queries are not supported on the standby cluster before cutover. {% comment %}To verify the data, use new fingerprint feature{% endcomment %}
- The primary and standby cluster **cannot have different [region topology]({% link {{ page.version.version }}/topology-patterns.md %})**. For example, a single-region primary cluster to a multi-region standby cluster. Or, mismatching regions between a multi-region primary and standby cluster.
- Cutting back to the primary cluster after a cutover is a manual process. Refer to [Cut back to the primary cluster]({% link {{ page.version.version }}/cutover-replication.md %}#cut-back-to-the-primary-cluster).
- Before cutover to the standby, the standby cluster does not support running [backups]({% link {{ page.version.version }}/backup-and-restore-overview.md %}) or [changefeeds]({% link {{ page.version.version }}/change-data-capture-overview.md %}).
- After a cutover, there is no mechanism to stop applications from connecting to the original primary. It is necessary to move over application traffic manually.

{% comment %}this title needs updating{% endcomment %}
## Get started

This section is a quick overview of the initial requirements to start a replication stream.

For more comprehensive guides, refer to:

- [Technical Overview]({% link {{ page.version.version }}/physical-cluster-replication-technical-overview.md %}): to understand physical cluster replication in more depth before setup.
- [Set Up Physical Cluster Replication]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}): for a tutorial on how to start a replication stream.
- [Physical Cluster Replication Monitoring]({% link {{ page.version.version }}/physical-cluster-replication-monitoring.md %}): for detail on metrics and observability into a replication stream.
- [Cut Over from a Primary Cluster to a Standby Cluster]({% link {{ page.version.version }}/cutover-replication.md %}): for a guide on how to complete a replication stream and cut over to the standby cluster.

### Starting clusters

To initiate physical cluster replication on clusters, you must [start]({% link {{ page.version.version }}/cockroach-start.md %}) the primary and standby CockroachDB clusters with the `--config-profile` flag. This enables cluster virtualization {% comment %}link to CV docs{% endcomment %} and sets up each cluster ready for replication.

The active primary cluster that serves application traffic:

~~~shell
cockroach start ... --config-profile replication-source
~~~

The passive standby cluster that will ingest the replicated data:

~~~shell
cockroach start ... --config-profile replication-target
~~~

The node topology of the two clusters does not need to be the same. For example, you can provision the standby cluster with fewer nodes. Though it is important to consider that during a failover scenario the standby will need to handle the full production load. {% comment %}this should be in an include file and also added to the main tutorial{% endcomment %} However, the clusters cannot have different region topologies (refer to  [Limitations](#limitations)).

{{site.data.alerts.callout_info}}
Every node in the standby cluster must be able to make a network connection to every node in the primary cluster to start a replication stream successfully.
{{site.data.alerts.end}}

### Connecting to the system interface and virtual cluster

For physical cluster replication each cluster is enabled as a virtualized cluster, the primary and standby both contain:

{% include {{ page.version.version }}/physical-replication/interface-virtual-cluster.md %}

To connect to the SQL shell:

- For the system interface, include the `options=-ccluster=system` parameter in the `postgresql` connection URL:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --url "postgresql://root@{your IP or hostname}:26257/?options=-ccluster=system&sslmode=verify-full" --certs-dir "certs"
    ~~~

- For the application virtual cluster, include the `options=-ccluster=application` parameter in the `postgresql` connection URL:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --url "postgresql://root@{your IP or hostname}:26257/?options=-ccluster=application&sslmode=verify-full" --certs-dir "certs"
    ~~~

{{site.data.alerts.callout_info}}
Physical cluster replication requires an {{ site.data.products.enterprise }} license on the primary and standby clusters. You must set {{ site.data.products.enterprise }} licenses from the system interface.
{{site.data.alerts.end}}

### Managing replication in the SQL shell

To start, manage, and observe physical cluster replication, you can use the following SQL statements:

{% comment %}To link all SQL statements once SQL references are published.{% endcomment %}

Statement | Action
----------+------
`CREATE VIRTUAL CLUSTER ... FROM REPLICATION OF ...` | Start a replication stream.
`ALTER VIRTUAL CLUSTER ... PAUSE REPLICATION` | Pause a running replication stream.
`ALTER VIRTUAL CLUSTER ... RESUME REPLICATION` | Resume a paused replication stream.
`ALTER VIRTUAL CLUSTER ... START SERVICE SHARED` | Initiate a [cutover]({% link {{ page.version.version }}/cutover-replication.md %}).
`SHOW VIRTUAL CLUSTER` | Show the virtual clusters.
`DROP VIRTUAL CLUSTER` | Remove a virtual cluster.

### Cluster versions and upgrades

The standby cluster host will need to be at the same version as, or one version ahead of, the primary's application virtual cluster at the time of cutover.

To upgrade the primary and standby clusters, you must carefully and manually apply the upgrade. We recommend upgrading the standby cluster first. It is preferable to avoid a situation in which the application virtual cluster, which is being replicated, is a version higher than what the standby cluster can serve if you were to cut over.



