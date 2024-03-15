The number of RUs consumed by KV writes, broken down by requests. SQL statements are translated into lower-level KV write requests that are sent in batches. Batches may contain any number of requests. Requests can have a payload containing any number of bytes. Write operations are replicated to multiple <a href="https://www.cockroachlabs.com/docs/cockroachcloud/serverless-resource-usage#understand-resource-consumption-in-cockroachdb-serverless">storage processes</a> (3 by default), with each replica counted as a separate write operation. Storage layer I/O is converted to Request Units using this equivalency:
<br>
<b>1 RU = 1 storage write request</b>
<br>
Correlate this metric with <a href="#tenant.consumption.request_units">Request Units (RUs)</a>. To learn more about how RUs are calculated, refer to <a href="https://www.cockroachlabs.com/docs/cockroachcloud/serverless-resource-usage">Resource Usage</a>.
