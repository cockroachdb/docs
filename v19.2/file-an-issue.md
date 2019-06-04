---
title: File an Issue
summary: Learn how to file an issue with CockroachDB
toc: false
---

If you've tried to [troubleshoot](troubleshooting-overview.html) an issue yourself, have [reached out for help](support-resources.html), and are still stumped, you can file an issue in GitHub.

## Guidance

Before filing an issue:

  - Read the details of the relevant documentation. For example, it's important to understand the function of all flags when [starting nodes](start-a-node.html).
  - Review our [troubleshooting documentation](troubleshooting-overview.html).
  - Check our [open issues](https://github.com/cockroachdb/cockroach/issues) for existing tickets related to your problem. Specifically, the [known limitation](https://github.com/cockroachdb/cockroach/issues?q=is%3Aopen+is%3Aissue+label%3Aknown-limitation), [UX surprise](https://github.com/cockroachdb/cockroach/issues?utf8=%E2%9C%93&q=is%3Aopen%20is%3Aissue%20label%3Aux-surprise) and [SQL semantics](https://github.com/cockroachdb/cockroach/issues?utf8=%E2%9C%93&q=is%3Aopen%20is%3Aissue%20label%3Asql-semantics) flags. If you've encountered one of these issues, please leave a comment about your use case.
  - Use our [support resources](support-resources.html), including:
    - [StackOverflow](http://stackoverflow.com/questions/tagged/cockroachdb)
    - [CockroachDB Community Forum](https://forum.cockroachlabs.com)
    - [Gitter](https://gitter.im/cockroachdb/cockroach)

## Filing an Issue

To file an issue in GitHub, we need the following information:

1. A summary of the issue.

2. The steps to reproduce the issue.

3. The result you expected.

4. The result that actually occurred.

5. The first few lines of the log file from each node in the cluster in a timeframe as close as possible to reproducing the issue. On most Unix-based systems running with defaults, you can get this information using the following command:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ grep -F '[config]' cockroach-data/logs/cockroach.log
    ~~~
    {{site.data.alerts.callout_info}}You might need to replace <code>cockroach-data/logs</code> with the location of your <a href="debug-and-error-logs.html">logs</a>.{{site.data.alerts.end}}
    If the logs are not available, please include the output of `cockroach version` for each node in the cluster.

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
