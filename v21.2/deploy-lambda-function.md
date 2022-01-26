---
title: Create and Deploy an AWS Lambda Function Built on CockroachDB
summary: Learn how to use AWS Lambda and CockroachDB Serverless.
toc: true
twitter: false
referral_id: docs_lambda_python
doc_area: 
product_area: 
---

This tutorial shows you how to create an [AWS Lambda](https://aws.amazon.com/lambda) function that communicates with a {{ site.data.products.serverless }} cluster.

The example function used for this tutorial is written in Python. The function uses the [Psycopg](https://www.psycopg.org/) PostgreSQL adapter to connect to CockroachDB.

## Prerequisites

Before starting the tutorial, do the following:

1. Create a [{{ site.data.products.db }}](https://cockroachlabs.cloud/signup?referralId={{page.referral_id}}) account.

1. Create an [AWS](https://aws.amazon.com/) account.

1. Create an [AWS user](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users.html) with administrator permissions.

1. Install the [AWS CLI](https://aws.amazon.com/cli/).

## Step 1. Create a {{ site.data.products.serverless }} cluster

{% include cockroachcloud/quickstart/create-a-free-cluster.md %}

<a name="connection-string"></a>

After the cluster is created, the **Connection info** window appears. Click the **Connection string** tab and copy the connection string to a secure location. You will use this connection string to connect to CockroachDB later in the tutorial.

{{site.data.alerts.callout_info}}
The connection string is pre-populated with your username, cluster name, and other details, including your password. Your password, in particular, will be provided only once. Save it in a secure place (we recommend a password manager) to connect to your cluster in the future. If you forget your password, you can reset it by going to the [**SQL Users** page](../cockroachcloud/user-authorization.html).
{{site.data.alerts.end}}

## Step 2. Get the sample code

Open a terminal window and copy the sample code's GitHub repo:

{% include_cached copy-clipboard.html %}
~~~ shell
$ git clone https://github.com/cockroachlabs/examples-aws-lambda
~~~

The function's code is available under the `examples-aws-lambda/python` directory:

~~~ shell
.
├── README.md
├── deployment-package.zip  ## Lambda deployment package
├── init_db.py              ## Lambda function source code
├── package                 ## Psycopg dependencies
├── requirements.txt        ## List of Python requirements
└── root.crt                ## CA cert
~~~

## Step 3. (Optional) Create the deployment package

{{site.data.alerts.callout_info}}    
This step is optional, as you do not need to create a new deployment package to deploy the sample function. The `examples-aws-lambda` repo includes a deployment package that is ready to deploy.
{{site.data.alerts.end}}

1. Download and install the `psycopg2-binary` Python library to a new directory:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ python3 -m pip install --only-binary :all: --platform manylinux1_x86_64  --target ./my-package -r requirements.txt
    ~~~

    {{site.data.alerts.callout_info}}    
    To run on Amazon Linux distributions, `pscyopg2` dependencies must be compiled for Linux.
    {{site.data.alerts.end}}

1. Compress the project files to a ZIP file for deployment:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cd my-package
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ zip -r ../my-deployment-package.zip .
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cd ..
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    zip -g my-deployment-package.zip init_db.py root.crt
    ~~~

## Step 4. Configure AWS

1. Configure the AWS CLI to authenticate with your AWS account:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ aws configure
    ~~~

    Follow the prompts to authenticate as a user with administrator priviliges. We do not recommend using the root user.

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

## Step 5. Deploy the function to AWS Lambda

1. In the deployment package directory, use the AWS CLI to create a Lambda function:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ aws lambda create-function \
        --function-name init-crdb \
        --region us-east-1  \
        --zip-file fileb://deployment-package.zip \
        --handler init_db.lambda_handler \
        --runtime python3.9 \
        --role arn:aws:iam::<account-id>:role/lambda-ex \
        --environment Variables={DATABASE_URL='<connection-string>'}
    ~~~

    Where `<account-id>` is your AWS account ID, and `<connection-string>` is the [connection string to the CockroachDB cluster](#connection-string).

1. Invoke the function:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ aws lambda invoke --function-name init-crdb out --region us-east-1 --log-type Tail \
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
