---
title: File an Issue
summary: Learn how to file an issue with CockroachDB
toc: false
---

If you've tried to troubleshoot an issue yourself, have reached out for help, and are still stumped, you can file an issue in GitHub.

## Guidance

Before filing an issue:

  - Read the details of the relevant documentation. For example, it's important to understand the function of all flags when [starting nodes](start-a-node.html).
  - Review our [troubleshooting documentation](troubleshooting-overview.html).
  - Check our [open issues](https://github.com/cockroachdb/cockroach/issues) for existing tickets related to your problem.
  - Reach out for support from Cockroach Labs and our community:

    - [StackOverflow](http://stackoverflow.com/questions/tagged/cockroachdb)
    - [CockroachDB Community Forum](https://forum.cockroachlabs.com)
    - [Gitter](https://gitter.im/cockroachdb/cockroach)

## Filing an Issue

To file an issue in GitHub, we need the following information:

1. A summary of the issue.

2. The steps to reproduce the issue.

3. The result you expected.

4. The result that actually occured.

5. The first few lines of the log file from each node in the cluster in a timeframe as close as possible to reproducing the issue. On most Unix-based systems running with defaults, you can get this information using the following command:
   
   ~~~ shell
   $ grep -F '[config]' cockroach-data/logs/cockroach.log
   ~~~~

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

