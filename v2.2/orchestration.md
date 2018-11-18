---
title: Orchestration
summary: Learn how to run CockroachDB with popular open-source orchestration systems.
toc: false
---

Orchestration systems automate the deployment, scaling, and management of containerized applications. Combined with CockroachDB's [automated sharding](frequently-asked-questions.html#how-does-cockroachdb-scale) and [fault tolerance](frequently-asked-questions.html#how-does-cockroachdb-survive-failures), they have the potential to lower operator overhead to almost nothing.

Use the following guides to run CockroachDB with popular open-source orchestration systems:

- [Kubernetes Deployment](orchestrate-cockroachdb-with-kubernetes.html)
- [Kubernetes Performance Optimization](kubernetes-performance.html)
- [Docker Swarm Deployment](orchestrate-cockroachdb-with-docker-swarm.html)
- [Mesosphere DC/OS Deployment](orchestrate-cockroachdb-with-mesosphere-insecure.html)

{{site.data.alerts.callout_success}}If you're just getting started with CockroachDB, you might want to <a href="orchestrate-a-local-cluster-with-kubernetes-insecure.html">orchestrate a local cluster</a> to learn the basics of the database.{{site.data.alerts.end}}

## See also

- [Production Checklist](recommended-production-settings.html)
- [Manual Deployment](manual-deployment.html)
- [Monitoring and Alerting](monitoring-and-alerting.html)
- [Test Deployment](deploy-a-test-cluster.html)
- [Local Deployment](start-a-local-cluster.html)
