---
title: Optimize Your CockroachDB Serverless Workload
summary: Tune your workload to reduce costs
toc: true
docs_area: deploy
---

This page describes how to tune your {{ site.data.products.serverless }} workload to reduce costs.

## Understanding your resource usage

{{ site.data.products.serverless }} clusters consume three kinds of resources:

- SQL CPU
- Network Egress
- Storage Layer I/O

To understand these resources, you need to understand a bit about the {{ site.data.products.serverless }} [architecture](architecture.html). A Serverless cluster is divided into two layers that run in separate processes: the SQL Layer and the Storage Layer. The SQL Layer receives and runs your SQL queries and background jobs. When the SQL Layer needs to read or write data rows, it calls the Storage Layer, which manages a replicated, transactional row store that is distributed across many machines.

SQL CPU is simply the CPU consumed by SQL processes (not Storage processes) and is converted to Request Units using this equivalency: 1 RU = 3 milliseconds SQL CPU.

Network Egress measures the number of bytes that are returned from a SQL process to the calling client. It also includes any bytes sent by bulk operations like EXPORT or changefeeds. It is converted to Request Units using this equivalency: 1 RU = 1 KiB Network Egress.

Storage Layer I/O includes the read and write requests sent by the SQL Layer to the Storage Layer. These operations are sent in batches containing any number of requests. Requests can have a payload containing any number of bytes. Write operations are replicated to multiple storage processes (3 by default), with each replica counted as a separate write operation. Storage Layer I/O is converted to [Request Units](learn-about-request-units.html) using these equivalencies:

  - 1 RU = 8 Storage Read requests (per request in batch)
  - 1 RU = 64 KiB request payload (prorated)

  - 1 RU = 1 Storage Write batch
  - 1 RU = 1 Storage Write request (per request in batch)
  - 1 RU = 1 KiB request payload (prorated)

## Understanding which queries to optimize

Placeholder

## Tips for reducing RU usage

You can reduce the RU cost of a query by reducing the work your cluster must do to execute that query. We recommend the following:

- DO drop indexes that are no longer needed.
- DO use secondary indexes that reduce the number of rows that need to be scanned
- DO take advantage of SQL filters, joins, and aggregations rather than performing these operations in the application (to reduce the amount of data returned to the client)
- DO use batched INSERT statements to insert multiple rows in a single statement, rather than sending a separate statement per row
- DO use range UPDATE and DELETE statements to affect many rows in a single statement, rather than sending a separate statement per row
- DO NOT return columns that your application does not need
- DO NOT disable automatic statistics, as they are needed to power the optimizer

## Example

Placeholder

## Learn more

- [Learn About {{ site.data.products.serverless }} Pricing](learn-about-pricing.html)
- [Learn About Request Units](learn-about-request-units.html)
- [Manage Your {{ site.data.products.serverless }} Cluster](serverless-cluster-management.html)
- [CockroachDB Cloud Architecture](architecture.html)