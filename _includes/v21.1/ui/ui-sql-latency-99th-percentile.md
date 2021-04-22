<img src="{{ 'images/v21.1/ui_service_latency_99_percentile.png' | relative_url }}" alt="DB Console Service Latency graph" style="border:1px solid #eee;max-width:100%" />

Service latency is calculated as the time in nanoseconds between when the cluster [receives a query and finishes executing the query](architecture/sql-layer.html). This time does not include returning results to the client.

- In the node view, the graph shows the 99th [percentile](https://en.wikipedia.org/wiki/Percentile#The_normal_distribution_and_percentiles) of service latency for the node. Over the last minute this node executed 99% of queries within this time, not including network latency between the node and the client.

- In the cluster view, the graph shows the 99th [percentile](https://en.wikipedia.org/wiki/Percentile#The_normal_distribution_and_percentiles) of service latency across all nodes in the cluster. There are lines for each node in the cluster. Over the last minute the node executed 99% of queries within this time, not including network latency between the node and the client.
