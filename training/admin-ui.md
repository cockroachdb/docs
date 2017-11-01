---
title: Monitoring with the Admin UI
summary: Learn how CockroachDB's Admin UI offers monitoring.
toc: false
sidebar_data: sidebar-data-training.json
---

## Presentation

[Monitoring with the Admin UI](https://docs.google.com/presentation/d/1hRLgf_sNuBVRkeAkkwlu8boWn3VB3uolDK43wFBByO4/)

## Lab

In this lab, we'll get a high-level sense that the Admin UI provides real-time monitoring of your cluster.

### Before You Begin

To complete this lab, you should have a [local cluster of 3 nodes](3-node-local-secure-cluster.html).

### See Real-Time Monitoring in the Admin UI

2. In a browser, open the Admin UI from `localhost:8080`.

3. Back in terminal, kill third node:

    ~~~ shell
    $ cockroach quit --certs=certs-dir --host=26259
    ~~~

4. Watch the Admin UI as it detects the node is unavailable.

5. Have the node rejoin the cluster:

    ~~~ shell
    $ cockroach start --certs=certs-dir --background --join=localhost:26257
    ~~~

6. Watch the Admin UI detect that the node has rejoined the cluster.

## Up Next

- [Long-Running Queries](long-running-queries.html)
