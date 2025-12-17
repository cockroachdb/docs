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

However, 'legacy service accounts' that were created before the updated authorization model was enabled for your cloud organization may have permissions assigned under the legacy model (like ADMIN, CREATE, EDIT, READ, DELETE). The legacy model for service accounts is now deprecated. It is recommended to update such service accounts with updated organization roles.

To learn more, refer to [Manage Service Accounts]({{ link_prefix }}managing-access.html#manage-service-accounts).

#### CockroachDB {{ site.data.products.basic }} cluster

A CockroachDB {{ site.data.products.cloud }} cluster with minimal operational features deployed in *shared* network and compute infrastructure.

#### CockroachDB {{ site.data.products.standard }} cluster

A CockroachDB {{ site.data.products.cloud }} cluster with full operational features and provisioned capacity, deployed in *shared* network and compute infrastructure.

#### CockroachDB {{ site.data.products.advanced }} cluster

A CockroachDB {{ site.data.products.cloud }} cluster with full operational capacity deployed in a cloud provider's network and compute infrastructure *dedicated* to each customer. In addition to infrastructure isolation, Advanced clusters can be customized with advanced security features for PCI DSS and HIPAA [compliance]({{ link_prefix }}compliance.html) at an additional cost.

#### Request Unit (RU)

{% include "cockroachcloud/request-units.md" %}

#### Resource limits

The maximum amount of storage and RUs a CockroachDB {{ site.data.products.basic }} cluster can use in a particular billing period. The amount you are billed is based on the actual resources the cluster used during that billing period.

#### Storage

Disk space for permanently storing data over time. All data in CockroachDB {{ site.data.products.basic }} and {{ site.data.products.standard }} is automatically replicated three times and distributed across Availability Zones to survive outages. Storage is measured in units of GiB-months, which is the amount of data stored multiplied by how long it was stored. Storing 10 GiB for a month and storing 1 GiB for 10 months are both 10 GiB-months. The storage you see in the [Cluster Overview]({{ link_prefix }}basic-cluster-management.html#view-cluster-overview) page is the amount of data before considering the replication multiplier.
