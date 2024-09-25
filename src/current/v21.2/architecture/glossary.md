---
title: Glossary
summary: Learn about database, CockroachDB architecture and deployment, and CockroachCloud terminology.
toc: true
docs_area: get_started
---

This page defines terms that you will encounter throughout the documentation.

{% include {{ page.version.version }}/misc/database-terms.md %}

{% include {{ page.version.version }}/misc/basic-terms.md %}

For more information on CockroachDB architecture, see [Architecture Overview](overview.html#overview).

## CockroachDB deployment terms

Term | Definition
-----|-----------
**single tenant** | A type of CockroachDB deployment where a single customer uses the database cluster.
**multi-tenant** | A type of CockroachDB deployment where multiple customers share a single storage cluster. Each customer sees a virtual CockroachDB cluster. Data in each virtual cluster is isolated and is invisible to other customers.
**region** | A logical identification of how nodes and data are clustered around [geographical locations](../multiregion-overview.html). A _cluster region_ is the set of locations where cluster nodes are running. A _database region_ is the subset of cluster regions database data should be restricted to.
**availability zone**  | A part of a data center that is considered to form a unit with regards to failures and fault tolerance. There can be multiple nodes in a single availability zone, however Cockroach Labs recommends that you to place different replicas of your data in different availability zones.
**[CockroachDB Self-Hosted](../start-a-local-cluster.html)** | A full featured, self-managed CockroachDB deployment.

{% include common/basic-terms.md %}
