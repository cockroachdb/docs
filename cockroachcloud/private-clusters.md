---
title: Create private CockroachDB Dedicated clusters (Preview)
summary: Learn how to create CockroachDB Dedicated clusters with no node-level public IP addresses.
toc: true
docs_area: manage.security
---

{% include feature-phases/preview-opt-in.md %}

Limiting access to a CockroachDB cluster's nodes over the public internet is an important security practice and is also a compliance requirement for many organizations. {{ site.data.products.dedicated }} private clusters allow organizations to meet this objective.

By default, {{ site.data.products.db }} has safeguards in place to protect cluster's data from the public internet. Ingress traffic to a cluster is routed through a load balancer, and it's possible to restrict inbound connections using a combination of [IP allowlisting](/docs/cockroachcloud/network-authorization.html#ip-allowlisting) and [AWS PrivateLink](/docs/cockroachcloud/network-authorization.html#aws-privatelink) or [GCP VPC peering](/docs/cockroachcloud/network-authorization.html#vpc-peering). However, data egress operations such as exports, backups, and Change Data Capture (CDC) use public subnets.

On the other hand, a private {{ site.data.products.dedicated }} cluster's nodes have no public IP addresses, and egress traffic moves over private subnets through a highly-available NAT gateway that is unique to the cluster. This page explains what happens when you create a private cluster. Existing clusters that are not created as private clusters can't be switched in place, unless you choose to perform full data migration to a new private cluster.

{{site.data.alerts.callout_info}}
Private clusters are not available with {{ site.data.products.serverless-plan }}.
{{site.data.alerts.end}}

## Create or migrate to a private cluster

To be enrolled in the preview and deploy a new private cluster on AWS or GCP, contact your account team.

After your organization is enrolled in the preview:

- By default, newly-created {{ site.data.products.dedicated }} clusters deployed on GCP after TODO will be private clusters. Existing clusters deployed on GCP can't be switched in place to be private.
- By default, newly-created {{ site.data.products.dedicated }} clusters deployed on AWS will **not** be private, and can't be switched in place to be private after the fact. For a cluster on AWS to be private, you can create the cluster using CockroachDB Cloud API by specifying a special field. Contact your account team for details.

When you create a private cluster:

1. A private subnet is created per requested region.
1. Each node is connected to the regional private subnet.
1. A highly-available NAT gateway is created with static egress public IP addresses. For private clusters deployed on AWS, the NAT gateways are created in three separate availability zones to mitigate against the risk of an availability zone outage.
1. All egress traffic from the cluster nodes to non-cloud buckets is sent across the private subnet and through the NAT gateway to reach its destination.
1. All egress traffic from the cluster nodes to S3 (for private clusters on AWS) or Google Cloud Storage (for private clusters on GCP) is sent across the private subnet and through the private network for the relevant cloud provider (S3 Gateway endpoints on AWS and Private Google Access on GCP).

## Limit incoming connections from egress operations

Egress traffic from a private cluster will always appear to come from the static IP addresses that comprise the cluster's NAT gateway. To determine the NAT gateway's IP addresses, you can initiate an egress operation, such as an `EXPORT` or `BACKUP` operation on the cluster and observe the source addresses of the resulting connections to your infrastructure. Cockroach Labs recommends that you allow connections to your infrastructure only from those IP addresses.
