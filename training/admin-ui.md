---
title: Monitoring with the Admin UI
summary: Learn how CockroachDB's Admin UI offers monitoring.
toc: false
sidebar_data: sidebar-data-training.json
---

<div id="toc"></div>

## Presentation

<iframe src="https://docs.google.com/presentation/d/e/2PACX-1vSvyqEzezsXG4Xu4-skqrG2h7D-POnn3BKqp-jFjDaAEIy5ukW9XtPqFFaMvZZaMuHtXnX_ZdK4j_cm/embed?start=false&loop=false" frameborder="0" width="756" height="454" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>

#### URL for comments

[Monitoring with the Admin UI](https://docs.google.com/presentation/d/1hRLgf_sNuBVRkeAkkwlu8boWn3VB3uolDK43wFBByO4/)

## Lab

In this lab, we'll see that the Admin UI provides real-time monitoring for your cluster.

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
