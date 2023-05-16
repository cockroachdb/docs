---
title: CockroachDB Tutorials
summary: An overview of developer and deployment tutorials using CockroachDB
toc: true
contribute: true
docs_area: develop
---

Start building applications and integrating CockroachDB into your tools with these tutorials.

## Developer tutorials

We have [extensive developer tutorials](example-apps.html) with examples in different languages and frameworks.

## Case study tutorials

Follow these tutorials to develop more extensive applications using CockroachDB:

- The [Roach Data application](build-a-spring-app-with-cockroachdb-jdbc.html) uses Spring Boot with either JDBC or [JPA](build-a-spring-app-with-cockroachdb-jpa.html), and uses [Liquibase](liquibase.html) within the application for schema management.
- MovR consists of:
  - An extensive dataset (used in [`cockroach workload`](cockroach-workload.html) and [`cockroach demo`](cockroach-demo.html)).
  - A [Python application](movr.html) that uses the dataset. 
  - A [tutorial on how to reduce latency in reads and writes](demo-low-latency-multi-region-deployment.html) using MovR in a multi-region cluster.
  - [A tutorial on developing a globally available application deployed on Google cloud](movr-flask-overview.html) using MovR.
- A [tutorial on developing and deploying a Python and Flask To-Do application](../cockroachcloud/deploy-a-python-to-do-app-with-flask-kubernetes-and-cockroachcloud.html) using Kubernetes and {{ site.data.products.dedicated }}.

## Integration tutorials

CockroachDB can be used with:

- Schema migration tools like [Alembic](alembic.html), [Flyway](flyway.html), and [Liquibase](liquibase.html).
- SQL IDEs like [DBeaver](dbeaver.html) and [ItelliJ IDEA](intellij-idea.html).
- Data security tools like [Satori](satori-integration.html) and [HashiCorp Vault](hashicorp-integration.html).
