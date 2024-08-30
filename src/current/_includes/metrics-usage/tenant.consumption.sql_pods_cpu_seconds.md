The number of RUs consumed by CPU usage of <a href="https://www.cockroachlabs.com/docs/cockroachcloud/architecture#architecture">SQL processes</a> (not <a href="https://www.cockroachlabs.com/docs/cockroachcloud/architecture#architecture">storage processes</a>). The CPU seconds is converted to Request Units using this equivalency:
<br>
<b>1 RU = 3 milliseconds SQL CPU.</b>
<br>
Correlate this metric with <a href="#tenant.consumption.request_units">Request Units (RUs)</a> and determine if your workload is CPU-intensive. To learn more about how RUs are calculated, refer to [Resource Usage]({% link cockroachcloud/resource-usage-basic.md %}).