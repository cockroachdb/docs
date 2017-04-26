---
title: Upgrade Your Cluster's Version of CockroachDB
summary: Learn how to upgrade your CockroachDB cluster to a new version.
toc: false
toc_not_nested: true
---

Because of CockroachDB's multi-active availability design, you can perform a "rolling upgrade" of CockroachDB on your cluster. This means you can upgrade individual nodes in your cluster one at a time without bringing your cluster down at all.

For rolling upgrades to work, though, your cluster must be behind a load balancer. If your application communicates with a single node, bringing it down to upgrade its CockroachDB binary, your application will not receive data, causing it to fail.

## Manually Perform a Rolling Upgrade

In advance of this procedure, you will need the IP addresses of all your cluster's nodes.

1. Connect to the node.

2. Stop `cockroach`:

   ~~~ shell
   $ cockroach quit [flags]
   ~~~

   `[flags]` includes the flags you [use to communicate with a node](stop-a-node.html), such as its `--host`.

3. Rename the outdated `cockroach` binary:

   ~~~ shell
   $ i="$(which cockroach)"; mv "$i" "$i"_old
   ~~~

4. Download and install the CockroachDB binary you want to use (this example uses the `latest` build for simplicity's sake):
	
   - **Mac**:

	 ~~~ shell
	 $ curl -O https://binaries.cockroachdb.com/cockroach-latest.darwin-10.9-amd64.tgz
	 $ tar xfz cockroach-latest.darwin-10.9-amd64.tgz
	 $ cp -i cockroach-latest.darwin-10.9-amd64/cockroach "$i"
	 ~~~

   - **Linux**:

     ~~~ shell
     $ wget https://binaries.cockroachdb.com/cockroach-latest.linux-amd64.tgz
     $ tar xfz cockroach-latest.linux-amd64.tgz
     $ cp -i cockroach-latest.linux-amd64/cockroach "$i"
     ~~~

5. Rejoin the node to the cluster using any other node's IP address:

   ~~~ shell
   $ cockroach start --join=[any other node's IP address] [other flags]
   ~~~

   `[other flags]` includes any flags you [use to start nodes](start-a-node.html), such as its `--host`.

6. Once you've confirmed that the node has rejoined the cluster, you can remove the old binary:

   ~~~ shell
   $ rm "$i"_old
   ~~~

Repeat these steps for each node in the cluster.

## See Also

- [View Version Details](view-version-details.html)
- **Release Notes** in our navigation
