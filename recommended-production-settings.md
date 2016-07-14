---
title: Recommended Production Settings
summary: Recommended settings for production deployments.
toc: false
---

This page provides recommended settings for production deployments. 

<div id="toc"></div>

## Cluster Topology

- Run one node per machine. Since CockroachDB [replicates](configure-replication-zones.html) across nodes, running more than one node per machine increases the risk of data unavailability if a machine fails.

- If a machine has multiple disks or SSDs, it's better to run one node with multiple `--store` flags instead of one node per disk, because this informs CockroachDB about the relationship between the stores and ensures that data will be replicated across different machines instead of being assigned to different disks of the same machine. For more details about stores, see [Start a Node](start-a-node.html).

## Clock Synchronization

Run [NTP](http://www.ntp.org/) or other clock synchronization software on each machine. CockroachDB needs moderately accurate time; if the machines’ clocks drift too far apart, [transactions](transactions.html) will never succeed and the cluster will crash.

## File Descriptor Limit (Max Open Files)

CockroachDB can use a large number of open file descriptors, often more than is available by default. Therefore, please note the following recommendations.

For each CockroachDB node:

- At a **minimum**, the file descriptor limit must be 256 per store plus 256 for networking. If the limit is below this threshold, the node will not start. 
- The **recommended** file descriptor limit is at least 5000 per store plus 5000 for networking. These higher limits ensure performance and accommodate cluster growth. 
- When the file descriptor limit is between these minimum and recommended amounts, CockroachDB will allocate 256 to networking and evently split the rest across stores.

### Increase the File Descriptor Limit

The following are helpful resources for checking and increasing the file descriptor limit on popular operating systems:

- [OS X](http://krypted.com/mac-os-x/maximum-files-in-mac-os-x/)
- [CentOS Linux](http://www.cyberciti.biz/faq/linux-increase-the-maximum-number-of-open-files/)
- [Ubuntu Linux](https://underyx.me/2015/05/18/raising-the-maximum-number-of-file-descriptors)
- [Windows](https://serverfault.com/questions/249477/windows-server-2008-r2-max-open-files-limit)
