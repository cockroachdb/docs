---
title: How to Get Support
toc: false
toc_not_nested: true
sidebar_data: sidebar-data-training.json
block_search: false
---

When you encounter a problem that you cannot troubleshoot yourself (e.g., data corruption or software panic), [file an issue in the `cockroach` GitHub repository](https://github.com/cockroachdb/cockroach/issues/new) and include the following details.

## Description of the problem

- What happened?
- What did you expect to happen?

## Steps to reproduce

Make these as granular and precise as possible.

## Screenshots

If any Admin UI graphs or Debug pages show the problem, include screenshots.

## Debug zip of active nodes

Use the [`cockroach debug zip`](../cockroach-debug-zip.html) command to create a single file with the following details from all active nodes in your cluster:

- Log files
- Schema change events
- Node liveness
- Gossip data
- Stack traces
- Range lists
- A list of databases and tables

## Logs of offline nodes

If any nodes are down, manually collect the logs of the down nodes, zip them up, and include them.
