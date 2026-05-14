---
title: security: add certificate rotation timestamp and expiry days metrics
summary: Based on the pull request diff, I can see that this PR introduces new certificate lifecycle metrics rather than system tables or views. The changes are in the metrics subsystem, adding new Prometheus-style metrics for certificate rotation timestamps and expiry days.
toc: true
docs_area: reference.sql
---

Based on the pull request diff, I can see that this PR introduces new certificate lifecycle metrics rather than system tables or views. The changes are in the metrics subsystem, adding new Prometheus-style metrics for certificate rotation timestamps and expiry days.

Since no new system tables or views were detected in the diff (as confirmed by the "No system tables detected" note), there is no reference documentation to generate for system tables or views in this case.

The PR adds two families of certificate metrics:

1. **Rotation timestamp metrics** (`security.certificate.last_rotation.*`) - Unix timestamps of last certificate rotations
2. **Expiry day metrics** (`security.certificate.expiry_days.*`) - Days remaining until certificate expiration

These are exposed as Prometheus metrics through the `/_status/vars` endpoint, not as queryable system tables or views. The appropriate documentation for these would be in the monitoring/metrics reference section rather than the system tables reference.

If you need documentation for these new metrics, that would be generated in a different format focused on Prometheus metric names, types, and usage for monitoring systems rather than SQL table documentation.
