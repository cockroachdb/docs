CockroachDB is a distributed, relational SQL database that is scalable, resilient, and runs transactions at the highest consistency level, _serializable consistency_, to ensure data consistency at all times.

A deployment of CockroachDB is called a _cluster_, even if it only consists of a single node. CockroachDB's architecture allows it to scale to hundreds of nodes and run a cluster across multiple regions, with the ability to locate data geographically.

CockroachDB clusters can be run on cloud infrastructure providers, like Google Cloud Platform (GCP) or Amazon Web Services (AWS), or can be installed on hardware you manage yourself.

Cockroach Labs offers the following products:

- [{{ site.data.products.serverless }}](/docs/cockroachcloud/quickstart.html): a free and pay-as-you-go multi-tenant CockroachDB cluster that instantly scales up and down to meet your workload's demand. {{ site.data.products.serverless }} clusters allow you to set a budget cap, starting at $0, and will never cost more. {{ site.data.products.serverless }} clusters can be created in GCP or AWS in select regions worldwide.
- [{{ site.data.products.dedicated }}](/docs/cockroachcloud/quickstart-trial-cluster.html): a fully-managed single-tenant CockroachDB cluster with no shared resources. {{ site.data.products.dedicated }} clusters support single- and multi-region deployments in GCP and AWS. You pay for and control the resources allocated to your cluster.
- [{{ site.data.products.core }}](/docs/stable/index.html): a fully self-managed version of CockroachDB that can be run anywhere as a single-node cluster or across many nodes.