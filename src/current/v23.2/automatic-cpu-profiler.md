---
title: Automatic CPU Profiler
summary: The Automatic CPU Profiler captures CPU profiles automatically to help investigate cluster issues involving CPU load.
keywords: cpu profile, cpu profiles, cpu profiler, automatic cpu profiler
toc: true
docs_area: manage
---

This feature automatically captures CPU profiles, which can make it easier to investigate and troubleshoot spikes in CPU usage or erratic CPU load on certain nodes. A CPU profile shows the functions that use the most CPU time, sampled over a window of time. You can collect a CPU Profile manually on the [Advanced Debug page]({% link {{ page.version.version }}/ui-debug-pages.md %}). However, it may be difficult to manually capture a profile of a short CPU spike at the right point in time. Automatic CPU profile capture enables the investigation of CPU load in this and other cases, such as periodic high CPU.

{{site.data.alerts.callout_danger}}
We strongly recommend only using the Automatic CPU Profiler when working directly with the [Cockroach Labs support team]({% link {{ page.version.version }}/support-resources.md %}).
{{site.data.alerts.end}}

## Configuration

You can configure automatic CPU profile capture with the following [cluster settings]({% link {{ page.version.version }}/cluster-settings.md %}):

Cluster Setting | Description | Default Value | Recommended Value
----------------|-------------|---------------|------------------
`server.cpu_profile.cpu_usage_combined_threshold` | The baseline value for when CPU profiles should be taken. Collect profiles from each node that meets threshold. This setting enables and disables automatic cpu profiling.<ul><li>If a value of 0 is set, a profile will be taken every time the `server.cpu_profile.interval` has passed or the provided usage is increasing.</li><li>If a value greater than 0 and less than or equal to 100 is set, the profiler is enabled.</li><li>If a value over 100 is set, the profiler is disabled.</li></ul> | MAX integer, such as `9223372036854775807` | `80`
`server.cpu_profile.interval` | The period of time after which the [high-water mark](#high-water-mark-threshold) resets to the baseline value. | `5m0s` (5 minutes) | `1m40s` (100 seconds)
`server.cpu_profile.duration` | The length of time a CPU profile is taken. | `10s` (10 seconds) | `1s` or `2s`
`server.cpu_profile.total_dump_size_limit` | Maximum combined disk size for preserving CPU profiles. | `128 MiB` (128 Mebibytes) |

### Enabling automatic CPU profile capture

To enable automatic CPU profile capture, you must [set]({% link {{ page.version.version }}/set-cluster-setting.md %}) `server.cpu_profile.cpu_usage_combined_threshold` to a value between `0` and `100`. Preferably, use the [recommended value](#recommended-values).

### Recommended values

- Set `server.cpu_profile.cpu_usage_combined_threshold` to `80` for 80%.
- Set `server.cpu_profile.duration` to a lower value, for example `1s` or `2s`. This minimizes the impact of [overhead](#overhead) on your cluster compared to the current default value.
- Set `server.cpu_profile.interval` to a lower value, for example `1m40s` (1 minute 40 seconds).

### High-water mark threshold 

The Automatic CPU Profiler runs asynchronously in the background. After every second, the Automatic CPU Profiler checks if the CPU usage exceeds the high-water mark threshold. If so, it captures a CPU profile. If a profile capture is already in progress, a second profile is not taken.

The Automatic CPU Profiler uses the configuration options to determine the high-water mark threshold. For example, with `duration` set to `2s` , `interval` set to `1m40s`, and `cpu_usage_combined_threshold` set to `80`:

- At `time0` the CPU usage polled is 82 percent which exceeds the baseline threshold of `80`, so a `2s` profile is captured and the high-water mark threshold becomes `82`.
- After the `2s` profile capture, the Automatic CPU Profiler continues to check every second if the CPU usage now exceeds `82` percent.
- At `time1` the CPU usage polled is 85 percent, another profile is taken for `2s` and the high-water mark threshold becomes `85`.
- At `time2`, the `1m40s` interval after `time0`, the high-water mark threshold is reset to the baseline threshold of `80`.
- The Automatic CPU Profiler continues its every second polling and captures profiles when CPU usage exceeds the high-water mark threshold beginning at the `80` percent baseline.

## Accessing CPU profiles

- The Automatic CPU Profiler saves the captured CPU profiles to disk on each node's file system in the [logging directory]({% link {{ page.version.version }}/configure-logs.md %}#logging-directory). The default path is `cockroach-data/logs/pprof_dump`.
- The only way to get these CPU profiles is to access the node file system.
- Enabling the Automatic CPU Profiler does **not** add CPU profiles to [debug zips]({% link {{ page.version.version }}/cockroach-debug-zip.md %}).

## Overhead

Enabling the automatic CPU profile capture on a cluster will add overhead to the cluster in the form of potential increases in latency and CPU usage.

{{site.data.alerts.callout_info}}
The decision to enable this feature should be done when advised by the [Cockroach Labs support team]({% link {{ page.version.version }}/support-resources.md %}).
{{site.data.alerts.end}}

- Monitor the following metrics:
  - [P99 latency]({% link {{ page.version.version }}/ui-sql-dashboard.md %}#service-latency-sql-99th-percentile)
  - P50 latency by creating a [custom chart]({% link {{ page.version.version }}/ui-custom-chart-debug-page.md %}) for the `sql.exec.latency-p50` metric
  - [CPU usage]({% link {{ page.version.version }}/ui-hardware-dashboard.md %}#cpu-percent)
- We anticipate a sub-10% regression on these foreground latency metrics. This overhead to your cluster may be deemed acceptable in order to collect CPU profiles that are necessary to troubleshoot problems in your cluster. Please consult with Cockroach Labs Support.
- Overhead only occurs during profile capture, not when it is idle. If the cluster can tolerate a `server.cpu_profile.duration` (for example, 1 second) increase in latency to capture the CPU profile, consider enabling the Automatic CPU Profiler.

{{site.data.alerts.callout_danger}}
Do not have the Automatic CPU Profiler enabled by default.

If you enabled the Automatic CPU Profiler and then notice unacceptable overhead to your cluster, we recommend you immediately disable the Automatic CPU Profiler.
{{site.data.alerts.end}}
