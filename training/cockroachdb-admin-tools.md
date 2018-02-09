---
title: Monitoring with the Admin UI
summary: Learn how CockroachDB's Admin UI offers monitoring.
toc: false
sidebar_data: sidebar-data-training.json
---

<div id="toc"></div>

## Presentation

<iframe src="https://docs.google.com/presentation/d/e/2PACX-1vSvyqEzezsXG4Xu4-skqrG2h7D-POnn3BKqp-jFjDaAEIy5ukW9XtPqFFaMvZZaMuHtXnX_ZdK4j_cm/embed?start=false&loop=false" frameborder="0" width="756" height="454" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>

## Lab

In this lab, we'll see that the Admin UI provides real-time monitoring for your cluster.

### Before You Begin

To complete this lab, you need a [local cluster of 3 nodes](3-node-local-secure-cluster.html).

### See Real-Time Monitoring in the Admin UI

2. In a browser, open the Admin UI from `localhost:8080`.

3. Back in terminal, kill third node:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach quit --certs-dir=certs --port=26259
    ~~~

4. Return to the Admin UI and watch as it detects the node is unavailable.

5. Have the node rejoin the cluster:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --certs-dir=certs \
    --store=node3 \
    --background \
    --port=26259 \
    --http-port=8082 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

6. Watch the Admin UI detect that the node has rejoined the cluster.

## What's Next?

- [Long-Running Queries](long-running-queries.html)
