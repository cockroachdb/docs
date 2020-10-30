This tutorial shows you how build a simple Python application with CockroachDB and the [psycopg2](https://www.psycopg.org/docs/) driver.

To get started, download the CockroachDB archive for Linux, extract the binary, and copy it into the `PATH`:

`wget -qO- https://binaries.cockroachdb.com/cockroach-v20.2.0-rc.2.linux-amd64.tgz | tar xvz`{{execute}}

`cp -i cockroach-v20.2.0-rc.2.linux-amd64/cockroach /usr/local/bin/`{{execute}}

Then run the [`cockroach demo`](https://www.cockroachlabs.com/docs/stable/cockroach-demo.html) command to start a single-node demo cluster:

`cockroach demo --empty`{{execute}}

Once you see a prompt like `root@127.0.0.1:38807/defaultdb>`, take note of the port number (the number following the colon). You will use it in your app's connection string later.
