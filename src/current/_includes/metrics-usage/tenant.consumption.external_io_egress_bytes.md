The number of RUs consumed by byte traffic for cluster bulk I/O operations (e.g., <a href="https://www.cockroachlabs.com/docs/stable/change-data-capture-overview">CDC</a>). Egress bytes are converted to Request Units using this equivalency:
<br>
<b>1 RU = 1 KiB Network egress.</b>
<br>
Correlate this metric with <a href="#tenant.consumption.request_units">Request Units (RUs)</a>. To learn more about how RUs are calculated, refer to [Resource Usage]({% link cockroachcloud/resource-usage-basic.md %}).