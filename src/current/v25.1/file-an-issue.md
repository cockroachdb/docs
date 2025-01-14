---
title: File an Issue
summary: Learn how to file a GitHub issue with CockroachDB.
toc: false
docs_area: manage
---

If you've tried to [troubleshoot]({% link {{ page.version.version }}/troubleshooting-overview.md %}) an issue yourself, have [reached out for help]({% link {{ page.version.version }}/support-resources.md %}), and are still stumped, you can file an issue in GitHub.

To file an issue in GitHub, we need the following information:

1. A summary of the issue.

1. The steps to reproduce the issue.

1. The result you expected.

1. The result that actually occurred.

1. The first few lines of the log file from each node in the cluster in a timeframe as close as possible to reproducing the issue. On most Unix-based systems running with defaults, you can get this information using the following command:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ grep -F '[config]' cockroach-data/logs/cockroach.log
    ~~~
    {{site.data.alerts.callout_info}}You might need to replace <code>cockroach-data/logs</code> with the location of your <a href="logging-overview.html">logs</a>.{{site.data.alerts.end}}
    If the logs are not available, include the output of `cockroach version` for each node in the cluster.

### Template

You can use this as a template for [filing an issue in GitHub](https://github.com/cockroachdb/cockroach/issues/new):

~~~

## Summary



## Steps to reproduce

1.
2.
3.

## Expected Result



## Actual Result



## Log files/version

### Node 1



### Node 2



### Node 3



~~~
