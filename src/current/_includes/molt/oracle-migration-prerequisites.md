### Prerequisites

#### Oracle Instant Client

Install Oracle Instant Client on the machine that will run `molt` and `replicator`. If using the MOLT Replicator binary (instead of Docker), the Oracle Instant Client libraries must be accessible at `/usr/lib`.

- On macOS ARM machines, download the [Oracle Instant Client](https://www.oracle.com/database/technologies/instant-client/macos-arm64-downloads.html#ic_osx_inst). After installation, you should have a new directory at `/Users/$USER/Downloads/instantclient_23_3` containing `.dylib` files. Set the `LD_LIBRARY_PATH` environment variable to this directory:

	{% include_cached copy-clipboard.html %}
	~~~ shell
	export LD_LIBRARY_PATH=/Users/$USER/Downloads/instantclient_23_3
	~~~

- On Linux machines, install the Oracle Instant Client dependencies and set the `LD_LIBRARY_PATH` to the client library path:

	{% include_cached copy-clipboard.html %}
	~~~ shell
	sudo apt-get install -yqq --no-install-recommends libaio1t64
	sudo ln -s /usr/lib/x86_64-linux-gnu/libaio.so.1t64 /usr/lib/x86_64-linux-gnu/libaio.so.1
	unzip -d /tmp /tmp/instantclient-basiclite-linux-amd64.zip
	sudo mv /tmp/instantclient_21_13/* /usr/lib
	export LD_LIBRARY_PATH=/usr/lib
	~~~

	{{site.data.alerts.callout_success}}
	You can also download Oracle Instant Client directly from the Oracle site for [Linux ARM64](https://www.oracle.com/database/technologies/instant-client/linux-amd64-downloads.html) or [Linux x86-64](https://www.oracle.com/ca-en/database/technologies/instant-client/linux-x86-64-downloads.html).
	{{site.data.alerts.end}}