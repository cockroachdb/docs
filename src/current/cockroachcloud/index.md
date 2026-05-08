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

- **CockroachDB {{ site.data.products.basic }}**: Usage-based pricing. {{ site.data.products.basic }} clusters are ideal for smaller organizations or trial evaluations of CockroachDB.

- **CockroachDB {{ site.data.products.standard }}**: Compute for CockroachDB {{ site.data.products.standard }} is pre-provisioned and storage is usage-based. CockroachDB {{ site.data.products.basic }} clusters can be [upgraded to CockroachDB {{ site.data.products.standard }}]({% link cockroachcloud/change-plan-between-basic-and-standard.md %}). The {{ site.data.products.standard }} plan is in [Preview]({% link {{ site.current_cloud_version}}/cockroachdb-feature-availability.md %}#features-in-preview). 

- **CockroachDB {{ site.data.products.advanced }}**: Fully pre-provisioned, with additional security and compliance features.

## Next steps

- [Understand CockroachDB Cloud Costs]({% link cockroachcloud/costs.md %})
- [Plan a CockroachDB {{ site.data.products.basic }} cluster]({% link cockroachcloud/plan-your-cluster-basic.md %}) and [Create a CockroachDB {{ site.data.products.basic }} cluster]({% link cockroachcloud/create-a-basic-cluster.md %}).
- [Plan a CockroachDB {{ site.data.products.standard }} cluster]({% link cockroachcloud/plan-your-cluster.md %}) and [Create a CockroachDB {{ site.data.products.standard }} cluster]({% link cockroachcloud/create-your-cluster.md %})
- [Plan a CockroachDB {{ site.data.products.advanced }} cluster]({% link cockroachcloud/plan-your-cluster-advanced.md %}) and [Create a CockroachDB {{ site.data.products.advanced }} cluster]({% link cockroachcloud/create-an-advanced-cluster.md %})
