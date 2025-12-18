Ensure that access control is properly configured for [Amazon S3](#amazon-s3), [Google Cloud Storage](#google-cloud-storage), or [Azure Blob Storage](#azure-blob-storage).

<div class="filters filters-big clearfix">
    <button class="filter-button" data-scope="s3">S3</button>
    <button class="filter-button" data-scope="gcs">GCS</button>
    <button class="filter-button" data-scope="azure">Azure</button>
</div>

<section class="filter-content" markdown="1" data-scope="s3">
##### Amazon S3

- Set the following environment variables in the terminal running `molt fetch`:

	~~~ shell
	export AWS_REGION='us-east-1'
	export AWS_SECRET_ACCESS_KEY='key'
	export AWS_ACCESS_KEY_ID='id'
	~~~

	- To run `molt fetch` in a containerized environment (e.g., Docker), pass the required environment variables using `-e`. If your authentication method relies on local credential files, you may also need to volume map the host path to the appropriate location inside the container using `-v`. For example:

		~~~ shell
		docker run \
		  -e AWS_ACCESS_KEY_ID='your-access-key' \
		  -e AWS_SECRET_ACCESS_KEY='your-secret-key' \
		  -v ~/.aws:/root/.aws \
		  -it \
		  cockroachdb/molt fetch \
		  --bucket-path 's3://migration/data/cockroach' ...
		~~~

- Alternatively, set `--use-implicit-auth` to use [implicit authentication]({% link "{{ site.current_cloud_version }}/cloud-storage-authentication.md" %}). When using assume role authentication, specify the service account with `--assume-role`. For example:

	~~~
	--bucket-path 's3://migration/data/cockroach'
	--assume-role 'arn:aws:iam::123456789012:role/MyMigrationRole'
	--use-implicit-auth
	~~~

- Set `--import-region` to specify an `AWS_REGION` (e.g., `--import-region 'ap-south-1'`).

- Ensure the S3 bucket is created and accessible by authorized roles and users only.
</section>

<section class="filter-content" markdown="1" data-scope="gcs">
##### Google Cloud Storage

- Authenticate your local environment with [Application Default Credentials](https://cloud.google.com/docs/authentication/application-default-credentials):

	Using `gcloud`:

	~~~ shell
	gcloud init
	gcloud auth application-default login
	~~~

	Using the environment variable:

	~~~ shell
	export GOOGLE_APPLICATION_CREDENTIALS={path_to_cred_json}
	~~~

	- To run `molt fetch` in a containerized environment (e.g., Docker), pass the required environment variables using `-e`. If your authentication method relies on local credential files, you may also need to volume map the host path to the appropriate location inside the container using `-v`. For example:

		~~~ shell
		docker run \
		  -e GOOGLE_APPLICATION_CREDENTIALS='/root/.config/gcloud/application_default_credentials.json' \
		  -v ~/.config/gcloud:/root/.config/gcloud \
		  -it \
		  cockroachdb/molt fetch \
		  --bucket-path 'gs://migration/data/cockroach' ...
		~~~

- Alternatively, set `--use-implicit-auth` to use [implicit authentication]({% link "{{ site.current_cloud_version }}/cloud-storage-authentication.md" %}). When using assume role authentication, specify the service account with `--assume-role`. For example:

	~~~
	--bucket-path 'gs://migration/data/cockroach
	--use-implicit-auth
	--assume-role 'user-test@cluster-ephemeral.iam.gserviceaccount.com'
	~~~

- Ensure the Google Cloud Storage bucket is created and accessible by authorized roles and users only.
</section>

<section class="filter-content" markdown="1" data-scope="azure">
##### Azure Blob Storage

- Set the following environment variables in the terminal running `molt fetch`:

	~~~ shell
	export AZURE_ACCOUNT_NAME='account'
	export AZURE_ACCOUNT_KEY='key'
	~~~

	You can also speicfy client and tenant credentials as environment variables:

	~~~ shell
	export AZURE_CLIENT_SECRET='secret'
	export AZURE_TENANT_ID='id'
	~~~

	- To run `molt fetch` in a containerized environment (e.g., Docker), pass the required environment variables using `-e`. If your authentication method relies on local credential files, you may also need to volume map the host path to the appropriate location inside the container using `-v`. For example:

		~~~ shell
		docker run \
		  -e AZURE_ACCOUNT_NAME='account' \
		  -e AZURE_ACCOUNT_KEY='key' \
		  -e AZURE_CLIENT_SECRET='secret' \
		  -e AZURE_TENANT_ID='id' \
		  -v ~/.azure:/root/.azure \
		  -it \
		  cockroachdb/molt fetch \
		  --bucket-path 'azure-blob://migration/data/cockroach' ...
		~~~

- Alternatively, set `--use-implicit-auth` to use implicit authentication: For example:

	~~~
	--bucket-path 'azure-blob://migration/data/cockroach'
	--use-implicit-auth
	~~~

	This mode supports Azure [managed identities](https://learn.microsoft.com/en-us/entra/identity/managed-identities-azure-resources/overview) and [workload identities](https://learn.microsoft.com/en-us/entra/workload-id/workload-identities-overview).

- Ensure the Azure Blob Storage container is created and accessible by authorized roles and users only.
</section>