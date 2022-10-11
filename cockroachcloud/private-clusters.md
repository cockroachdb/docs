---
title: Create private CockroachDB Dedicated clusters (Preview)
summary: Learn how to create CockroachDB Dedicated clusters with no public IP addresses.
toc: true
docs_area: manage.security
---

{% include feature-phases/preview-opt-in.md %}

Limiting access to a CockroachDB cluster's nodes over the public internet is an important security practice and is also a compliance requirement for many organizations. {{ site.data.products.dedicated }} private clusters allow organizations to meet this objective.

{{ site.data.products.db }} has safeguards in place to protect cluster's data from the public internet. Ingress traffic to a cluster is routed through a load balancer, and it's possible to restrict inbound connections using IP allow-lists, or Virtual Private Cloud (VPC) peering. However, data egress operations such as exports, backups, and Change Data Capture (CDC) use public subnets.

A private {{ site.data.products.dedicated }} cluster's nodes have no public IP addresses, and egress traffic moves over private subnets through a highly-available NAT gateway that is unique to the cluster. This page explains what happens when you create a private cluster, migrate an existing cluster to a private cluster, or migrate a private cluster to no longer be private.

{{site.data.alerts.callout_info}}
Private clusters are not available with {{ site.data.products.serverless-plan }}.
{{site.data.alerts.end}}

## Create or migrate to a private cluster

To be enrolled in the preview, to deploy a new private cluster on AWS, or to migrate an existing cluster to a private cluster, contact your account team.

After your organization is enrolled in the preview:
- By default, newly-created {{ site.data.products.dedicated }} clusters deployed on GCP after TODO will be private clusters, but can be migrated to private clusters.
- By default, newly-created {{ site.data.products.dedicated }} clusters deployed on AWS will **not** be private clusters, but can be migrated to private clusters.

When you create a private cluster:

1. A private subnet is created.
1. As each cluster node is created, it is connect to the private subnet.
1. A NAT gateway is created which spans three separate availability zones, to mitigate against the risk of an availability zone outage.
1. All egress traffic from the cluster is sent across the private subnet and the NAT gateway to reach its destination.

When you migrate an existing cluster to be private, the following sequence occurs with no downtime:

1. A private subnet is created, in addition to the public subnet each cluster node is connected to.
1. One node at a time is drained and restarts, but is now connected only to the private subnet.
1. A NAT gateway is created which spans three separate availability zones, to mitigate against the risk of an availability zone outage.
1. All egress traffic from the cluster is sent across the private subnet and the NAT gateway to reach its destination.

When you migrate an existing private cluster to no longer be private, the following sequence occurs with no downtime:

1. A public subnet is created, in addition to the private subnet each cluster node is connected to.
1. One node at a time is drained and restarts, but is now connected only to the public subnet.
1. The NAT gateway is destroyed.
1. All egress traffic from the cluster is sent across the public subnet to reach its destination.

## Limit incoming connections from egress operations

Egress traffic from a private cluster will always appear to come from the three IP addresses that comprise the cluster's NAT gateway. To determine the NAT gateway's IP addresses, you can initiate an egress operation, such as an `EXPORT` or `BACKUP` operation, on the cluster and observe the source addresses of the resulting connections to your infrastructure. Cockroach Labs recommends that you allow connections to your infrastructure only from those IP addresses.

If you migrate an existing cluster to or from a private cluster, you may need to make adjustments to your network connection rules.
