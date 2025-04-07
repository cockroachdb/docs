{% comment %}This include is used in install-cockroachdb-*.md{% endcomment %}
{% capture deployment_link %}
{% if page.name contains "mac" %}[Deploy a local container in Docker]({% link {{ page.version.version }}/start-a-local-cluster-in-docker-mac.md %})
{% elsif page.name contains "windows" %}[Deploy a local container in Docker]({% link {{ page.version.version }}/start-a-local-cluster-in-docker-windows.md %})
{% else %}[Deploy a local container in Docker]({% link {{ page.version.version }}/start-a-local-cluster-in-docker-linux.md %})
{% endif %}
{% endcapture %}

{{site.data.alerts.callout_danger}}
Running a stateful application like CockroachDB in Docker is more complex and error-prone than most uses of Docker. Unless you are very experienced with Docker, we recommend starting with a different installation and deployment method.
{{site.data.alerts.end}}

CockroachDB's Docker images are [multi-platform images](https://docs.docker.com/build/building/multi-platform/) that contain binaries for both Intel and ARM. Multi-platform images do not take up additional space on your Docker host.

Experimental images are not qualified for production use and not eligible for support or uptime SLA commitments.

1. Install a container runtime, such as [Docker Desktop](https://docs.docker.com/desktop/).
1. Verify that the runtime service is installed correctly and running in the background. Refer to the runtime's documentation. For Docker, start a terminal and run `docker version`. If you get an error, verify your installation and try again.
1. Visit [Docker Hub](https://hub.docker.com/r/cockroachdb/cockroach) and decide which image tag to pull. Releases are rolled out gradually. Docker images for a new release are published when other binary artifacts are published. The following tag formats are commonly used, although other tags are available.

    <table markdown="1">
    <thead>
      <tr>
        <td>Tag</td>
        <td>Example</td>
        <td>Description</td>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>An exact patch</td>
        <td>`{{ page.version.name }}`</td>
        <td>Pins a cluster to an exact patch. The cluster is upgraded to a newer patch or major version only when you pull a newer tag.</td>
      </tr>
      <tr>
        <td>Latest patch within a major version</td>
        <td>`latest-{{ page.version.version }}`</td>
        <td>Automatically updates a cluster to the latest patch of the version you specify. This tag is recommended in production, because it keeps your cluster updated within a major version but does not automatically upgrade your cluster to a new major version.</td>
      </tr>
      <tr>
        <td>`latest`</td>
        <td>The latest patch within the latest major version.
        <td>This is the default if you do not specify a tag. It updates your cluster automatically to each new patch and major version, and is not recommended in production.</td>
      </tr>
    </tbody>
    </table>

    Copy the tag you want to pull.

1. Pull the image. Replace `{TAG}` with the tag from the previous step.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    docker pull cockroachdb/cockroach:{TAG}
    ~~~

1. Start a cluster by starting the container on each node using `docker start`. The default command is `cockroach start`. Pass your desired flags as the final argument. For details, refer to {{ deployment_link | strip }}.
