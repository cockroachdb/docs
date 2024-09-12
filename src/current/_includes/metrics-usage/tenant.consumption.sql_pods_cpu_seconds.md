The number of RUs consumed by CPU usage of SQL processes (not storage processes). The CPU seconds is converted to Request Units using this equivalency:
<br>
<b>1 RU = 3 milliseconds SQL CPU.</b>
<br>
Correlate this metric with [Request Units (RUs)](#tenant.consumption.request_units) and determine if your workload is CPU-intensive. To learn more about how RUs are calculated, refer to [Resource Usage]({% link cockroachcloud/resource-usage-basic.md %}).