---
title: Create and Deploy an AWS Lambda Function on CockroachDB
summary: Learn how to use AWS Lambda and CockroachDB Serverless.
toc: true
twitter: false
referral_id: docs_lambda_python
---

This tutorial shows you how to create an [AWS Lambda](https://aws.amazon.com/lambda) function that communicates with a {{ site.data.products.serverless }} cluster.

## Prerequisites

Before starting the tutorial, do the following:

1. Create a [{{ site.data.products.db }}](https://cockroachlabs.cloud/signup?referralId={{page.referral_id}}) account.

1. Create an [AWS](https://aws.amazon.com/) account.

1. Install the [AWS CLI](https://aws.amazon.com/cli/).

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop).

## Step 1. Create a {{ site.data.products.serverless }} cluster

{% include cockroachcloud/quickstart/create-a-free-cluster.md %}

<a name="connection-string"></a>

After the cluster is created, the **Connection info** window appears. Click the **Connection string** tab and copy the connection string to a secure location.

{{site.data.alerts.callout_info}}
The connection string is pre-populated with your username, cluster name, and other details, including your password. Your password, in particular, will be provided only once. Save it in a secure place (we recommend a password manager) to connect to your cluster in the future. If you forget your password, you can reset it by going to the [**SQL Users** page](../cockroachcloud/user-authorization.html).
{{site.data.alerts.end}}

## Step 2. Get the sample code

Open a terminal window and copy the sample code's GitHub repo:

{% include_cached copy-clipboard.html %}
~~~ shell
$ git clone https://github.com/cockroachlabs/examples-aws-lambda/
~~~

{{site.data.alerts.callout_info}}    
This repo includes the [CA certificate that verifies the identity of the CockroachDB node](https://www.cockroachlabs.com/docs/cockroachcloud/authentication.html). For instructions on downloading the CA certificate directly from the console, see [Connect to Your Cluster](https://www.cockroachlabs.com/docs/cockroachcloud/connect-to-a-serverless-cluster.html).
{{site.data.alerts.end}}

## Step 3. Build the Docker image

1. Navigate to the `examples-aws-lambda/python` directory:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cd examples-aws-lambda/python
    ~~~

1. Build the Docker image:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ docker build -t init-crdb .
    ~~~

    This command builds a Docker image based on the [AWS Lambda base image for Python](https://gallery.ecr.aws/lambda/python).

1. (Optional) Run the Docker image locally:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    docker run \
    -e DATABASE_URL="<connection-string>" \
    -p 9000:8080 init-crdb
    ~~~

    Where `<connection-string>` is the [connection string to the CockroachDB cluster](#connection-string).

    ~~~
    time="2021-11-15T21:54:31.526" level=info msg="exec '/var/runtime/bootstrap' (cwd=/var/task, handler=)"
    ~~~

1. (Optional) In a new terminal, test the local Docker container using the [AWS Runtime Interface Emulator](https://docs.aws.amazon.com/lambda/latest/dg/images-test.html):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ curl -XPOST "http://localhost:9000/2015-03-31/functions/function/invocations" -d '{}'
    ~~~

    ~~~
    START RequestId: abda8f75-5d04-4864-ab9c-91b1b9384f80 Version: $LATEST
    [INFO]	2021-11-17T17:38:39.210Z	abda8f75-5d04-4864-ab9c-91b1b9384f80	Hey! You successfully connected to your CockroachDB cluster.
    [INFO]	2021-11-17T17:38:39.386Z	abda8f75-5d04-4864-ab9c-91b1b9384f80	Created new account with id 422c6b4b-c48c-4d14-992b-631e7beb9367 and balance 321385.
    [INFO]	2021-11-17T17:38:39.430Z	abda8f75-5d04-4864-ab9c-91b1b9384f80	Created new account with id 6b390ce6-0915-467f-bd16-102665bd5002 and balance 937663.
    [INFO]	2021-11-17T17:38:39.486Z	abda8f75-5d04-4864-ab9c-91b1b9384f80	Created new account with id d1e94960-912d-4a8e-8b3a-bbc3a71e924f and balance 628323.
    [INFO]	2021-11-17T17:38:39.535Z	abda8f75-5d04-4864-ab9c-91b1b9384f80	Created new account with id 715a84fc-027a-4cb0-b39d-8d0e030aeb03 and balance 47771.
    [INFO]	2021-11-17T17:38:39.584Z	abda8f75-5d04-4864-ab9c-91b1b9384f80	Created new account with id da9667ac-6790-4764-8b46-76a5a96516c7 and balance 327718.
    [INFO]	2021-11-17T17:38:39.641Z	abda8f75-5d04-4864-ab9c-91b1b9384f80	Database initialized.
    END RequestId: abda8f75-5d04-4864-ab9c-91b1b9384f80
    REPORT RequestId: abda8f75-5d04-4864-ab9c-91b1b9384f80	Init Duration: 0.56 ms	Duration: 3896.76 ms	Billed Duration: 3897 ms	Memory Size: 3008 MB	Max Memory Used: 3008 M
    ~~~

## Step 4. Configure AWS

1. Configure the AWS CLI to authenticate with your AWS account:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ aws configure
    ~~~

    Follow the prompts to authenticate.

1. Authenticate AWS with Docker, using your AWS region and AWS account ID:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <account-id>.dkr.<region>.amazonaws.com
    ~~~

    {{site.data.alerts.callout_success}}    
    If you don't know your account ID, use `aws sts get-caller-identity` to retrieve the AWS account ID for your account.
    {{site.data.alerts.end}}

    ~~~
    Login Succeeded
    ~~~

1. Create an execution role for the Lambda function and attach the `AWSLambdaBasicExecutionRole` policy to the role:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ aws iam create-role --role-name lambda-ex --assume-role-policy-document '{"Version": "2012-10-17","Statement": [{ "Effect": "Allow", "Principal": {"Service": "lambda.amazonaws.com"}, "Action": "sts:AssumeRole"}]}'
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ aws iam attach-role-policy --role-name lambda-ex --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
    ~~~

    The Lambda function needs this role to run.

## Step 5. Deploy the Docker image to AWS Lambda

1. Create a repository in [AWS Elastic Container Registry](https://aws.amazon.com/ecr/) (ECR):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ aws ecr create-repository --repository-name init-crdb --image-scanning-configuration scanOnPush=true --image-tag-mutability MUTABLE
    ~~~

1. Tag and push the image to ECR:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ docker tag init-crdb:latest <userid>.dkr.<region>.amazonaws.com/init-crdb:latest
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ docker push <userid>.dkr.<region>.amazonaws.com/init-crdb:latest
    ~~~

    {{site.data.alerts.callout_info}}
    To create a Lambda function from a Docker image in ECR, your AWS user must have the `GetRepositoryPolicy` and `SetRepositoryPolicy` policies.
    {{site.data.alerts.end}}

1. In the deployment package directory, use the AWS CLI to create an AWS Lambda function:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ aws lambda create-function --region us-east-1 --function-name init-crdb \
        --package-type Image  \
        --code ImageUri=<userid>.dkr.<region>.amazonaws.com/init-crdb:latest   \
        --role arn:aws:iam::<account-id>:role/lambda-ex \
        --environment Variables={DATABASE_URL="<connection-string>"}
    ~~~

    Where `<connection-string>` is the [connection string to the CockroachDB cluster](#connection-string).

1. Invoke the function:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ aws lambda invoke --function-name init-crdb out --log-type Tail \
        --query 'LogResult' --output text |  base64 -d
    ~~~

    ~~~
    START RequestId: 93866b3e-d3f0-477d-a28a-37d602effcda Version: $LATEST
    [INFO]	2021-11-17T17:42:54.563Z	93866b3e-d3f0-477d-a28a-37d602effcda	Hey! You successfully connected to your CockroachDB cluster.
    [INFO]	2021-11-17T17:42:54.659Z	93866b3e-d3f0-477d-a28a-37d602effcda	Created new account with id 0dd39de7-abea-4241-b7fa-09133b3bcaff and balance 866851.
    [INFO]	2021-11-17T17:42:54.691Z	93866b3e-d3f0-477d-a28a-37d602effcda	Created new account with id 3698ffe6-a72a-427c-b9ef-fba1d723dc5e and balance 513474.
    [INFO]	2021-11-17T17:42:54.722Z	93866b3e-d3f0-477d-a28a-37d602effcda	Created new account with id 63d7e9c0-e155-4be9-b770-487e486b0c1c and balance 916934.
    [INFO]	2021-11-17T17:42:54.754Z	93866b3e-d3f0-477d-a28a-37d602effcda	Created new account with id dd5ee7e2-c86d-4b9e-801f-7abbe8abb99a and balance 108706.
    [INFO]	2021-11-17T17:42:54.786Z	93866b3e-d3f0-477d-a28a-37d602effcda	Created new account with id 16056406-9b5f-4754-8cb7-b1f37fc64dad and balance 549873.
    [INFO]	2021-11-17T17:42:54.820Z	93866b3e-d3f0-477d-a28a-37d602effcda	Database initialized.
    END RequestId: 93866b3e-d3f0-477d-a28a-37d602effcda
    REPORT RequestId: 93866b3e-d3f0-477d-a28a-37d602effcda	Duration: 722.63 ms	Billed Duration: 1117 ms	Memory Size: 128 MB	Max Memory Used: 47 MB	Init Duration: 393.51 ms
    ~~~

## See also

- [Build a Simple Django App with CockroachDB](build-a-python-app-with-cockroachdb-django.html)
- [Deploy a Global, Serverless Application](movr-flask-deployment.html)

{% include {{page.version.version}}/app/see-also-links.md %}
