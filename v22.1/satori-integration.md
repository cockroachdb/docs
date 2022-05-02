---
title: Satori Integration
summary: Row or column-level access control and dynamic masking of data with Satori
toc: true
docs_area: reference.third_party_support
---

Satori offers powerful tooling to extend CockroachDB's data security capabilities. Satori's Data Access Controller (DAC) can be used in concert with {{ site.data.products.db }} or {{ site.data.products.core }}.

With a Satori integration enabled, CockroachDB users gain the following capabilities:

## Fine-grained access control

Satori Documentation: [Fine-grained access control](https://satoricyber.com/fine-grained-access-control/)

- "No-code" advanced policy-based access control.
- Admins can configure fine-grained access control in a scalable manner across their users, to restrict SQL access to specific rows and / or columns.
- Supports both role-based access control (RBAC) and attribute-based access control (ABAC).

## Dynamic data masking

Satori Documentation: [Dynamic data masking](https://satoricyber.com/dynamic-data-masking/)

Admins can configure dynamic data masking. This feature adds a layer of defense-in-depth against data theft, and can be combined with fine-grained access control for powerful and precise protection of personally identifiable information (PII), protect health information (PHI) or other confidential data.

## Scalable data access auditing

Satori Documentation: [Scalable data access auditing](https://satoricyber.com/data-access-auditing-monitoring/)

- Admins can configure scalable data access auditing, augmenting CockroachDB's audit logs with enriched metadata and contextual information.
- Allows consolidation of audit logs from OLTP and OLAP data stores to a single location.

To learn more about integrating Satori with your CockroachDB deployment, reach out to the [CockroachDB support team](https://support.cockroachlabs.com)).