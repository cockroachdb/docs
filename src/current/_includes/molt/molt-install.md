| Operating System |                                    AMD 64-bit                                   |                                    ARM 64-bit                                   |
|------------------|---------------------------------------------------------------------------------|---------------------------------------------------------------------------------|
| Windows          | [Download](https://molt.cockroachdb.com/molt/cli/molt-latest.windows-amd64.tgz) | [Download](https://molt.cockroachdb.com/molt/cli/molt-latest.windows-arm64.tgz) |
| Linux            | [Download](https://molt.cockroachdb.com/molt/cli/molt-latest.linux-amd64.tgz)   | [Download](https://molt.cockroachdb.com/molt/cli/molt-latest.linux-arm64.tgz)   |
| Mac              | [Download](https://molt.cockroachdb.com/molt/cli/molt-latest.darwin-amd64.tgz)  | [Download](https://molt.cockroachdb.com/molt/cli/molt-latest.darwin-arm64.tgz)  |

For previous binaries, refer to the [MOLT version manifest](https://molt.cockroachdb.com/molt/cli/versions.html). {% if page.name != "molt.md" %}For release details, see the [MOLT changelog]({% link releases/molt.md %}).{% endif %}

{% if page.name == "molt-fetch.md" or page.name == "molt.md" %}
{{site.data.alerts.callout_info}}
MOLT Fetch is supported on Red Hat Enterprise Linux (RHEL) 9 and above.
{{site.data.alerts.end}}
{% endif %}

### Docker image

[Docker multi-platform images](https://hub.docker.com/r/cockroachdb/molt/tags) containing both the AMD and ARM binaries are available. To pull the latest image:

{% include_cached copy-clipboard.html %}
~~~ shell
docker pull cockroachdb/molt
~~~

To pull a specific version (e.g., `1.1.3`):

{% include_cached copy-clipboard.html %}
~~~ shell
docker pull cockroachdb/molt:1.1.3
~~~

{% if page.name != "molt.md" %}For details on running in Docker, see [Docker usage](#docker-usage).{% endif %}