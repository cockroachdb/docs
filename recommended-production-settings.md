---
title: Recommended Production Settings
summary: Recommended settings for production deployments.
toc: false
---

This page provides recommended settings for production deployments. 

<div id="toc"></div>

## Cluster Topology

Put each node on a different machine. Since CockroachDB [replicates](configure-replication-zones.html) across nodes, placing more than one node on a single machine increases the risk of data unavailability when a machine fails.

## Clock Synchronization

Run [NTP](http://www.ntp.org/) or other clock synchronization software on each machine. CockroachDB needs moderately accurate time; if the machines’ clocks drift too far apart, [transactions](transactions.html) will never succeed and the cluster will crash.

## File Descriptor Limit (Max Open Files)

For each CockroachDB node, the max file descriptor limit must be at least XXX. If the limit is below this threshold, the node will fail. 

The following are helpful resources for checking and increasing the max file descriptor limit on popular operating systems:

- [OS X](http://krypted.com/mac-os-x/maximum-files-in-mac-os-x/)
- [CentOS Linux](http://www.cyberciti.biz/faq/linux-increase-the-maximum-number-of-open-files/)
- [Ubuntu Linux](https://underyx.me/2015/05/18/raising-the-maximum-number-of-file-descriptors)
- [Windows](https://serverfault.com/questions/249477/windows-server-2008-r2-max-open-files-limit)