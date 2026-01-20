To install MOLT, download the binary that matches your architecture and source database:

| Operating System | Architecture |                                 PostgreSQL/MySQL                                |                                         Oracle                                        |
|------------------|--------------|---------------------------------------------------------------------------------|---------------------------------------------------------------------------------------|
| Windows          | AMD 64-bit   | [Download](https://molt.cockroachdb.com/molt/cli/molt-latest.windows-amd64.tgz) | N/A                                                                                   |
|                  | ARM 64-bit   | [Download](https://molt.cockroachdb.com/molt/cli/molt-latest.windows-arm64.tgz) | N/A                                                                                   |
| Linux            | AMD 64-bit   | [Download](https://molt.cockroachdb.com/molt/cli/molt-latest.linux-amd64.tgz)   | [Download](https://molt.cockroachdb.com/molt/cli/molt-latest.linux-amd64-oracle.tgz)  |
|                  | ARM 64-bit   | [Download](https://molt.cockroachdb.com/molt/cli/molt-latest.linux-arm64.tgz)   | N/A                                                                                   |
| Mac              | AMD 64-bit   | [Download](https://molt.cockroachdb.com/molt/cli/molt-latest.darwin-amd64.tgz)  | [Download](https://molt.cockroachdb.com/molt/cli/molt-latest.darwin-amd64-oracle.tgz) |
|                  | ARM 64-bit   | [Download](https://molt.cockroachdb.com/molt/cli/molt-latest.darwin-arm64.tgz)  | [Download](https://molt.cockroachdb.com/molt/cli/molt-latest.darwin-arm64-oracle.tgz) |

The download package includes the following:

- `molt` binary.
- `replicator` binary.
- Grafana dashboard JSON files for MOLT Fetch (`grafana_dashboard.json`) and Replicator (`replicator_grafana_dashboard.json`) metrics.
	- Oracle downloads also include the Oracle-specific Replicator dashboard (`replicator_oracle_grafana_dashboard.json`). Each bundled dashboard is compatible with its corresponding binary version.

{{site.data.alerts.callout_success}}
For ease of use, keep both `molt` and `replicator` in your current working directory.
{{site.data.alerts.end}}

To display the current version of each binary, run `molt --version` and `replicator --version`.

{{site.data.alerts.callout_info}}
`molt` is bundled with the latest `replicator` version available at the time of the MOLT release. This means that the MOLT download always contains the latest released version of [MOLT Replicator]({% link molt/molt-replicator.md %}). To verify that the `molt` and `replicator` versions match, run `molt --version` and `replicator --version`.
{{site.data.alerts.end}}

For previous binaries, refer to the [MOLT version manifest](https://molt.cockroachdb.com/molt/cli/versions.html). {% if page.name != "molt.md" %}For release details, refer to the [MOLT changelog]({% link releases/molt.md %}).{% endif %}

{% if page.name == "molt-fetch.md" or page.name == "molt.md" %}
{{site.data.alerts.callout_info}}
MOLT Fetch is supported on Red Hat Enterprise Linux (RHEL) 9 and above.
{{site.data.alerts.end}}
{% endif %}

### Docker images

{% if page.name != "molt-replicator.md" %}
#### MOLT Fetch

[Docker multi-platform images](https://hub.docker.com/r/cockroachdb/molt/tags) containing both the AMD and ARM `molt` and `replicator` binaries are available. To pull the latest image for PostgreSQL and MySQL:

{% include_cached copy-clipboard.html %}
~~~ shell
docker pull cockroachdb/molt
~~~

To pull a specific version (for example, `1.1.3`):

{% include_cached copy-clipboard.html %}
~~~ shell
docker pull cockroachdb/molt:1.1.3
~~~

To pull the latest image for Oracle (note that only `linux/amd64` is supported):

{% include_cached copy-clipboard.html %}
~~~ shell
docker pull cockroachdb/molt:oracle-latest
~~~
{% endif %}

{% if page.name != "molt-fetch.md" %}
#### MOLT Replicator

[Docker images for MOLT Replicator](https://hub.docker.com/r/cockroachdb/replicator/tags) are also available as a standalone binary:

{% include_cached copy-clipboard.html %}
~~~ shell
docker pull cockroachdb/replicator
~~~

To pull a specific version (for example, `v1.1.1`):

{% include_cached copy-clipboard.html %}
~~~ shell
docker pull cockroachdb/replicator:v1.1.1
~~~
{% endif %}
