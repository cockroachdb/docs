The number of RUs consumed by KV storage layer reads, broken down by batches. SQL statements are translated into lower-level KV read requests that are sent in batches. Batches may contain any number of requests. Requests can have a payload containing any number of bytes. Storage layer I/O is converted to Request Units using this equivalency:
<br>
<b>1 RU = 2 storage read batches</b>
<br>
Correlate this metric with <a href="#tenant.consumption.request_units">Request Units (RUs)</a>. To learn more about how RUs are calculated, refer to <a href="https://www.cockroachlabs.com/docs/cockroachcloud/serverless-resource-usage">Resource Usage</a>.