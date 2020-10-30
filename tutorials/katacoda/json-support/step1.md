This tutorial walks you through a demonstration of how CockroachDB can store and query unstructured [JSONB](https://www.cockroachlabs.com/docs/stable/jsonb.html) data from a third-party API, as well as how an inverted index can optimize your queries.

To get started, download the CockroachDB archive for Linux, extract the binary, and copy it into the `PATH`:

`wget -qO- https://binaries.cockroachdb.com/cockroach-v20.2.0-rc.2.linux-amd64.tgz | tar xvz`{{execute}}

`cp -i cockroach-v20.2.0-rc.2.linux-amd64/cockroach /usr/local/bin/`{{execute}}

Then run the [`cockroach start-single-node`](https://www.cockroachlabs.com/docs/stable/cockroach-start-single-node.html) command to start a single-node demo cluster:

`cockroach start-single-node --insecure --listen-addr=localhost:26257 --http-addr=localhost:8080`{{execute}}

Once you see the startup details ending with `nodeID`, click **Continue**.
