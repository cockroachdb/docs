---
title: security: add certificate rotation timestamp and expiry days metrics
summary: I need to clarify something important about this request.
toc: true
docs_area: reference.cli
---

I need to clarify something important about this request. 

**PR #167902 does not introduce any new CLI commands.** The "Extracted Commands" section confirms this: "(No CLI commands detected in diff)".

Instead, this PR introduces **new certificate lifecycle metrics** that would be documented in the monitoring/metrics section of the reference documentation, not the CLI commands section.

The PR adds two families of metrics:

1. **`security.certificate.last_rotation.*`** - Unix timestamps of last certificate rotations
2. **`security.certificate.expiry_days.*`** - Days until certificate expiration

These metrics would be exposed through existing monitoring endpoints (like `/metrics` or queried via `crdb_internal.node_metrics`), not through new CLI commands.

Would you like me to:

1. **Generate metrics reference documentation** for these new certificate lifecycle metrics instead?
2. **Generate supplementary monitoring guidance** showing how to query and alert on these metrics?
3. **Clarify what specific documentation type you need** for this PR?

The appropriate documentation for this PR would be metrics reference content, not CLI command documentation.
