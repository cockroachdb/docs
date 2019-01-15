---
title: Cloud Deployment
summary: Learn how to deploy CockroachDB on Google Cloud Platform GCE or AWS.
toc: false
---

Use the following guides to deploy CockroachDB to popular cloud platforms:

- [Amazon Web Services (AWS)](deploy-cockroachdb-on-aws.html)
- [Digital Ocean](deploy-cockroachdb-on-digital-ocean.html)
- [Google Cloud Platform (GCE)](deploy-cockroachdb-on-google-cloud-platform.html)
- [Microsoft Azure](deploy-cockroachdb-on-microsoft-azure.html)

## General Deployment Steps

If we do not have a guide for your platform, you can deploy CockroachDB to any cloud environment using the following steps:

1. Create firewall rules to allow TCP communication on the following ports:
  - **26257** (`tcp:26257`) for nodes to join clusters and connect with applications
  - **8080** (`tcp:8080`) to expose your Admin UI

2. Manually deploy CockroachDB using one of the following steps:
  - [Secure deployments](manual-deployment.html)
  - [Insecure deployments](manual-deployment-insecure.html) *(not recommended for production)*

## See Also

- [Manual Deployment](manual-deployment.html)
- [Orchestration](orchestration.html)
- [Monitoring](monitor-cockroachdb-with-prometheus.html)
- [Start a Local Cluster](start-a-local-cluster.html)
