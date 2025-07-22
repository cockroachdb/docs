---
title: Monitor downstream_sink_latency in Changefeeds
summary: How to interpret and monitor the downstream sink latency metric to detect bottlenecks in CockroachDB changefeeds.
---

#### Downstream sink acknowledgment latency

**Metric**: `changefeed.stage.downstream_sink_latency`

Measures the time it takes for a downstream sink (e.g., Kafka, cloud storage, webhook) to acknowledge messages. High values may indicate bottlenecks or backpressure at the end of the pipeline.

**When it's high**:
- Sink is slow to ACK; may cause backpressure or stall the changefeed.

**Possible causes**:
- Network latency between CockroachDB and the sink
- Throttling or limits on the sink
- Large payloads or inefficient encoding
- Sink I/O capacity constraints (e.g., disk, Kafka throughput)

**Where to monitor**:
- CockroachDB Admin UI → *Metrics → Changefeeds*
- Prometheus/Grafana if metrics are scraped

**Suggested alert**:
- For example: `changefeed.stage.downstream_sink_latency: p95 > 1s over 1m`, sustained

**Mitigation strategies**:
- Scale the sink or increase throughput
- Enable batching or compression
- Tune changefeed sink settings (partitioning, parallelism)
- Diagnose with logs and sink system metrics
