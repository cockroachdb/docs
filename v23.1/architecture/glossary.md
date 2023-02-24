---
title: Glossary
summary: Learn about database, CockroachDB architecture and deployment, and CockroachCloud terminology.
toc: true
docs_area: get_started
---

This page defines terms that you will encounter throughout the documentation.

{% include {{ page.version.version }}/misc/database-terms.md %}

{% include {{ page.version.version }}/misc/basic-terms.md %}

For more information on CockroachDB architecture, see [Architecture Overview](overview.html#overview).

## CockroachDB deployment terms

Term | Definition
-----|-----------
**single tenant** | A type of CockroachDB deployment where a single customer uses the database cluster.
**multi-tenant** | A type of CockroachDB deployment where multiple customers share a single storage cluster. Each customer sees a virtual CockroachDB cluster. Data in each virtual cluster is isolated and is invisible to other customers.
**region** | A logical identification of how nodes and data are clustered around [geographical locations](../multiregion-overview.html). A _cluster region_ is the set of locations where cluster nodes are running. A _database region_ is the subset of cluster regions database data should be restricted to.
**availability zone**  | A part of a data center that is considered to form a unit with regards to failures and fault tolerance. There can be multiple nodes in a single availability zone, however Cockroach Labs recommends that you to place different replicas of your data in different availability zones.
**[{{ site.data.products.serverless }}](../../cockroachcloud/quickstart.html)** | A fully managed, multi-tenant CockroachDB deployment, in a single region and cloud (AWS or GCP). Delivers an instant, autoscaling database and offers a generous free tier and consumption based billing once free limits are exceeded. Billed and scaled according to the resources _consumed_.
**[{{ site.data.products.dedicated }}](../../cockroachcloud/quickstart-trial-cluster.html)** | A fully managed, single tenant CockroachDB deployment in a single region or multi-region cloud (AWS or GCP), billed according to the resources _provisioned for_ the cluster.  This service tier offers [advanced security features](../security-reference/security-overview.html).
**[CockroachDB Self-Hosted](../start-a-local-cluster.html)** | A full featured, self-managed CockroachDB deployment.

For more information on deployment options and guidelines on how to choose a deployment option, see [How to Choose a Deployment Option](../choose-a-deployment-option.html).

{% include common/basic-terms.md %}

For more information on CockroachDB Cloud, see [CockroachDB Cloud Architecture](../../cockroachcloud/architecture.html#architecture).
