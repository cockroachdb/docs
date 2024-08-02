### Performance

MOLT Fetch and Verify are likely to run more slowly in a Docker container than on a local machine. To improve performance, increase the memory or compute resources on your Docker container.

{% if page.name == "molt-fetch.md" %}
### Authentication

{{site.data.alerts.callout_info}}
It is only necessary to specify volumes and environment variables when using MOLT Fetch with [cloud storage](#cloud-storage), as described in the following sections. No additional configuration is needed when running MOLT Fetch with a [local file server](#local-file-server) or in [direct copy mode](#direct-copy): 

~~~ shell
docker run -it cockroachdb/molt:latest fetch ...
~~~

For more information on `docker run`, see the [Docker documentation](https://docs.docker.com/reference/cli/docker/container/run/).
{{site.data.alerts.end}}

#### Google Cloud Storage

If you are using [Google Cloud Storage](https://cloud.google.com/storage/docs/access-control) for [cloud storage](#cloud-storage):

Volume map the `application_default_credentials.json` file into the container, and set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to point to this file.

~~~ shell
docker run \
  -v ~/.config/gcloud/application_default_credentials.json:/gcp/creds.json:ro \
  -e GOOGLE_APPLICATION_CREDENTIALS=/gcp/creds.json \
  -it \
  cockroachdb/molt:latest fetch ...
~~~

In case the previous authentication method fails, you can volume map the entire [Google Cloud configuration directory](https://cloud.google.com/sdk/docs/configurations) into the container. In addition to setting the `GOOGLE_APPLICATION_CREDENTIALS` environment variable, set `CLOUDSDK_CONFIG` to point to the configuration directory:

~~~ shell
docker run \
  -v ~/.config/gcloud:/gcp/config:ro \
  -e CLOUDSDK_CONFIG=/gcp/config \
  -e GOOGLE_APPLICATION_CREDENTIALS=/gcp/config/application_default_credentials.json \
  -it \
  cockroachdb/molt:latest fetch ...
~~~

For details on Google Cloud Storage authentication, see [Application Default Credentials](https://cloud.google.com/docs/authentication/application-default-credentials).

#### Amazon S3

If you are using [Amazon S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-iam.html) for [cloud storage](#cloud-storage):

Volume map the host's `~/.aws` directory to the `/root/.aws` directory inside the container, and set the required `AWS_REGION`, `AWS_SECRET_ACCESS_KEY`, and `AWS_ACCESS_KEY_ID` environment variables:

~~~ shell
docker run \
  -v ~/.aws:/root/.aws \
  -e AWS_REGION=your-region \
  -e AWS_SECRET_ACCESS_KEY=your-secret-access-key \
  -e AWS_ACCESS_KEY_ID=your-access-key-id \
  -it \
  cockroachdb/molt:latest fetch ...
~~~
{% endif %}

### Local connection strings

When testing locally, specify the host `host.docker.internal` (macOS) or `172.17.0.1` (Linux and Windows). For example:

Mac:

~~~
--source 'postgres://postgres:postgres@host.docker.internal:5432/molt?sslmode=disable'
--target "postgres://root@host.docker.internal:26257/molt?sslmode=disable"
~~~

Linux and Windows:

~~~
--source 'postgres://postgres:postgres@172.17.0.1:5432/molt?sslmode=disable'
--target "postgres://root@172.17.0.1:26257/molt?sslmode=disable"
~~~