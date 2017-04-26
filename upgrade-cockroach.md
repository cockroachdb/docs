---
title: Upgrade Your Cluster's Version of CockroachDB
summary: Learn how to upgrade your CockroachDB cluster to a new version.
toc: false
toc_not_nested: true
---

Because of CockroachDB's multi-active availability design, you can perform a "rolling upgrade" of CockroachDB on your cluster. This means you can upgrade individual nodes in your cluster one at a time without any downtime for your cluster.

However, there are a few things you should keep in mind:

  - For rolling upgrades to work, your cluster must be behind a load balancer or your clients must be configured to talk to multiple nodes. If your application communicates with a single node, bringing it down to upgrade its CockroachDB binary will cause your application to fail when the node goes offline.

  - We recommend creating scripts to upgrade CockroachDB and not attempting to do so by hand.

  - Only bring down only one node at a time, and wait at least one minute after it rejoins the cluster to bring down the next node to prevent CockroachDB from entering a failover state.

## Perform a Rolling Upgrade

1. Connect to the node.

4. Download and install the CockroachDB binary you want to use:

   - **Mac**:

     ~~~ shell
     $ curl -O https://binaries.cockroachdb.com/cockroach-{{site.data.strings.version}}.darwin-10.9-amd64.tgz
     $ tar xfz cockroach-{{site.data.strings.version}}.darwin-10.9-amd64.tgz

     # Optional: Place cockroach in your $PATH
     $ cp -i cockroach-{{site.data.strings.version}}.darwin-10.9-amd64/cockroach /usr/local/bin/cockroach
     ~~~

   - **Linux**:

     ~~~ shell
     $ wget https://binaries.cockroachdb.com/cockroach-{{site.data.strings.version}}.linux-amd64.tgz
     $ tar xfz cockroach-{{site.data.strings.version}}.linux-amd64.tgz 

     # Optional: Place cockroach in your $PATH
     $ cp -i cockroach-{{site.data.strings.version}}.linux-amd64/cockroach /usr/local/bin/cockroach
     ~~~

2. If you're running with a process manager, have it stop `cockroach`.

   Without a process manager, use this command:

   ~~~ shell
   $ pkill cockroach
   ~~~

3. If you use `cockroach` in your `$PATH`, rename the outdated `cockroach` binary:

   ~~~ shell
   $ i="$(which cockroach)"; mv "$i" "$i"_old
   ~~~

   If you leave versioned binaries on your servers, you don't need to do anything.


5. If you're running with a process manager, have the node rejoin the cluster by starting it.

   Without a process manager, use this command:

   ~~~ shell
   $ cockroach start --join=[any other node's IP address] [other flags]
   ~~~

   `[other flags]` includes any flags you [use to start nodes](start-a-node.html), such as its `--host`.

6. If you use `cockroach` in your `$PATH`, once you've confirmed that the node has rejoined the cluster, you can remove the old binary:

   ~~~ shell
   $ rm "$i"_old
   ~~~

Repeat these steps for each node in the cluster, waiting at least one minute after a node rejoins the cluste before bringing down the next one.

## See Also

- [View Version Details](view-version-details.html)
- [Release notes for our latest version]({{site.data.strings.version}}.html)
