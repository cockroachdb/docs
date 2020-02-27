{{site.data.alerts.callout_danger}}
**This is an experimental feature.** The interface and output are subject to change.

There is an open correctness issue with changefeeds using resolved timestamps connected to cloud storage sinks. While this issue is unlikely, new row information could display with a lower timestamp than what has already been emitted, which violates our [ordering guarantees](change-data-capture.html#ordering-guarantees).

This issue is fixed in v19.2 and beyond.
{{site.data.alerts.end}}
