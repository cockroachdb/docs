---
title: Demo Data Replication
summary: 
toc: false
---

This page demonstrates how CockroachDB replicates and distributes data. Starting with a 3-node local cluster, you'll ...

start with 1 node
write data
add 2 more and watch rereplicate
take node down
can still access
bring node back up
change zone config to have 5 replicas
add 2 more nodes
watch replication
take down 2 nodes

<div id="toc"></div>

## Before You Begin

Make sure you have already:

- [Installed CockroachDB](install-cockroachdb.html) 
- [Started a local cluster](start-a-local-cluster.html) in insecure mode
