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
**resource limit** | The maximum amount of money you want to spend on a cluster in a particular billing period. The amount you are billed is based on the resources the cluster used during that billing period. A cluster's budget is allocated across storage and burst performance.
**baseline performance** | The minimum compute and I/O performance that you can expect from your cluster at all times. This is 100 RUs per second for all Serverless clusters (free and paid). The actual usage of a cluster may be lower than the baseline performance depending on application traffic, because not every application will need 100 RUs per second at all times. When the cluster's usage is lower than the baseline, the cluster accumulates the unused RUs until the load on the cluster increases above the baseline.
**burst performance** | The ability of the Serverless cluster to perform above the baseline. Supporting application traffic that "bursts," i.e., can fluctuate above baseline traffic, is a key feature of Serverless clusters. Every Serverless cluster starts with a certain amount of burst performance capacity. If the actual usage of a cluster is lower than the baseline performance, the cluster can earn Request Units that can be used for burst performance for the rest of the month. 
**storage** | Disk space for permanently storing data over time. All data in {{ site.data.products.serverless }} is automatically replicated three times and distributed across Availability Zones to survive outages. Storage is measured in units of GiB-months, which is the amount of data stored multiplied by how long it was stored. Storing 10 GiB for a month and storing 1 GiB for 10 months are both 10 GiB-months. The storage you see in the [Cluster Overview]({{ link_prefix }}serverless-cluster-management.html#view-cluster-overview) page is the amount of data before considering the replication multiplier.
