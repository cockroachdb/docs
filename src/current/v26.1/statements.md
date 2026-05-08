---
title: changefeedccl: backport highwater backoff reset + gating to 26.1
summary: New Cluster Setting
toc: true
docs_area: reference.sql
---

## New Cluster Setting

### `changefeed.reset_backoff_on_highwater_advance.enabled`

**Type**: `boolean`  
**Default**: `false`  
**Scope**: Application level

**Description**: controls whether changefeed retry backoff resets when the resolved timestamp advances between retries. When enabled, changefeeds that make forward progress (indicated by highwater mark advancement) will have their retry backoff reset, preventing transient errors during operations like rolling restarts from causing changefeeds to fall behind due to excessive backoff delays.

**Usage notes**: 
- This setting is particularly useful during cluster maintenance operations where transient connection errors might occur but the changefeed is otherwise healthy and making progress
- The feature helps distinguish between systematic failures (where backoff should remain elevated) and temporary disruptions (where backoff reset is appropriate)
- Default is `false` in release-26.1 to maintain backward compatibility; the behavior is opt-in

**Related settings**:
- [`changefeed.max_retry_backoff`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-changefeed-max-retry-backoff) — controls the maximum retry backoff duration
- [`changefeed.backoff_reset_wait`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-changefeed-backoff-reset-wait) — controls when backoff resets based on time elapsed

**Example**:

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING changefeed.reset_backoff_on_highwater_advance.enabled = true;
~~~

**See also**:
- [Change Data Capture Overview]({% link {{ page.version.version }}/change-data-capture-overview.md %})
- [`CREATE CHANGEFEED`]({% link {{ page.version.version }}/create-changefeed.md %})
- [Changefeed Dashboard]({% link {{ page.version.version }}/ui-cdc-dashboard.md %})
