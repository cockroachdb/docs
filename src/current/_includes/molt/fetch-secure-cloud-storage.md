- When exporting data to [cloud storage]({% link molt/molt-fetch.md %}#cloud-storage), ensure that access control is properly configured:

	- If you are using [Amazon S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-iam.html) for cloud storage:

		- Ensure that the following environment variables are set appropriately in the terminal running `molt fetch`:

			{% include_cached copy-clipboard.html %}
			~~~ shell
			export AWS_REGION='us-east-1'
			export AWS_SECRET_ACCESS_KEY='key'
			export AWS_ACCESS_KEY_ID='id'
			~~~

		- Alternatively, set the `--use-implicit-auth` flag to use [implicit authentication]({% link {{ site.current_cloud_version }}/cloud-storage-authentication.md %}).

		- Ensure the S3 bucket is created and accessible by authorized roles and users only.

	- If you are using [Google Cloud Storage](https://cloud.google.com/storage/docs/access-control) for cloud storage:

		- Ensure that your local environment is authenticated using [Application Default Credentials](https://cloud.google.com/docs/authentication/application-default-credentials):

			Using `gcloud`:

			{% include_cached copy-clipboard.html %}
			~~~ shell
			gcloud init
			gcloud auth application-default login
			~~~

			Using the environment variable:

			{% include_cached copy-clipboard.html %}
			~~~ shell
			export GOOGLE_APPLICATION_CREDENTIALS={path_to_cred_json}
			~~~

		- Alternatively, set the `--use-implicit-auth` flag to use [implicit authentication]({% link {{ site.current_cloud_version }}/cloud-storage-authentication.md %}?filters=gcs).

		- Ensure the Google Cloud Storage bucket is created and accessible by authorized roles and users only.