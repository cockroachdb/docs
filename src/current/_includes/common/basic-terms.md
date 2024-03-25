{% if page.cloud == true %}
  {% assign link_prefix = "../cockroachcloud/" %}
{% else %}
  {% assign link_prefix = "../../cockroachcloud/" %}
{% endif %}

## CockroachDB {{ site.data.products.cloud }} terms

#### Organization

In CockroachDB {{ site.data.products.cloud }}, an organization corresponds to an authorization hierarchy rooted linked to a billing account. The admins of the organization can add or invite other users to it.

To learn more, refer to [Overview of the CockroachDB Cloud authorization model]({{ link_prefix }}authorization.html#overview-of-the-cockroachdb-cloud-authorization-model).

#### User

A CockroachDB {{ site.data.products.cloud }} user can belong to one or more organizations.

Organization users are granted permissions to perform organization and cluster administration functions through one or more roles: [Organization user roles]({{ link_prefix }}authorization.html#organization-user-roles).

{{site.data.alerts.callout_info}}
The concept of *Organization user* is distinct from *SQL user/role* in any given cluster.

Learn more: [Overview of the CockroachDB Cloud authorization model]({{ link_prefix }}authorization.html#overview-of-the-cockroachdb-cloud-authorization-model).
{{site.data.alerts.end}}

#### Service Account

A service account is a type of identity similar to an Organization user, but is intended to be used for automation.

Service accounts authenticate with API keys to the CockroachDB {{ site.data.products.cloud }} API, rather than to the CockroachDB {{ site.data.products.cloud }} Console UI.

Service accounts operate under a unified authorization model with organization users, and can be assigned all of the same [organization roles]({{ link_prefix }}authorization.html#organization-user-roles) as users.

To learn more, refer to [Manage Service Accounts]({{ link_prefix }})managing-access.html#manage-service-accounts)

#### CockroachDB {{ site.data.products.serverless }} cluster

A CockroachDB {{ site.data.products.cloud }} cluster deployed on request for a specific customer in *shared* network and compute infrastructure.

#### CockroachDB {{ site.data.products.dedicated }} cluster

A CockroachDB {{ site.data.products.cloud }} cluster deployed on request for a specific customer, in a cloud provider's network and compute infrastructure *dedicated* to that customer, which can be distributed over multiple regions for added disaster-resilience. In addition to infrastructure isolation, dedicated clusters can be customized with advanced network, identity-management, and encryption-related security features.

#### Request Unit (RU)

Represents the compute and I/O resources used by a query. All database operations in CockroachDB {{ site.data.products.serverless }} cost a certain amount of RUs depending on the resources used. For example, a "small read" might cost 2 RUs, and a "large read" such as a full table scan with indexes could cost a large number of RUs. You can see how many Request Units your cluster has used on the [Cluster Overview]({{ link_prefix }}serverless-cluster-management.html#view-cluster-overview) page.

#### Resource limits

The maximum amounts of storage and RUs a CockroachDB {{ site.data.products.serverless }} cluster can use in a particular billing period. The amount you are billed is based on the actual resources the cluster used during that billing period.

#### Storage

Disk space for permanently storing data over time. All data in CockroachDB {{ site.data.products.serverless }} is automatically replicated three times and distributed across Availability Zones to survive outages. Storage is measured in units of GiB-months, which is the amount of data stored multiplied by how long it was stored. Storing 10 GiB for a month and storing 1 GiB for 10 months are both 10 GiB-months. The storage you see in the [Cluster Overview]({{ link_prefix }}serverless-cluster-management.html#view-cluster-overview) page is the amount of data before considering the replication multiplier.
