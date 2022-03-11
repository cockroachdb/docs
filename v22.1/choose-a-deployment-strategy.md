---
title: How to Choose a Deployment Strategy
summary: Learn how to choose between CockroachDB Serverless, Dedicated, and Self-Hosted deployment strategies.
toc: true
docs_area: deploy
---

Cockroach Labs offers three ways to use and deploy CockroachDB: two managed services -- CockroachDB Serverless and CockroachDB Dedicated -- and a self managed option -- CockroachDB Self-Hosted.

This page describes the properties of the three options and gives use cases for each option.

## CockroachDB Serverless (beta)

CockroachDB Serverless (beta) is a multi-tenant CockroachDB deployment, managed by Cockroach Labs, in a single region and cloud (AWS or GCP). CockroachDB Serverless lets you create and start clusters instantly.

- **Isolation**: Customers share CockroachDB software and infrastructure. Customer data is isolated and remains invisible to other customers.
- **CockroachDB version**: Managed by Cockroach Labs and upgraded periodically.
- **Operations**: Cockroach Labs SRE provides guaranteed uptime and backups every three hours.
- **Scaling**: Scale by increasing spend limits in Cloud Console.
- **Cost**: Consumption based billing and spend limits enforce budget requirements.
- **Support**: Provided by community.
- **Enterprise features**: Not available.

### Use cases

- Starter projects and evaluations.
- Only need a single region.

## CockroachDB Dedicated

CockroachDB Dedicated is a single tenant CockroachDB deployment, managed by Cockroach Labs, in a single, multi-region cloud (AWS or GCP).

- **Isolation**: Customers have their own instance of CockroachDB software and infrastructure.
- **CockroachDB version**: Choose when creating a cluster.
- **Operations**: Cockroach Labs SRE provides guaranteed uptime, optimization, security, and operations for cluster, node, and cloud instances with daily and hourly backups.
- **Scaling**: Scale by adding nodes in Cloud Console.
- **Cost**: Per node, cloud instances, and cluster SRE all inclusive. Cockroach Labs packages all the costs of hardware, IOPs, network, load balancers, and the SRE resources required to manage the environment in one price so you have a firm understanding and predictability of your database costs.
- **Support**: Enterprise grade support provided by Cockroach Labs.
- **Enterprise features**: Available. See [Enterprise Features](enterprise-licensing.html).

### Use cases

- Mission-critical databases.
- Future need to add new resources to expand application service.
- Future need to add new regions serve customers in new markets.
- Take advantage of Enterprise features.

## CockroachDB Self-Hosted

CockroachDB Self-Hosted is a self-managed CockroachDB deployment, backed by Cockroach Labs Support, for multiple clouds and regions.

- **Isolation**: Customers manage their own instance of CockroachDB software and infrastructure.
- **CockroachDB version**: Choose when installing CockroachDB.
- **Scaling**: Scale by adding nodes and clusters in DB Console.
- **Operations**: Self deployed and managed. Manual scaling.
- **Cost**: Per vCPU on any cloud or infrastructure type.
- **Support**: Provided by Cockroach Labs.
- **Enterprise features**: Available. See [Enterprise Features](enterprise-licensing.html).

### Use cases

- Require complete control over the database environment.
- Run in multi-cloud and inter-cloud deployments.
- Run in a cloud, e.g. Azure, not supported by managed services.
- Take advantage of Enterprise features.

## See also

- [CockroachDB deployment](glossary.html#cockroachdb-deployment)
- [CockroachDB pricing](https://www.cockroachlabs.com/get-started-cockroachdb/)
- [CockroachDB Cloud FAQs](../cockroachcloud/serverless-faqs.html)
- [CockroachDB Cloud Architecture](../cockroachcloud/architecture.html)
- [Manual Deployment](manual-deployment.html)
- [Kubernetes Deployment](kubernetes-overview.html)
