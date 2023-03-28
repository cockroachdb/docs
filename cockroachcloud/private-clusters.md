---
title: Create Private Clusters
summary: Learn how to create a private cluster on CockroachDB Dedicated. A private cluster's nodes have no public IP addresses.
toc: true
docs_area: manage.security
cloud: true
---

Limiting access to a CockroachDB cluster's nodes over the public internet is an important security practice and is also a compliance requirement for many organizations. {{ site.data.products.dedicated }} private clusters allow organizations to meet this objective.

By default, {{ site.data.products.db }} has safeguards in place to protect cluster's data from the public internet. Ingress traffic to a cluster is routed through a load balancer, and it is possible to restrict inbound connections using a combination of [IP allowlisting](/docs/cockroachcloud/network-authorization.html#ip-allowlisting), and either of [AWS PrivateLink](/docs/cockroachcloud/network-authorization.html#aws-privatelink) or [GCP VPC peering](/docs/cockroachcloud/network-authorization.html#vpc-peering) depending on your cloud provider. However, data egress operations such as [exports](/docs/stable/export.html), [backups](/docs/stable/backup.html), and [Change Data Capture (CDC)](/docs/stable/change-data-capture-overview.html) use public subnets.

On the other hand, a private cluster's nodes have no public IP addresses, and egress traffic moves over private subnets and through a highly-available NAT gateway that is unique to the cluster.

One private network exists per cluster region, and each node is connected to the private network for its region. A NAT gateway is connected to each private network and provides a static egress public IP address.

Egress traffic from the cluster nodes to S3 or Google Cloud Storage flows across the private subnet and through the cloud provider's private network. Egress traffic from the cluster nodes to all other external resources flows across the private subnet and through the NAT gateway.

This page shows how to create a private cluster.

## Create a private cluster

To create a private cluster, you must use [{{ site.data.products.db }} API](cloud-api.html) or [CockroachDB's Terraform provider](https://registry.terraform.io/providers/cockroachdb/cockroach/latest/docs/resources/cluster). When you [create](https://cockroachlabs.com/docs/api/cloud/v1/clusters) a private cluster using Terraform Provider, you set its `private_network_visibility` field to `true`. This in turn automatically sets uses the Cloud API to set the cluster's `network_visibility` field to `NETWORK_VISIBILITY_PRIVATE`.

{{site.data.alerts.callout_info}}
An existing cluster can't be migrated in-place to a private cluster.
{{site.data.alerts.end}}

On GCP, new {{ site.data.products.dedicated }} clusters are private by default.
On AWS, newly {{ site.data.products.dedicated }} clusters deployed on AWS are **not** private by default.

## Limit inbound connections from egress operations

Egress traffic from a private cluster to non-cloud external resources will always appear to come from the static IP addresses that comprise the cluster's NAT gateway. To determine the NAT gateway's IP addresses, you can initiate an egress operation such as an [`EXPORT`](/docs/stable/export.html) or [`BACKUP`](/docs/stable/backup.html) operation on the cluster and observe the source addresses of the resulting connections to your non-cloud external resources. Cockroach Labs recommends that you allow connections to such resources only from those IP addresses.

## What's next?

- [Security Overview](security-overview.html)
- [Network Authorization](network-authorization.html)
- [Egress Perimeter Controls](egress-perimeter-controls.html)

## Limitations

- An existing cluster can't be migrated in-place to a private cluster. Instead, migrate the existing cluster's data to a new private cluster. Refer to [Migrate Your Database to CockroachDB](/docs/stable/migration-overview.html).
- Private clusters are not available with {{ site.data.products.serverless }}.
