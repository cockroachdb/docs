---
title: Orchestration
summary: Learn how to run CockroachDB with popular open-source orchestration systems.
toc: false
canonical: /stable/kubernetes-overview.html
---

Orchestration systems automate the deployment, scaling, and management of containerized applications. Combined with CockroachDB's [automated sharding](frequently-asked-questions.html#how-does-cockroachdb-scale) and [fault tolerance](frequently-asked-questions.html#how-does-cockroachdb-survive-failures), they have the potential to lower operator overhead to almost nothing.

Use the following guides to run CockroachDB with popular open-source orchestration systems:

- [Kubernetes Single-Cluster Deployment](orchestrate-cockroachdb-with-kubernetes.html)
- [Kubernetes Multi-Cluster Deployment](orchestrate-cockroachdb-with-kubernetes-multi-cluster.html)
- [Kubernetes Performance Optimization](kubernetes-performance.html)
- [Docker Swarm Deployment](orchestrate-cockroachdb-with-docker-swarm.html)

{{site.data.alerts.callout_success}}If you're just getting started with CockroachDB, you might want to <a href="orchestrate-a-local-cluster-with-kubernetes.html">orchestrate a local cluster</a> to learn the basics of the database.{{site.data.alerts.end}}

## See also

- [Production Checklist](recommended-production-settings.html)
- [Manual Deployment](manual-deployment.html)
- [Monitoring and Alerting](monitoring-and-alerting.html)
- [Local Deployment](start-a-local-cluster.html)
