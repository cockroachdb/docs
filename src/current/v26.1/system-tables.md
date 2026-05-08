---
title: changefeedccl: backport highwater backoff reset + gating to 26.1
summary: Based on the pull request analysis, this changefeedccl pull request does not introduce any new or changed system tables or views. The changes are focused on:
toc: true
docs_area: reference.sql
---

Based on the pull request analysis, this changefeedccl pull request does not introduce any new or changed system tables or views. The changes are focused on:

1. Adding a new cluster setting `changefeed.reset_backoff_on_highwater_advance.enabled`
2. Implementing retry backoff reset logic when changefeed highwater marks advance
3. Adding testing infrastructure and test cases

Since no system tables or views were detected in the diff, there is no reference documentation to generate for system tables or views.

The only relevant reference documentation that would be generated automatically is for the new cluster setting `changefeed.reset_backoff_on_highwater_advance.enabled`, which will appear in the auto-generated cluster settings table via the existing `{% remote_include %}` mechanism from the cockroach repo.

**No system table or view reference documentation is required for this pull request.**
