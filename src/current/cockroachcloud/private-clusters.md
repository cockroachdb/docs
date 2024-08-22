---
title: Create Private Clusters
summary: Learn how to create a private cluster on CockroachDB Dedicated. A private cluster's nodes have no public IP addresses.
toc: true
docs_area: manage.security
cloud: true
---

Limiting access to a CockroachDB cluster's nodes over the public internet is an important security practice and is also a compliance requirement for many organizations. Private clusters on CockroachDB {{ site.data.products.dedicated }} advanced help organizations to meet this objective.

By default, CockroachDB {{ site.data.products.cloud }} has safeguards in place to protect cluster's data from the public internet.

- Ingress traffic to a cluster is routed through a load balancer, and it is possible to restrict inbound connections using a combination of [IP allowlisting]({% link cockroachcloud/network-authorization.md %}#ip-allowlisting) and [private connectivity]({% link cockroachcloud/connect-to-your-cluster.md %}#establish-private-connectivity).
- Egress traffic from a cluster, such as [exports](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/export), [backups](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/backup), and [Change Data Capture (CDC)](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/change-data-capture-overview.html), use public subnets by default.

A CockroachDB {{ site.data.products.dedicated }} advanced cluster is a _private cluster_. Its nodes have no public IP addresses, and egress traffic moves over private subnets and through a highly-available NAT gateway that is unique to the cluster.

A private cluster has one private network per cluster region, and each node is connected to the private network for its region. A NAT gateway is connected to each private network and provides a static egress public IP address.

Egress traffic from the cluster nodes to S3 or Google Cloud Storage flows across the private subnet and through the cloud provider's private network. Egress traffic from the cluster nodes to all other external resources flows across the private subnet and through the NAT gateway.

This page shows how to create a private cluster.

{{site.data.alerts.callout_info}}
Private clusters are not available for [CockroachDB {{ site.data.products.dedicated }} on Azure]({% link cockroachcloud/cockroachdb-dedicated-on-azure.md %}).
{{site.data.alerts.end}}

## Create a private cluster

On GCP, new CockroachDB {{ site.data.products.dedicated }} clusters are private by default.
On AWS, newly CockroachDB {{ site.data.products.dedicated }} advanced clusters deployed on AWS are private by default.

{{site.data.alerts.callout_info}}
An existing cluster can't be migrated in-place to a private cluster.
{{site.data.alerts.end}}

## Limit inbound connections from egress operations

Egress traffic from a private cluster to non-cloud external resources will always appear to come from the static IP addresses that comprise the cluster's NAT gateway. To determine the NAT gateway's IP addresses, you can initiate an egress operation such as an [`EXPORT`](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/export) or [`BACKUP`](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/backup) operation on the cluster and observe the source addresses of the resulting connections to your non-cloud external resources. Cockroach Labs recommends that you allow connections to such resources only from those IP addresses.

## What's next?

- [Security Overview]({% link cockroachcloud/security-overview.md %})
- [Network Authorization]({% link cockroachcloud/network-authorization.md %})
- [Egress Perimeter Controls]({% link cockroachcloud/egress-perimeter-controls.md %})

## Limitations

- An existing cluster can't be migrated in-place to a private cluster. Instead, migrate the existing cluster's data to a new private cluster. Refer to [Migrate Your Database to CockroachDB](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/migration-overview).
- Private clusters are not available with CockroachDB {{ site.data.products.serverless }}.
