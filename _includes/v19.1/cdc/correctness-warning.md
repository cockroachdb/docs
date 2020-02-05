{{site.data.alerts.callout_danger}}
{{site.data.alerts.callout_danger}}
**This is an experimental feature.** The interface and output are subject to change.

There is an open correctness issue with changefeeds connected to cloud storage sinks where new row information will display with a lower timestamp than what has already been emitted, which violates our [ordering guarantees](change-data-capture.html#ordering-guarantees).
{{site.data.alerts.end}}
{{site.data.alerts.end}}
