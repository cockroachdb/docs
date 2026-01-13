---
title: Automatic CPU Profiler
summary: The Automatic CPU Profiler captures CPU profiles automatically to help investigate cluster issues involving CPU load.
keywords: cpu profile, cpu profiles, cpu profiler, automatic cpu profiler
toc: true
docs_area: manage
---

This feature automatically captures CPU profiles, which can make it easier to investigate and troubleshoot spikes in CPU usage or erratic CPU load on certain nodes. A CPU profile shows the functions that use the most CPU time, sampled over a window of time. You can collect a CPU Profile manually on the [Advanced Debug page]({% link {{ page.version.version }}/ui-debug-pages.md %}). However, it may be difficult to manually capture a profile of a short CPU spike at the right point in time. Automatic CPU profile capture enables the investigation of CPU load in this and other cases, such as periodic high CPU.

## Configuration

You can configure automatic CPU profile capture with the following [cluster settings]({% link {{ page.version.version }}/cluster-settings.md %}):

Cluster Setting | Description | Default Value
----------------|-------------|---------------
`server.cpu_profile.cpu_usage_combined_threshold` | The baseline threshold of CPU usage at which a CPU profile is taken from a node. This value is a percentage.<ul><li>If a value of `0` is set, a profile is taken every time the `server.cpu_profile.interval` has passed or the provided usage is increasing.</li><li>If a value greater than `0` and less than or equal to `100` is set, the profiler is enabled (default)</li><li>If a value greater than `100` is set, the profiler is disabled.</li></ul> | `65`
`server.cpu_profile.interval` | The period of time after which the [high-water mark](#high-water-mark-threshold) resets to the baseline value. | `20m0s` (20 minutes)
`server.cpu_profile.duration` | The length of time a CPU profile is taken. | `10s` (10 seconds)
`server.cpu_profile.total_dump_size_limit` | Maximum combined disk size for preserving CPU profiles. | `128 MiB` (128 Mebibytes)

## High-water mark threshold 

The Automatic CPU Profiler runs asynchronously in the background. After every second, the Automatic CPU Profiler checks if the CPU usage exceeds the high-water mark threshold. If so, it captures a CPU profile. If a profile capture is already in progress, a second profile is not taken.

The Automatic CPU Profiler uses the configuration options to determine the high-water mark threshold. For example, with `duration` set to `10s` , `interval` set to `20m0s`, and `cpu_usage_combined_threshold` set to `65`:

- At `time0` the CPU usage polled is `70` percent. This exceeds the baseline threshold of `65`, so a `10s` profile is captured and the high-water mark threshold becomes `70`.
- After the `10s` profile capture, the Automatic CPU Profiler continues to check every second if the CPU usage now exceeds `70` percent.
- At `time1` the CPU usage polled is `80` percent, another profile is taken for `10s`, and the high-water mark threshold becomes `80`.
- At `time2`, the `20m0s` interval after `time0`, the high-water mark threshold is reset to the baseline threshold of `65`.
- The Automatic CPU Profiler continues to poll every second, and captures a profile whenever CPU usage exceeds the high-water mark threshold.

## Accessing CPU profiles

- The Automatic CPU Profiler saves the captured CPU profiles to disk on each node's file system in the [logging directory]({% link {{ page.version.version }}/configure-logs.md %}#logging-directory). The default path is `cockroach-data/logs/pprof_dump`.
- The only way to get these CPU profiles is to access the node file system.
- Enabling the Automatic CPU Profiler does **not** add CPU profiles to [debug zips]({% link {{ page.version.version }}/cockroach-debug-zip.md %}).

## Overhead

Enabling the automatic CPU profile capture on a cluster will add overhead to the cluster in the form of potential increases in latency and CPU usage.

- Monitor the following metrics:
  - [P99 latency]({% link {{ page.version.version }}/ui-sql-dashboard.md %}#service-latency-sql-99th-percentile)
  - P50 latency by creating a [custom chart]({% link {{ page.version.version }}/ui-custom-chart-debug-page.md %}) for the `sql.exec.latency-p50` metric
  - [CPU usage]({% link {{ page.version.version }}/ui-hardware-dashboard.md %}#cpu-percent)

## See also

- [Automatic Go Execution Tracer]({% link {{ page.version.version }}/automatic-go-execution-tracer.md %})
