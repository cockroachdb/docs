---
title: CockroachDB Cloud Documentation
summary: Learn more about CockroachDB Cloud, a fully-managed service created and owned by Cockroach Labs that makes deploying, scaling, and managing CockroachDB effortless.
toc: true
contribute: false
cta: false
homepage: false
---

<a id="overview"></a>
## CockroachDB Cloud Overview

CockroachDB {{ site.data.products.cloud }} is a fully-managed service run by Cockroach Labs, which simplifies the deployment and management of CockroachDB. This page provides an introduction to CockroachDB {{ site.data.products.cloud }} and provides an overview of each type of cluster: CockroachDB {{ site.data.products.standard }}, CockroachDB {{ site.data.products.basic }}, and CockroachDB {{ site.data.products.advanced }}.

To get started right away, you can [sign up for a CockroachDB {{ site.data.products.cloud }} account](https://cockroachlabs.cloud) and [create a cluster]({% link cockroachcloud/create-your-cluster.md %}) using [trial credits]({% link cockroachcloud/free-trial.md %}).

## Plans

When you create a cluster in CockroachDB {{ site.data.products.cloud }}, you select its plan. A CockroachDB {{ site.data.products.cloud }} organization can include clusters of each plan. This section provides an overview of each plan. For a more detailed comparison, refer to [CockroachDB Pricing](https://www.cockroachlabs.com/pricing) and [Understand CockroachDB Cloud Costs]({% link cockroachcloud/costs.md %}).

- **CockroachDB {{ site.data.products.basic }}**: Usage-based. Ideal for smaller, bursty applications which require up to 30K RU/second, or approx 60 vCPUs. CockroachDB Serverless clusters are now on CockroachDB {{ site.data.products.basic }}.

- **CockroachDB {{ site.data.products.standard }}**: A new plan in [Preview]({% link {{ site.current_cloud_version}}/cockroachdb-feature-availability.md %}#features-in-preview). Compute for CockroachDB {{ site.data.products.standard }} is pre-provisioned and storage is usage-based. Ideal for consistent workloads up to 200 vCPUs. You can easily switch a CockroachDB {{ site.data.products.basic }} cluster to CockroachDB {{ site.data.products.standard }} in place.

- **CockroachDB {{ site.data.products.advanced }}**: Fully pre-provisioned, with additional security and compliance features. Ideal for high scale applications whihc require more than 200vcpus with sophisticated security requirements. CockroachDB Dedicated clusters are now on CockroachDB {{ site.data.products.advanced }}. CockroachDB Dedicated Advanced clusters are now on CockroachDB {{ site.data.products.advanced }} with enhanced security features enabled.

## Next steps

- [Understand CockroachDB Cloud Costs]({% link cockroachcloud/costs.md %})
- [Plan a CockroachDB {{ site.data.products.basic }} cluster]({% link cockroachcloud/plan-your-cluster-basic.md %}) and [Create a CockroachDB {{ site.data.products.basic }} cluster]({% link cockroachcloud/create-a-basic-cluster.md %}).
- [Plan a CockroachDB {{ site.data.products.standard }} cluster]({% link cockroachcloud/plan-your-cluster.md %}) and [Create a CockroachDB {{ site.data.products.standard }} cluster]({% link cockroachcloud/create-your-cluster.md %})
- [Plan a CockroachDB {{ site.data.products.advanced }} cluster]({% link cockroachcloud/plan-your-cluster-advanced.md %}) and [Create a CockroachDB {{ site.data.products.advanced }} cluster]({% link cockroachcloud/create-an-advanced-cluster.md %})
