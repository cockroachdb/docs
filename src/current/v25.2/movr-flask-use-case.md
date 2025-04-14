---
title: MovR&#58; A Global Application Use-Case
summary: This page covers an example use-case for global applications.
toc: true
docs_area: develop
---

This page guides you through an example use-case for global application development and deployment. It is the first section of the [Develop and Deploy a Global Application]({% link {{ page.version.version }}/movr.md %}#develop-and-deploy-a-global-application) tutorial.

## Overview

MovR is a fictional company that offers users a platform for sharing vehicles, like scooters, bicycles, and skateboards, in select cities across the United States and Europe. To serve users in two continents, the folks at MovR need an application that is globally available, [resilient to system failures](#resiliency-and-distributed-deployments), and [optimized for latency](#latency-in-global-applications).

## Resiliency and distributed deployments

For an application to be resilient to system failures, the application and database need to be deployed on multiple machines (i.e., part of a distributed deployment). In distributed CockroachDB deployments, all data is replicated and distributed across the instances of the database that make up the deployment. For more information about data replication and distribution in CockroachDB, refer to [The Raft Protocol in CockroachDB](https://www.youtube.com/watch?v=k5BR9m8o9ec&feature=youtu.be).

The replication and distribution of data across multiple machines in a *single region* makes the deployment resilient to individual node failures within the region. Replication and distribution across *multiple regions* makes the deployment resilient to entire regional failures. To achieve the highest level of resiliency, we use a multi-region deployment for MovR database and application.

{{site.data.alerts.callout_info}}
In the [example deployment]({% link {{ page.version.version }}/movr-flask-deployment.md %}), the application and the database deployments are deployed on separate machines.
{{site.data.alerts.end}}

## Latency in global applications

If the MovR application and database are deployed in a single region, latency can become a serious problem when users or client applications are located outside the deployment region. Deploying the application and database in multiple regions can improve latency if client requests are expected to originate from multiple deployment region.

Limiting latency improves the user experience, and it can also help you avoid problems with data integrity, like [transaction contention]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#transaction-contention).

For the purpose of this tutorial, we'll focus on two types of latency:

- [*Database latency*](#reducing-database-latency), which we define as the time required to complete read/write operations on the database, issued by an application.
- [*Application latency*](#reducing-application-latency), which we define as the time required to make requests to an application from a client.

### Reducing database latency

If you are building an application, it's likely that the end user will not be making requests to the database directly. Instead, the user makes requests to the application, and the application makes requests to the database on behalf of the user.

To limit the latency between the application and the database:

- Deploy the application so that each instance of the application communicates with the closest database instance. This can be configured during [application deployment]({% link {{ page.version.version }}/movr-flask-deployment.md %}).

- Design the application's persistence layer to limit the number of queries on data stored outside of the region closest to the application. You can use CockroachDB's [multi-region features]({% link {{ page.version.version }}/multiregion-overview.md %}) to control where data is stored and from where it is accessed.

    Note that querying the data closest to the application deployment is not always possible, as some data cannot be assigned to a specific region. In the event that a query requires CockroachDB to scan data spread across multiple regions, CockroachDB will first look for the data in the closest region.

### Reducing application latency

To limit the latency between client and application server requests, you need to deploy your application such that requests are routed to the application deployment closest to the client. This requires a global load balancer that can redirect traffic to application deployments based on client location.

You will set up an external load balancer in [Deploy a Global Serverless Application]({% link {{ page.version.version }}/movr-flask-deployment.md %}).

## Next steps

Next, learn more about [creating a multi-region database schema]({% link {{ page.version.version }}/movr-flask-database.md %}).

## See also

- [`movr-flask` on GitHub](https://github.com/cockroachlabs/movr-flask)
- [CockroachDB Terminology]({% link {{ page.version.version }}/architecture/glossary.md %}#cockroachdb-architecture-terms)
- [Replication Controls]({% link {{ page.version.version }}/configure-replication-zones.md %})
- [Define Table Partitions]({% link {{ page.version.version }}/partitioning.md %})
- [Topology Patterns]({% link {{ page.version.version }}/topology-patterns.md %})
