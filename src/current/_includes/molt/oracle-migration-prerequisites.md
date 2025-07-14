### Prerequisites

#### Oracle Instant Client

Install Oracle Instant Client on the machine that will run `molt` and `replicator`:

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
	curl -o /tmp/ora-libs.zip https://replicator.cockroachdb.com/third_party/instantclient-basiclite-linux-amd64.zip
	unzip -d /tmp /tmp/ora-libs.zip
	sudo mv /tmp/instantclient_21_13/* /usr/lib
	export LD_LIBRARY_PATH=/usr/lib
	~~~

{% if page.name != "migrate-bulk-load.md" %}
#### Enable `ARCHIVELOG`

Enable `ARCHIVELOG` mode on the Oracle database. This is required for Oracle LogMiner, Oracle's built-in changefeed tool that captures DML events for replication.

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT log_mode FROM v$database;
SHUTDOWN IMMEDIATE;
STARTUP MOUNT;
ALTER DATABASE ARCHIVELOG;
ALTER DATABASE OPEN;
SELECT log_mode FROM v$database;
~~~

~~~
LOG_MODE
--------
ARCHIVELOG

1 row selected.
~~~

Enable supplemental primary key logging for logical replication:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER DATABASE ADD SUPPLEMENTAL LOG DATA (PRIMARY KEY) COLUMNS;
SELECT supplemental_log_data_min, supplemental_log_data_pk FROM v$database;
~~~

~~~
SUPPLEMENTAL_LOG_DATA_MIN SUPPLEMENTAL_LOG_DATA_PK
------------------------- ------------------------
IMPLICIT                  YES

1 row selected.
~~~

Enable `FORCE_LOGGING` to ensure that all data changes are captured for the tables to migrate:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER DATABASE FORCE LOGGING;
~~~
{% endif %}