---
title: File an Issue
summary: Learn how to file an issue with CockroachDB
toc: false
---

If you've tried to troubleshoot a problem yourself, have reached out for help, but still cannot resolve the issue, you can file an issue on GitHub.

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

To file an issue on GitHub, we need the following information:

1. A summary of the issue.

2. The steps to reproduce the issue.

3. The expected result.

4. The actual result.

5. The first few lines of the log file from each node in the cluster in a timeframe as close as possible to reproducing the issue. On most unix-based systems running with defaults, you can get this information using the following command:
   
   ~~~ shell
   $ grep -F '[config]' cockroach-data/logs/cockroach.log
   ~~~~

   If the logs are not available, then we need the output of `cockroach version` for each node in the cluster.

### Template

You can use this as a template for [filing an issue on GitHub](https://github.com/cockroachdb/cockroach/issues/new):

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

