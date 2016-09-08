---
title: Cloud Deployment
summary: Learn how to deploy CockroachDB on Google Cloud Platform GCE or AWS.
toc: false
---

Use the following guides to deploy CockroachDB to popular cloud platforms:

- [Google Cloud Platform (GCE)](deploy-cockroachdb-on-google-cloud-platform.html)
- [Amazon Web Services (AWS)](deploy-cockroachdb-on-aws.html)

## General Deployment Steps (Insecure Clusters)

If we don't have a guide for your platform, you can deploy CockroachDB to any cloud environment using the following steps:

1.	Create firewall rules to allow TCP communication on the following ports:
	- **26257** (`tcp:26257`) for nodes to join clusters and connect with applications
	- **8080** (`tcp:8080`) to expose your Admin UI

2. [Manually deploy CockroachDB](manual-deployment.html#deploy-an-insecure-cluster) to your VMs.


## See Also

- [Manual Deployment](manual-deployment.html)
- [Start a Local Cluster](start-a-local-cluster.html)
