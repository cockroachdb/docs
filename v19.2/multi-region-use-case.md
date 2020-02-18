---
title: MovR&#58; An Example Multi-Region Use-Case
summary: This page covers an example use-case for multi-region applications.
toc: true
---

This page walks you through an example use case for multi-region application development and deployment. It is the first section of the [Develop and Deploy a Multi-Region Web Application](multi-region-overview.html) tutorial.

## Overview

MovR is a fictional company that offers users a platform for sharing vehicles, like scooters, bicycles, and skateboards, in select cities across the United States and Europe. To serve users in two continents, they need an application that is globally available, [resilient to  system failures](multi-region-use-case.html#resiliency-and-distributed-deployments), and [optimized for latency](multi-region-use-case.html#latency-in-global-applications). To meet these requirements, the application is built on CockroachDB, and designed and deployed to consider resiliency and latency across different geographic locations.

## Resiliency and distributed deployments

For an application to be resilient to system failures, the application server and database need to be deployed on multiple machines (i.e., part of a distributed deployment). In distributed CockroachDB deployments, all data is replicated and distributed across the instances of the database that make up the deployment.  For more information about data replication and distribution in CockroachDB, see [The Raft Protocol in CockroachDB](https://www.youtube.com/watch?v=k5BR9m8o9ec&feature=youtu.be).

The replication and distribution of data across multiple machines in a *single region* makes the deployment resilient to individual node failures within the region. Replication and distribution across *multiple regions* makes the deployment resilient to regional failures. To make the database resilient to regional failures, use a multi-region deployment.

{{site.data.alerts.callout_info}}
In the example deployment, the application and the database deployments are separate and not co-located on the same machine.
{{site.data.alerts.end}}

## Latency in global applications

If the MovR application and database are deployed in a single region, latency can be a serious problem for users located in cities outside the deployment region. However, deploying the application and database in multiple regions will not improve latency if client requests are sent to any server in the deployment, without consideration for the client's location.

Limiting latency improves the user experience, and it can also help avoid problems with data integrity, like [transaction contention](performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention). For the purpose of this tutorial, we'll focus on two types of latency:

- [*Database latency*](multi-region-use-case.html#database-latency), which we define as the time required to complete database operations.
- [*Application latency*](multi-region-use-case.html#application-latency), which we define as the time required to make requests to an application server.

### Database latency

To reduce database latency in a distributed CockroachDB deployment, data can be [geo-partitioned](topology-geo-partitioned-replicas.html). Geo-partitioning enables you to control where specific rows of data are stored. Limiting database operations to specific partitions can reduce the distance requests need to travel between the client and the database.

{{site.data.alerts.callout_info}}
Geo-partitioned replicas can dramatically improve latency in multi-region deployments, but at the [cost of resiliency](https://www.cockroachlabs.com/docs/stable/topology-geo-partitioned-replicas.html#resiliency). Geo-partitioned replicas are resilient to availability zone failures, but not regional failures.
{{site.data.alerts.end}}

If you are building an application, it's likely that the end user will not be making requests to the database directly. Instead, the user makes requests to the application, and the application makes requests to the database on behalf of the user. To limit the latency between the application and the database, you need to design and deploy your application such that:

- Each instance of the application communicates with the closest database instance. This can be configured during the deployment. Later in the tutorial, in the [multi-region deployment steps](multi-region-deployment.html#multi-region-application-deployment-gke), we walk you through configuring the application to communicate with the database closest to it.
- The application's database operations query relevant, geo-partitioned data. To do this, the application must be aware of the client's location. This requires the load balancer to pass client location information to the application. We cover configuring custom HTTP headers for client location in the [application deployment steps](multi-region-deployment.html#multi-region-application-deployment-gke). We also discuss [handling client location server-side](multi-region-application.html#client-location) in [Developing a Multi-Region Web Application](multi-region-application.html).

### Application latency

To limit the latency between client and application server requests, you need to deploy your application such that requests are routed to the application deployment closest to the client. This requires a global load balancer that can redirect traffic to application deployments, based on client location. We cover setting up a multi-cluster ingress in the [multi-region application deployment steps](multi-region-deployment.html#multi-region-application-deployment-gke).

In the sections that follow, we cover some best practices in database schema creation with an example database. We also cover some basics for developing a locality-aware, global application.

## Next steps

You should now be ready to start [creating a multi-region database schema](multi-region-database.html).

## See also

- [movr-flask on GitHub](https://github.com/cockroachlabs/movr-flask)
- [CockroachDB terminology](architecture/overview.html#terms)
- [Configure Replication Zones](configure-replication-zones.html)
- [Define Table Partitions](partitioning.html)
- [Topology Patterns](topology-patterns.html)
- [Geo-Partitioned Replicas Topology](topology-geo-partitioned-replicas.html)
