---
title: Integrate CockroachDB Dedicated with Satori
summary: Row or column-level access control and dynamic masking of data with Satori
toc: true
docs_area: reference.third_party_support
---

Satori offers tooling to extend CockroachDB's data security capabilities. Satori's Data Access Controller (DAC) can be used in concert with {{ site.data.products.db }} or {{ site.data.products.core }}.

A Satori integration offers CockroachDB users the following enhanced data security capabilities at scale:

## Fine-grained access control

- SQL database access control at the level of specific rows and columns.
- "No-code" configuration of policy-based access.
- Support for both role-based access control (RBAC) and attribute-based access control (ABAC).

Satori Documentation: [Fine-grained access control](https://satoricyber.com/fine-grained-access-control/)

## Dynamic data masking

- Defense-in-depth against data theft.
- Precise protection of personally identifiable information (PII), protected health information (PHI), or other confidential data.

Satori Documentation: [Dynamic data masking](https://satoricyber.com/dynamic-data-masking/)

## Data access auditing

Satori Documentation: [Data Access auditing](https://satoricyber.com/data-access-auditing-monitoring/)

- Enriched metadata and contextual information about data access events.
- Consolidation of SQL audit logs from multiple CockroachDB clusters to a single location.

To learn more about integrating Satori with your CockroachDB deployment, reach out to the [CockroachDB support team](https://support.cockroachlabs.com).