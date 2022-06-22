---
title: Start a Cluster in Docker (Insecure)
summary: Run an insecure multi-node CockroachDB cluster across multiple Docker containers on a single host.
toc: true
---

<div id="os-tabs" class="clearfix">
  <button id="mac" class="current" data-eventcategory="buttonClick-doc-os" data-eventaction="mac">Mac</button>
  <a href="start-a-local-cluster-in-docker-linux.html"><button id="linux" data-eventcategory="buttonClick-doc-os" data-eventaction="linux">Linux</button></a>
  <a href="start-a-local-cluster-in-docker-windows.html"><button id="windows" data-eventcategory="buttonClick-doc-os" data-eventaction="windows">Windows</button></a>
</div>

Once you've [installed the official CockroachDB Docker image](install-cockroachdb.html), it's simple to run an insecure multi-node cluster across multiple Docker containers on a single host, using Docker volumes to persist node data.

{% include_cached cockroachcloud/use-cockroachcloud-instead.md %}

## Before you begin

- Make sure you have already [installed the official CockroachDB Docker image](install-cockroachdb.html).
- For quick SQL testing or app development, consider [running a single-node cluster](cockroach-start-single-node.html) instead.
- Note that running multiple nodes on a single host is useful for testing CockroachDB, but it's not suitable for production. To run a physically distributed cluster in containers, use an orchestration tool like Kubernetes. See [Orchestration](orchestration.html) for more details, and review the [Production Checklist](recommended-production-settings.html).

{% include {{ page.version.version }}/start-in-docker/mac-linux-steps.md %}

## What's next?

- Learn more about [CockroachDB SQL](learn-cockroachdb-sql.html) and the [built-in SQL client](cockroach-sql.html)
- [Install the client driver](install-client-drivers.html) for your preferred language
- [Build an app with CockroachDB](hello-world-example-apps.html)
- Further explore CockroachDB capabilities like [fault tolerance and automated repair](demo-fault-tolerance-and-recovery.html), [multi-region performance](demo-low-latency-multi-region-deployment.html), [serializable transactions](demo-serializable.html), and [JSON support](demo-json-support.html)
