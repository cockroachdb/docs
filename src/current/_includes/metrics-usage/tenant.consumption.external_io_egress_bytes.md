The number of RUs consumed by byte traffic for cluster bulk I/O operations (e.g., [CDC]({% link {{ site.current_cloud_version }}/change-data-capture-overview.md %})). Egress bytes are converted to Request Units using this equivalency:
<br>
<b>1 RU = 1 KiB Network egress.</b>
<br>
Correlate this metric with [Request Units (RUs)](#tenant.consumption.request_units). To learn more about how RUs are calculated, refer to [Resource Usage]({% link cockroachcloud/resource-usage-basic.md %}).