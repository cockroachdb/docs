To install MOLT, download the binary that matches your architecture and source database:

| Operating System | Architecture |                                 PostgreSQL/MySQL                                |                                   Oracle (Preview)                                   |
|------------------|--------------|---------------------------------------------------------------------------------|--------------------------------------------------------------------------------------|
| Windows          | AMD 64-bit   | [Download](https://molt.cockroachdb.com/molt/cli/molt-latest.windows-amd64.tgz) | N/A                                                                                  |
|                  | ARM 64-bit   | [Download](https://molt.cockroachdb.com/molt/cli/molt-latest.windows-arm64.tgz) | N/A                                                                                  |
| Linux            | AMD 64-bit   | [Download](https://molt.cockroachdb.com/molt/cli/molt-latest.linux-amd64.tgz)   | [Download](https://molt.cockroachdb.com/molt/cli/molt-latest.linux-amd64-oracle.tgz) |
|                  | ARM 64-bit   | [Download](https://molt.cockroachdb.com/molt/cli/molt-latest.linux-arm64.tgz)   | N/A                                                                                  |
| Mac              | AMD 64-bit   | [Download](https://molt.cockroachdb.com/molt/cli/molt-latest.darwin-amd64.tgz)  | N/A                                                                                  |
|                  | ARM 64-bit   | [Download](https://molt.cockroachdb.com/molt/cli/molt-latest.darwin-arm64.tgz)  | N/A                                                                                  |

The following binaries are included:

- `molt`
- `replicator`

Both `molt` and `replicator` must be in your current **working directory**. To use replication features, `replicator` must be located either in the same directory as `molt` or in a directory directly beneath `molt`. For example, either of the following would be valid:

~~~
/migration-project/          # Your current working directory
├── molt                     # MOLT binary
└── replicator               # Replicator binary
~~~
	
~~~
/migration-project/          # Your current working directory
├── molt                     # MOLT binary
└── bin/                     # Subdirectory
    └── replicator           # Replicator binary
~~~

To display the current version of each binary, run `molt --version` and `replicator --version`.

For previous binaries, refer to the [MOLT version manifest](https://molt.cockroachdb.com/molt/cli/versions.html). {% if page.name != "molt.md" %}For release details, refer to the [MOLT changelog]({% link releases/molt.md %}).{% endif %}

{% if page.name == "molt-fetch.md" or page.name == "molt.md" %}
{{site.data.alerts.callout_info}}
MOLT Fetch is supported on Red Hat Enterprise Linux (RHEL) 9 and above.
{{site.data.alerts.end}}
{% endif %}

### Docker image

[Docker multi-platform images](https://hub.docker.com/r/cockroachdb/molt/tags) containing both the AMD and ARM binaries are available. To pull the latest image for PostgreSQL and MySQL:

{% include_cached copy-clipboard.html %}
~~~ shell
docker pull cockroachdb/molt
~~~

To pull a specific version (e.g., `1.1.3`):

{% include_cached copy-clipboard.html %}
~~~ shell
docker pull cockroachdb/molt:1.1.3
~~~

To pull the latest image for Oracle (note that only `linux/amd64` is supported):

{% include_cached copy-clipboard.html %}
~~~ shell
docker pull cockroachdb/molt:oracle-latest
~~~

{% if page.name != "molt.md" %}For details on running in Docker, refer to [Docker usage](#docker-usage).{% endif %}
