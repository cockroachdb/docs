---
title: Long Running Queries
summary: 
toc: false
sidebar_data: sidebar-data-training.json
---

## Presentation

[Long-Running Queries](https://docs.google.com/presentation/d/1ymrcgdemvtYxMaIAS5o-9li4BO5ox7gERrwZnBxjraw/)

## Lab

In this lab, we'll check out the page in the Admin UI that also shows us long-running queries.

### Before You Begin

To complete this lab, you should have a [local cluster of 3 nodes](3-node-local-insecure-cluster-load-gen.html).

For the chance at seeing any meaningful data display here, you'll also need to have [run a load generator at some point](3-node-local-insecure-cluster-load-gen.html#set-up-haproxy-load-balancing).

### Step 1. Find Long-Running Queries in the CLI

1. Launch the built-in SQL client:

    ~~~ sql
    cockroach sql --insecure
    ~~~

2. Find the long-running queries:

    ~~~ sql
    > SELECT query_id, query, start FROM [SHOW CLUSTER QUERIES]
          WHERE start < (now() - INTERVAL '1 hour');
    ~~~

### Step 2. Find Long-Running Queries in the Admin UI

1. Access the Admin UI at `http://localhost:8080`

2. Find your long-running queries from **Dashboards** > **Slow Running Queries**.

If your cluster had any queries still running, this is where they would display.

## Up Next

- [Third-Party Monitoring & Alerts](monitoring.html)
