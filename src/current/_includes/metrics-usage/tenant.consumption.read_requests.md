The number of RUs consumed by KV storage layer reads, broken down by requests. SQL statements are translated into lower-level KV read requests that are sent in batches. Batches may contain any number of requests. Requests can have a payload containing any number of bytes. Storage layer I/O is converted to Request Units using this equivalency:
<br>
<b>1 RU = 8 storage read requests</b>
<br>
Correlate this metric with [Request Units (RUs)](#tenant.consumption.request_units). To learn more about how RUs are calculated, refer to [Resource Usage]({% link cockroachcloud/resource-usage-basic.md %}).