---
title: security: add certificate rotation timestamp and expiry days metrics
summary: I notice there's a mismatch between your request and the provided PR content. You've asked me to generate reference documentation for "new or changed SQL statements," but PR #167902 doesn't introduce any SQL statements.
toc: true
docs_area: reference.sql
---

I notice there's a mismatch between your request and the provided PR content. You've asked me to generate reference documentation for "new or changed SQL statements," but PR #167902 doesn't introduce any SQL statements.

This PR adds **certificate lifecycle metrics** to help operators monitor certificate rotation and expiration. The changes are:

1. **New metrics families**:
   - `security.certificate.last_rotation.*` - Unix timestamps of last certificate rotations
   - `security.certificate.expiry_days.*` - Days until certificate expiration

2. **Affected certificate types**: ca, client-ca, ui-ca, ca-client-tenant, node, node-client, ui, client-tenant

3. **Implementation details**: Added to `certificate_manager.go` and `certificate_metrics.go`

Since this is about **monitoring metrics** rather than SQL statements, would you like me to:

1. **Generate metrics documentation** (explaining how to use these new certificate monitoring metrics)
2. **Wait for a different PR** that actually contains SQL statement changes
3. **Clarify what type of documentation** you need for this specific PR

The metrics would typically be accessed through system tables like `crdb_internal.node_metrics` or exported via Prometheus, but the PR itself doesn't introduce new SQL syntax.

Which direction would you prefer?
