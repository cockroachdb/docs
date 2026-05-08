---
title: changefeedccl: backport highwater backoff reset + gating to 26.1
summary: New Cluster Setting Introduced
toc: true
docs_area: reference.cli
---

## New Cluster Setting Introduced

From the diff, I can see a new cluster setting being added:

```go
var ResetBackoffOnHighwaterAdvance = settings.RegisterBoolSetting(
	settings.ApplicationLevel,
	"changefeed.reset_backoff_on_highwater_advance.enabled",
	"if true, the changefeed retry backoff resets when the resolved "+
		"timestamp advances between retries",
	false,
)
```

## Would you like me to:

1. **Generate cluster setting documentation** for `changefeed.reset_backoff_on_highwater_advance.enabled` instead?

2. **Confirm there are no CLI commands** to document from this PR?

3. **Generate supplementary documentation** explaining the changefeed backoff reset behavior?

Based on the CockroachDB docs style guide, cluster settings are typically auto-generated in the main reference table, but I could create supplementary documentation with usage examples, related settings, and implementation details.

Which type of reference documentation would be most helpful for this PR?
