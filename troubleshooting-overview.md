---
title: Troubleshooting Overivew
summary: If you're having a hard time using CockroachDB, check out this overview of our existing troubleshooting resources
toc: false
---

## General Troubleshooting

Whenever you're running into issues with CockroachDB, there are two general steps you should always take:
 
 - Check your [error logs](error-logs.html).
 - [Start your nodes](start-a-node.html) with the `--vmodule` flag to increase your error log's verbosity.
 - Stop your node, and then restart it using `--logtostderr` to output errors to your terminal instead of logs.

## Topic-Specific Troubleshooting

- [Single Nodes & Sandboxes](single-nodes-and-sandboxes-troubleshooting.html) helps you with issues common to local clusters.
- [Node & Cluster Setup]() helps you start your cluster and scale it by adding nodes.
- [Query Behavior](cluster-setup-troubleshooting.html) helps if specific queries behave in ways you don't expect.

## Resources

- [Support Resources](support-resources.html) identifies ways you can get help with troubleshooting.
- [File an Issue](file-an-issue.html) provides details about filing issues that you're unable to resolve.
