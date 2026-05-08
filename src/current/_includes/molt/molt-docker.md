#### Performance

MOLT Fetch, Verify, and Replicator are likely to run more slowly in a Docker container than on a local machine. To improve performance, increase the memory or compute resources, or both, on your Docker container.

{% if page.name == "molt-fetch.md" %}
#### Authentication

When using MOLT Fetch with [cloud storage](#bucket-path), it is necessary to specify volumes and environment variables, as described in the following sections for [Google Cloud Storage](#google-cloud-storage) and [Amazon S3](#amazon-s3). 

No additional configuration is needed when running MOLT Fetch with a [local file server](#local-path) or in [direct copy mode](#direct-copy): 

~~~ shell
docker run -it cockroachdb/molt fetch ...
~~~

For more information on `docker run`, see the [Docker documentation](https://docs.docker.com/reference/cli/docker/container/run/).

##### Google Cloud Storage

If you are using [Google Cloud Storage](https://cloud.google.com/storage/docs/access-control) for [cloud storage](#bucket-path):

Volume map the `application_default_credentials.json` file into the container, and set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to point to this file.

~~~ shell
docker run \
  -v ~/.config/gcloud/application_default_credentials.json:/gcp/creds.json:ro \
  -e GOOGLE_APPLICATION_CREDENTIALS=/gcp/creds.json \
  -it \
  cockroachdb/molt fetch ...
~~~

In case the previous authentication method fails, you can volume map the entire [Google Cloud configuration directory](https://cloud.google.com/sdk/docs/configurations) into the container. In addition to setting the `GOOGLE_APPLICATION_CREDENTIALS` environment variable, set `CLOUDSDK_CONFIG` to point to the configuration directory:

~~~ shell
docker run \
  -v ~/.config/gcloud:/gcp/config:ro \
  -e CLOUDSDK_CONFIG=/gcp/config \
  -e GOOGLE_APPLICATION_CREDENTIALS=/gcp/config/application_default_credentials.json \
  -it \
  cockroachdb/molt fetch ...
~~~

For details on Google Cloud Storage authentication, see [Application Default Credentials](https://cloud.google.com/docs/authentication/application-default-credentials).

##### Amazon S3

If you are using [Amazon S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-iam.html) for [cloud storage](#bucket-path):

Volume map the host's `~/.aws` directory to the `/root/.aws` directory inside the container, and set the required `AWS_REGION`, `AWS_SECRET_ACCESS_KEY`, and `AWS_ACCESS_KEY_ID` environment variables:

~~~ shell
docker run \
  -v ~/.aws:/root/.aws \
  -e AWS_REGION=your-region \
  -e AWS_SECRET_ACCESS_KEY=your-secret-access-key \
  -e AWS_ACCESS_KEY_ID=your-access-key-id \
  -it \
  cockroachdb/molt fetch ...
~~~
{% endif %}

#### Local connection strings

When testing locally, specify the host as follows:

- For macOS, use `host.docker.internal`. For example:

    {% if page.name == "molt-replicator.md" %}
    ~~~
    --sourceConn 'postgres://postgres:postgres@host.docker.internal:5432/migration_db?sslmode=disable'
    --targetConn "postgres://root@host.docker.internal:26257/defaultdb?sslmode=disable"
    ~~~
    {% else %}
    ~~~
    --source 'postgres://postgres:postgres@host.docker.internal:5432/migration_db?sslmode=disable'
    --target "postgres://root@host.docker.internal:26257/defaultdb?sslmode=disable"
    ~~~
    {% endif %}

- For Linux and Windows, use `172.17.0.1`. For example:

    {% if page.name == "molt-replicator.md" %}
    ~~~
    --sourceConn 'postgres://postgres:postgres@172.17.0.1:5432/migration_db?sslmode=disable'
    --targetConn "postgres://root@172.17.0.1:26257/defaultdb?sslmode=disable"
    ~~~
    {% else %}
    ~~~
    --source 'postgres://postgres:postgres@172.17.0.1:5432/migration_db?sslmode=disable'
    --target "postgres://root@172.17.0.1:26257/defaultdb?sslmode=disable"
    ~~~
    {% endif %}