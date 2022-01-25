---
title: Choose a Development Environment for CockroachDB
summary: Start a development CockroachDB cluster in the cloud or on your local machine
toc: true
---

{% include common/about-cockroachdb.md %}

{{ site.data.products.serverless }} clusters are ideal for new CockroachDB users, developers with starter projects, or anyone who wants a cloud database but doesn't want a surprise bill if their application consumes more resources than they originally anticipated. To [get started with {{ site.data.products.serverless }}](../cockroachcloud/quickstart.html), [create a CockroachDB Cloud account](../cockroachcloud/create-an-account.html), and [create a {{ site.data.products.serverless }} cluster](../cockroachcloud/create-a-serverless-cluster.html).

{{ site.data.products.dedicated }} clusters are ideal for users who want a fully-managed cloud database with dedicated hardware and [multi-region support or other {{ site.data.products.enterprise }} features](enterprise-licensing.html). To [get started with {{ site.data.products.dedicated }}](../cockroachcloud/quickstart-trial-cluster.html), [create a CockroachDB Cloud account](../cockroachcloud/create-an-account.html), and [create a {{ site.data.products.dedicated }} cluster](../cockroachcloud/create-your-cluster.html).

{{ site.data.products.core }} clusters are ideal for users who want a local cluster to develop their applications against, for advanced users who want to manage their clusters from development to production, or for users who need [multi-region support or other {{ site.data.products.enterprise }} features](enterprise-licensing.html). [Install the CockroachDB binary](install-cockroachdb.html) and then [start a cluster](secure-a-cluster.html). The simplest way of getting started is to [start a local single-node cluster](cockroach-start-single-node.html), and you can later add more nodes to your cluster as needed.
