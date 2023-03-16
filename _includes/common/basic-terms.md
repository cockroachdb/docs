{% if page.cloud == true %}
  {% assign link_prefix = "../cockroachcloud/" %}
{% else %}
  {% assign link_prefix = "../../cockroachcloud/" %}
{% endif %}

## CockroachDB Cloud terms

Term | Definition
-----|-----------
**Serverless cluster** | A CockroachDB cluster billed and scaled according to the resources _consumed_ by the cluster.
**Dedicated cluster** | A CockroachDB cluster billed according to the resources _provisioned for_ the cluster.
**Request Unit (RU)** | Represents the compute and I/O resources used by a query. All database operations in {{ site.data.products.serverless }} cost a certain amount of RUs depending on the resources used. For example, a "small read" might cost 2 RUs, and a "large read" such as a full table scan with indexes could cost a large number of RUs. You can see how many Request Units your cluster has used on the [Cluster Overview]({{ link_prefix }}serverless-cluster-management.html#view-cluster-overview) page.
**resource limits** | The maximum amount of RUs and storage you want your cluster to be able to consume in a given billing period. A cluster's storage and RU limits can be set separately. You will only be charged for the resources you use.
**storage** | Disk space for permanently storing data over time. All data in {{ site.data.products.serverless }} is automatically replicated three times and distributed across Availability Zones to survive outages. Storage is measured in units of GiBs. The storage you see in the [Cluster Overview]({{ link_prefix }}serverless-cluster-management.html#view-cluster-overview) page is the amount of data before considering the replication multiplier.
**throttled** | Limited cluster access. When a cluster reaches its storage limit, it will be throttled so that access is limited to deleting data or raising its storage limit.
**disabled** | No cluster access. When a cluster reaches its RU limit, it will be disabled until more RUs become available, either by raising its RU limit or waiting until the next billing cycle.
