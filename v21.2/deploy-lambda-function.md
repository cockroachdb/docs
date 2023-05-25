---
title: Create and Deploy an AWS Lambda Function Built on CockroachDB
summary: Learn how to use AWS Lambda and CockroachDB Serverless.
toc: true
twitter: false
referral_id: docs_lambda
docs_area: get_started
---

This tutorial shows you how to create an [AWS Lambda](https://aws.amazon.com/lambda) function that communicates with a {{ site.data.products.serverless }} cluster.

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
The connection string is pre-populated with your username, cluster name, and other details, including your password. Your password, in particular, will be provided only once. Save it in a secure place (we recommend a password manager) to connect to your cluster in the future. If you forget your password, you can reset it by going to the **SQL Users** page for the cluster, found at `https://cockroachlabs.cloud/cluster/<CLUSTER ID>/users`.
{{site.data.alerts.end}}

## Step 2. Get the sample code

Open a terminal window and clone the [sample code's GitHub repo](https://github.com/cockroachlabs/examples-aws-lambda):

{% include_cached copy-clipboard.html %}
~~~ shell
$ git clone https://github.com/cockroachlabs/examples-aws-lambda
~~~

This repo includes samples for Node.js and Python [Lambda runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html).

<div class="filters filters-big clearfix">
    <button class="filter-button" data-scope="node">Node.js</button>
    <button class="filter-button" data-scope="python">Python</button>
</div>

<section class="filter-content" markdown="1" data-scope="node">

The Node.js function code is available under the `examples-aws-lambda/node` directory:

~~~ shell
.
├── README.md
├── deployment-package.zip  ## Lambda deployment package
├── index.js                ## Lambda function source code
├── package-lock.json       ## Dependencies
└── package.json            ## Dependencies
~~~

This function uses the [node-postgres](https://node-postgres.com/) modules to connect to CockroachDB.

</section>

<section class="filter-content" markdown="1" data-scope="python">

The Python function's code is available under the `examples-aws-lambda/python` directory:

~~~ shell
.
├── README.md
├── deployment-package.zip  ## Lambda deployment package
├── init_db.py              ## Lambda function source code
├── package                 ## Psycopg dependencies
├── requirements.txt        ## List of Python requirements
└── root.crt                ## CA cert
~~~

This function uses the [Psycopg2](https://www.psycopg.org/) PostgreSQL adapter to connect to CockroachDB.

</section>

## Step 3. (Optional) Create the deployment package

{{site.data.alerts.callout_info}}    
This step is optional, as you do not need to create a new deployment package to deploy the sample function. The `examples-aws-lambda` repo includes deployment packages that are ready to deploy.
{{site.data.alerts.end}}

<section class="filter-content" markdown="1" data-scope="node">

1. Navigate to the Node.js function directory:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cd node
    ~~~

1. Install the code dependencies:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    npm install
    ~~~

1. Compress the project files to a ZIP file for deployment:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    zip -r deployment-package.zip .
    ~~~

</section>

<section class="filter-content" markdown="1" data-scope="python">

1. Navigate to the Python function directory:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cd python
    ~~~

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
    $ cd ..
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ zip -g my-deployment-package.zip init_db.py root.crt
    ~~~

</section>

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

    <section class="filter-content" markdown="1" data-scope="node">

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ aws lambda create-function \
        --function-name init-crdb \
        --region <region>  \
        --zip-file fileb://deployment-package.zip \
        --handler index.handler \
        --runtime nodejs14.x \
        --role arn:aws:iam::<account-id>:role/lambda-ex \
        --environment "Variables={DATABASE_URL=<connection-string>}"
    ~~~

    </section>

    <section class="filter-content" markdown="1" data-scope="python">

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ aws lambda create-function \
        --function-name init-crdb \
        --region <region>  \
        --zip-file fileb://deployment-package.zip \
        --handler init_db.lambda_handler \
        --runtime python3.9 \
        --role arn:aws:iam::<account-id>:role/lambda-ex \
        --environment "Variables={DATABASE_URL=<connection-string>,PGSSLROOTCERT=./root.crt}"
    ~~~

    </section>

    Where:
    - `<region>` is the region closest to your CockroachDB deployment.
    - `<account-id>` is your AWS account ID.
    - `<connection-string>` is the [connection string to the CockroachDB cluster](#connection-string).

    <section class="filter-content" markdown="1" data-scope="python">

    {{site.data.alerts.callout_info}}
    To connect to a {{ site.data.products.serverless }} cluster with Psycopg2, you must provide the client with a valid CA certificate. By default, Pscyopg2 searches for the certificate at <code>~/.postgresql/root.crt</code>, or in the environment variable `PGSSLROOTCERT`.
    {{site.data.alerts.end}}

    </section>

1. Invoke the function:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ aws lambda invoke --function-name init-crdb out --log-type Tail \
        --query 'LogResult' --output text |  base64 -d
    ~~~

    ~~~
    START RequestId: 12232b98-daac-4a1e-80e9-f2ecaa6497aa Version: $LATEST
    2022-02-16T19:24:49.569Z        12232b98-daac-4a1e-80e9-f2ecaa6497aa    INFO    Initializing table...
    2022-02-16T19:24:49.596Z        12232b98-daac-4a1e-80e9-f2ecaa6497aa    INFO    Hey! You successfully connected to your CockroachDB cluster.
    2022-02-16T19:24:49.635Z        12232b98-daac-4a1e-80e9-f2ecaa6497aa    INFO    Created new account with balance 320.
    2022-02-16T19:24:49.655Z        12232b98-daac-4a1e-80e9-f2ecaa6497aa    INFO    Created new account with balance 593.
    2022-02-16T19:24:49.660Z        12232b98-daac-4a1e-80e9-f2ecaa6497aa    INFO    Created new account with balance 277.
    2022-02-16T19:24:49.675Z        12232b98-daac-4a1e-80e9-f2ecaa6497aa    INFO    Created new account with balance 844.
    2022-02-16T19:24:49.680Z        12232b98-daac-4a1e-80e9-f2ecaa6497aa    INFO    Created new account with balance 257.
    2022-02-16T19:24:49.680Z        12232b98-daac-4a1e-80e9-f2ecaa6497aa    INFO    Database initialized.
    END RequestId: 12232b98-daac-4a1e-80e9-f2ecaa6497aa
    REPORT RequestId: 12232b98-daac-4a1e-80e9-f2ecaa6497aa  Duration: 644.49 ms     Billed Duration: 645 ms Memory Size: 128 MB     Max Memory Used: 63 MB  Init Duration: 198.77 ms
    ~~~

## See also

- [Build a Simple Django App with CockroachDB](build-a-python-app-with-cockroachdb-django.html)
- [Deploy a Global, Serverless Application](movr-flask-deployment.html)

{% include {{page.version.version}}/app/see-also-links.md %}
