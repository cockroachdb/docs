---
title: Simplified Deployment
summary: Deploying CockroachDB is simple and straightforward.
toc: false
---

Deploying and maintaining databases has forever been a difficult and expensive prospect. Simplicity is one of our foremost design goals. CockroachDB is self contained and eschews external dependencies. There are no explicit roles like primaries or secondaries to get in the way. Instead, every CockroachDB node is symmetric and equally important, meaning no single points of failure in the architecture.

-   No external dependencies
-   Self-organizes using gossip network
-   Dead-simple configuration without “knobs”
-   Symmetric nodes are ideally suited to container-based deployments
-   Every node provides access to centralized admin console

<img src="{{ 'images/v1.1/2simplified-deployments.png' | relative_url }}" alt="CockroachDB is simple to deploy" style="width: 400px" />
