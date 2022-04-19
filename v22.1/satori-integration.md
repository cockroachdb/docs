---
title: Satori Integration
summary: Fine-grained access and data masking with Satori
toc: true
docs_area: reference.third_party_support
---

[Satori](https://satoricyber.com/) offers powerful tooling to extend CockroachDB's grain of access control. Satori can be used in concert with {{ site.data.products.db }} or {{ site.data.products.core }}.

With a Satori integration enabled, CockroachDB users gain the following capabilities:

## [Fine-grained access control](https://satoricyber.com/fine-grained-access-control/)

- "No-code" advanced policy control.
- Admins can configure fine-grained access control to restrict a SQL user's access to specific rows or columns.
- Supports both role-based access control (RBAC) and attribute-based access control (ABAC).

## [Dynamic data masking](https://satoricyber.com/dynamic-data-masking/)

Admins can configure dynamic data masking for PII or other organizational confidential data, to prevent access to sensitive data and potential data exfiltration.
