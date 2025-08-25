---
title: Automatic Go Execution Tracer
summary: The automatic Go execution tracer can be used to gain fine-grained insight into goroutine scheduling, blocking events, garbage collection, and runtime activity.
keywords: go execution trace, go execution tracing, execution tracer, automatic execution tracer
toc: true
---

The automatic Go execution tracer allows operators and support engineers to investigate internal system behavior over time. Use this feature to gain fine-grained insight into goroutine scheduling, blocking events, garbage collection, and runtime activity.

{{site.data.alerts.callout_info}}
Execution tracing introduces a performance overhead. This feature is primarily intended for use under the guidance of [Cockroach Labs Support](https://support.cockroachlabs.com/).
{{site.data.alerts.end}}

When enabled, the automatic Go execution tracer captures runtime execution traces on a recurring schedule and stores them in the node's log directory. These traces are collected in the background and can be analyzed using Go’s standard tooling (e.g., [`go tool trace`](https://pkg.go.dev/runtime/trace)).

To prevent disk overuse, older traces are automatically garbage collected based on a configurable storage limit.

## Configuration

You can configure automatic Go execution trace capture with the following [cluster settings]({% link {{ page.version.version }}/cluster-settings.md %}):

Cluster Setting | Description | Default Value
----------------|-------------|---------------
`obs.execution_tracer.interval` | Enables periodic execution tracing on each node and defines how often traces are collected. Set to a positive duration (e.g., `10m`, `1h`) to enable. Set to `0` to disable (default). | `0`
`obs.execution_tracer.duration` | Sets how long each execution trace runs. Use short durations (e.g., 5-15 seconds) to produce traces that are easier to analyze. | `10s`
`obs.execution_tracer.total_dump_size_limit` | Sets a soft limit on the total disk space used by execution trace files. When the limit is exceeded, the oldest files are deleted. | `4GiB`

## Accessing Go execution traces

- The automatic Go execution tracer saves the captured traces to disk on each node's file system in the [logging directory]({% link {{ page.version.version }}/configure-logs.md %}#logging-directory). The default path is `cockroach-data/logs/executiontrace_dump`.
- To access these Go execution traces, you must use the node file system.
- Each file represents a single trace session, includes the `executiontrace.` prefix and `.out` extension, and is timestamped with the session end time to support correlation with other logs and profiles. For example, the trace file could be named `executiontrace.2025-07-14T18_41_22.216.out`.
- Enabling the automatic Go execution tracer does add Go execution traces to [debug zips]({% link {{ page.version.version }}/cockroach-debug-zip.md %}) in the `nodes/*/executiontrace` paths.

## Best Practices

- Trace duration should be short (e.g., 5s–15s). Shorter trace files are easier to parse and load into external tools.
- Storage limit should be generous to allow sufficient trace history. Avoid overly tight disk caps unless necessary.
- Enable tracing temporarily when troubleshooting runtime behavior or under [support guidance](https://support.cockroachlabs.com), as it may slightly impact performance.

## Performance Impact

Enabling execution tracing incurs a low overhead, estimated at 1–2% based on upstream Go benchmarks ([Go blog, 2024](https://go.dev/blog/execution-traces-2024#low-overhead-tracing)). No additional CockroachDB-specific benchmarks are available at this time.

## Example

To enable 10-second traces every 15 minutes with a storage limit of `8GiB`, configure the following settings:

```sql
SET CLUSTER SETTING obs.execution_tracer.interval = '15m';
SET CLUSTER SETTING obs.execution_tracer.duration = '10s';
SET CLUSTER SETTING obs.execution_tracer.total_dump_size_limit = '8GiB';
```

## See also

- [Automatic CPU Profiler]({% link {{ page.version.version }}/automatic-cpu-profiler.md %})
