{% if page.cloud == true %}
  {% assign link_prefix = "../cockroachcloud/" %}
{% else %}
  {% assign link_prefix = "../../cockroachcloud/" %}
{% endif %}

## {{ site.data.products.db }} terms

### Organization

In {{ site.data.products.db }}, an organization corresponds to an authorization hierarchy rooted linked to a billing account. The admins of the organization can add or invite other users to it.

To learn more, refer to [Overview of the CockroachDB Cloud two-level authorization model]({{ link_prefix }}authorization.html#overview-of-the-cockroachdb-cloud-two-level-authorization-model).

### User

A {{ site.data.products.db }} user can belong to one or more organizations.

{{site.data.alerts.callout_info}}
The concept of *Organization user* is distinct from *SQL user/role* in any given cluster.

Learn more: [Overview of the CockroachDB Cloud two-level authorization model]({{ link_prefix }}authorization.html#overview-of-the-cockroachdb-cloud-two-level-authorization-model).
{{site.data.alerts.end}}

### {{ site.data.products.serverless }} cluster

A {{ site.data.products.db }} cluster deployed on request for a specific customer in *shared* network and compute infrastructure.

### {{ site.data.products.dedicated }} cluster

A {{ site.data.products.db }} cluster deployed on request for a specific customer, in a cloud provider's network and compute infrastructure *dedicated* to that customer, which can be distributed over multiple regions for added disaster-resilience. In addition to infrastructure isolation, dedicated clusters can be customized with advanced network, identity-management, and encryption-related security features.

### Request Unit (RU)

Represents the compute and I/O resources used by a query. All database operations in {{ site.data.products.serverless }} cost a certain amount of RUs depending on the resources used. For example, a "small read" might cost 2 RUs, and a "large read" such as a full table scan with indexes could cost a large number of RUs. You can see how many Request Units your cluster has used on the [Cluster Overview]({{ link_prefix }}serverless-cluster-management.html#view-cluster-overview) page.

### Resource limits

The maximum amounts of storage and RUs a {{ site.data.products.serverless }} cluster can use in a particular billing period. The amount you are billed is based on the actual resources the cluster used during that billing period.

### Storage

Disk space for permanently storing data over time. All data in {{ site.data.products.serverless }} is automatically replicated three times and distributed across Availability Zones to survive outages. Storage is measured in units of GiB-months, which is the amount of data stored multiplied by how long it was stored. Storing 10 GiB for a month and storing 1 GiB for 10 months are both 10 GiB-months. The storage you see in the [Cluster Overview]({{ link_prefix }}serverless-cluster-management.html#view-cluster-overview) page is the amount of data before considering the replication multiplier.
