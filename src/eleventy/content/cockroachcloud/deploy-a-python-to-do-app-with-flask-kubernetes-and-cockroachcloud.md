---
title: Deploy a Python To-Do App with Flask, Kubernetes, and CockroachDB Cloud
summary: Learn how to deploy a sample Python web app with Flask, Kubernetes, and CockroachDB Cloud
toc: true
toc_not_nested: true
docs_area:
---

This tutorial shows you how to run a sample To-Do app in [Kubernetes](https://kubernetes.io/) with CockroachDB {{ site.data.products.standard }} as the datastore. The app is written in Python and uses the Flask web framework and SQLAlchemy for working with SQL data. You can view and download the code from [GitHub](https://github.com/cockroachdb/examples-python/tree/master/flask-sqlalchemy).

## Before you begin

1. Create a [CockroachDB {{ site.data.products.cloud }}](https://cockroachlabs.cloud/signup?referralId={{page.referral_id}}) account and log in.

1. [Create a CockroachDB {{ site.data.products.standard }} cluster]({% link "cockroachcloud/create-your-cluster.md" %}) for the sample To-Do app.

1. On your local system, be sure the following tools are installed:

    Tool | Purpose
    -----|--------
    [pip](https://pip.pypa.io/en/stable/installation/) | You'll need pip to install SQLAlchemy and a CockroachDB Python package that accounts for some differences between CockroachDB and PostgreSQL.
    [Docker](https://docs.docker.com/v17.12/docker-for-mac/install/) | You'll dockerize your application for running in Kubernetes.
    [minikube](https://kubernetes.io/docs/tasks/tools/install-minikube/) | This is the tool you'll use to run Kubernetes locally, for your OS. This includes installing a hypervisor and `kubectl`, the command-line tool used to manage Kubernetes from your local workstation.

## Prepare your cluster

Follow the steps in this section to prepare your cluster for the example To-DO app.

### Step 1. Authorize your local workstation's network

Before you can connect to your CockroachDB {{ site.data.products.standard }} cluster, you need to authorize your network by adding the public IP address of the workstation to the [allowlist]({% link "cockroachcloud/network-authorization.md" %}#ip-allowlisting). Otherwise, connections from this workstation will be rejected.

1. In the left navigation bar of the CockroachDB {{ site.data.products.cloud }} Console, click **Networking**.
1. Click **Add Network**. The **Add Network** dialog displays.
1. (Optional) Enter a descriptive name for the network.
1. From the **Network** selector, choose **Current Network**. Your local machine's IP address will be auto-populated in the box.
1. Select both **DB Console to monitor the cluster** and **CockroachDB Client to access the databases**. The first option allows connections from this IP to the cluster's [DB Console]({% link "{{site.current_cloud_version}}/ui-overview.md" %}), where you can observe your cluster's health and performance. The second option allows SQL clients to connect from this IP.
1. Click **Apply**.

### Step 2. Create a SQL user

{% include "cockroachcloud/cockroachcloud-ask-admin.md" %}

To connect from a SQL client, your cluster must have at least one SQL user. To create a SQL user:

1. In the left navigation bar, click **SQL Users**.
1. Click **Add User**. The **Add User** dialog displays.
1. Enter a username and click **Generate & Save Password**.
1. Copy the generated password to a secure location, such as a password manager.
1. Click **Close**.

    Currently, all new SQL users are created with admin privileges. For more information and to change the default settings, see [Managing SQL users on a cluster]({% link "cockroachcloud/managing-access.md" %}#manage-sql-users-on-a-cluster).

### Step 3. Find the cluster's connection details

In this step, you find the connection details that allow both your application and your local system to connect to the cluster.

1. In the top right corner of the CockroachDB {{ site.data.products.cloud }} Console, click the **Connect** button.

    The **Setup** page of the **Connect to cluster** dialog displays.
1. Select the **SQL User** you created in [Step 2. Create a SQL user](#step-2-create-a-sql-user).
1. For **Database**, select `defaultdb`. You will change this after you follow the instructions in [Step 4. Create the database](#step-4-create-the-database).
1. Click **Next**.

    The **Connect** page of the **Connection info** dialog displays.

1. Select the **Command Line** tab to find the details you can use to connect from your local workstation's terminal.
1. If CockroachDB is not installed locally, copy the command to download and install it. In your terminal, run the command.
1. Copy the `cockroach sql` command. In the command, add a `:` character after the username and before the `@` character, then paste the password for the SQL user you created earlier. To connect to your cluster from the command line, you can run this command.
1. Select the **Connection string** tab to find the details you can use to connect from your application.
1. If the CA certificate for the cluster is not downloaded locally, copy the command to download it. In your terminal, run the command.
1. Copy the connection string, which begins with `postgresql://`. You will add this string to the example To-Do app so that it can connect to your cluster. In the string, add a `:` character after the username and before the `@` character, then paste the password for the SQL user you created earlier.
1. Click **Close**.

### Step 4. Create the database

On your local workstation's terminal:

    <div class="filters clearfix">
      <button style="width: 15%" class="filter-button" data-scope="mac">Mac</button>
      <button style="width: 15%" class="filter-button" data-scope="linux">Linux</button>
      <button style="width: 15%" class="filter-button" data-scope="windows">Windows</button>
    </div>
    <p></p>

1. Use the **Command Line** `cockroach sql` command to connect to the cluster from a terminal:

    {% include "cockroachcloud/sql-connection-string.md" %}

1. After connecting to the cluster, create a database named `todos`:

    {% include "copy-clipboard.html" %}
    ~~~ sql
    > CREATE DATABASE todos;
    ~~~

1. Select the `todos` database:

    {% include "copy-clipboard.html" %}
    ~~~ sql
    > USE todos;
    ~~~

1. Create a table `todos` with the following schema:

    {% include "copy-clipboard.html" %}
    ~~~ sql
    > CREATE TABLE todos (
    	todo_id INT8 NOT NULL DEFAULT unique_rowid(),
    	title VARCHAR(60) NULL,
    	text VARCHAR NULL,
    	done BOOL NULL,
    	pub_date TIMESTAMP NULL,
    	CONSTRAINT "primary" PRIMARY KEY (todo_id ASC),
    	FAMILY "primary" (todo_id, title, text, done, pub_date)
      );
    ~~~

## Build the app

- [Step 1. Configure the sample Python app](#step-1-configure-the-sample-python-app)
- [Step 2. Test the application locally](#step-2-test-the-application-locally)

### Step 1. Configure the sample Python app

In a new terminal:

1. Clone the `examples-python` repository to your local machine:

    {% include "copy-clipboard.html" %}
    ~~~ shell
    $ git clone https://github.com/cockroachdb/examples-python
    ~~~

1. Navigate to the `flask-alchemy` folder:

    {% include "copy-clipboard.html" %}
    ~~~ shell
    $ cd examples-python/flask-sqlalchemy
    ~~~

1. In the `hello.cfg` file, replace the value for the `SQLALCHEMY_DATABASE_URI` with the application connection string you generated in [Step 3. Find the cluster's connection details](#step-3-find-the-clusters-connection-details). Replace `defaultdb` with `todos` to connect to the `todos` database. Save the file.

    {% include "copy-clipboard.html" %}
    ~~~
    SQLALCHEMY_DATABASE_URI = 'cockroachdb://{username}:{password}@{host}:26257/todos?sslmode=verify-full&sslrootcert=$Home/Library/CockroachCloud/certs/{cluster-name}-ca.crt'
    ~~~

    {{site.data.alerts.callout_info}}
    You must use the `cockroachdb://` prefix in the URL passed to [`sqlalchemy.create_engine`](https://docs.sqlalchemy.org/core/engines.html#sqlalchemy.create_engine) to make sure the [`cockroachdb`](https://github.com/cockroachdb/sqlalchemy-cockroachdb) dialect is used. Using the `postgres://` URL prefix to connect to your CockroachDB cluster will not work.
    {{site.data.alerts.end}}

    Copy the application connection string to an accessible location since you need it to configure the sample application in the next step.

### Step 2. Test the application locally

1. Install the following Python packages to satisfy the example app's dependencies. The `sqlalchemy-cockroachdb` package accounts for some differences between CockroachDB and PostgreSQL:

    {% include "copy-clipboard.html" %}
    ~~~ shell
    $ pip install flask sqlalchemy sqlalchemy-cockroachdb Flask-SQLAlchemy
    ~~~

    For other ways to install SQLAlchemy, see the [official documentation](http://docs.sqlalchemy.org/intro.html#installation-guide).

1. Run the `hello.py` code:

    {% include "copy-clipboard.html" %}
    ~~~ shell
    $ python hello.py
    ~~~

    The application should run at `http://localhost:5000`.

1. Enter a new to-do item.

1. Verify that the user interface reflects the new to-do item added to the database.

1. Use `Ctrl+C` to stop the application.

## Deploy the app

These steps show how to deploy your app locally using Kubernetes.

### Step 1. Start a local Kubernetes cluster

On your local workstation's terminal:

{% include "copy-clipboard.html" %}
~~~ shell
$ minikube start
~~~

The startup procedure might take a few minutes.

### Step 2. Create a Kubernetes secret

Create a Kubernetes secret to store the CA certificate you downloaded earlier:

{% include "copy-clipboard.html" %}
~~~ shell
$ kubectl create secret generic <username>-secret \
  --from-file $Home/Library/CockroachCloud/certs/<cluster-name>-ca.crt
~~~

Verify the Kubernetes secret was created:

{% include "copy-clipboard.html" %}
~~~ shell
$ kubectl get secrets
~~~

~~~ shell
NAME                  TYPE                                  DATA   AGE
default-token-875zk   kubernetes.io/service-account-token   3      75s
<username>-secret       Opaque                                1      10s
~~~

### Step 3. Change certificate directory path in configuration file

In the `hello.cfg` file in the `flask-alchemy` folder, replace the certificate directory path from the default location to `/data/certs` and save the file.

{% include "copy-clipboard.html" %}
~~~
SQLALCHEMY_DATABASE_URI = 'cockroachdb://<username>@<host>:26257/todos?sslmode=verify-full&sslrootcert=$Home/Library/CockroachCloud/certs/<cluster-name>-ca.crt'
~~~

### Step 4. Create a container with the application

1. In the `flask-sqlalchemy` folder, create a file named `Dockerfile` with the following contents:

    {% include "copy-clipboard.html" %}
    ~~~
    FROM python:3.7-slim

    WORKDIR /app

    ADD . /app

    RUN apt-get update && apt-get install -y libpq-dev gcc
    # need gcc to compile psycopg2
    RUN pip3 install psycopg2~=2.6
    RUN apt-get autoremove -y gcc
    RUN pip install --trusted-host pypi.python.org -r requirements.txt

    EXPOSE 80

    CMD ["python", "hello.py"]
    ~~~

1. Set the environment variable:

    {% include "copy-clipboard.html" %}
    ~~~ shell
    $ eval $(minikube docker-env)
    ~~~

1. Create the Docker image:

    {% include "copy-clipboard.html" %}
    ~~~ shell
    $ docker build -t appdocker .
    ~~~

1. Verify the image was created:

    {% include "copy-clipboard.html" %}
    ~~~ shell
    $ docker image ls
    ~~~

    ~~~
    REPOSITORY         TAG             IMAGE ID            CREATED             SIZE
    appdocker          latest          cfb155afed03        3 seconds ago       299MB
    ~~~

### Step 5. Deploy the application

1. In the `flask-alchemy` folder, create a file named `app-deployment.yaml` and copy the following code into the file. Replace the `{username}` placeholder with the SQL user's username that you created [while preparing the cluster](#step-2-create-a-sql-user):

    {% include "copy-clipboard.html" %}
    ~~~
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: appdeploy
      labels:
        app: flask
    spec:
      selector:
        matchLabels:
          app: flask
      replicas: 3
      strategy:
        type: RollingUpdate
      template:
        metadata:
          labels:
            app: flask
        spec:
          containers:
          - name: appdeploy
            image: appdocker
            imagePullPolicy: Never
            ports:
            - containerPort: 80
            volumeMounts:
            - mountPath: "/data/certs"
              name: ca-certs
              readOnly: true
          volumes:
          - name: ca-certs
            secret:
              secretName: {username}-secret
    ---
    apiVersion: v1
    kind: Service
    metadata:
      name: appdeploy
      labels:
        app: flask
    spec:
      ports:
      - port: 80
        protocol: TCP
        name: flask
      selector:
        app: flask
      type: LoadBalancer
    ~~~

1. Create the deployment with `kubectl`:

    {% include "copy-clipboard.html" %}
    ~~~ shell
    $ kubectl apply -f app-deployment.yaml
    ~~~

    ~~~
    deployment.apps/appdeploy created
    service/appdeploy created
    ~~~

1. Verify that the deployment is ready and the load balancer service is pending:

    {% include "copy-clipboard.html" %}
    ~~~ shell
    $ kubectl get deployments
    ~~~

    ~~~
    NAME           READY   UP-TO-DATE   AVAILABLE   AGE
    appdeploy      3/3     3            3           27s
    ~~~

    {% include "copy-clipboard.html" %}
    ~~~ shell
    $ kubectl get services
    ~~~

    ~~~
    NAME         TYPE           CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
    appdeploy    LoadBalancer   10.96.154.104   <pending>     80:32349/TCP   42s
    ~~~

1. Start the app:

    {% include "copy-clipboard.html" %}
    ~~~ shell
    $ minikube service appdeploy
    ~~~

    The application will open in the browser. If you get a `refused to connect` message, use port-forwarding to reach the application:

    1. Get the name of one of the pods:

        {% include "copy-clipboard.html" %}
        ~~~ shell
        $ kubectl get pods
        ~~~

        ~~~
        NAME                         READY   STATUS              RESTARTS   AGE
        appdeploy-577f66b4c8-46s5r   0/1     ErrImageNeverPull   0          23m
        appdeploy-577f66b4c8-9chjx   0/1     ErrImageNeverPull   0          23m
        appdeploy-577f66b4c8-cnhrg   0/1     ErrImageNeverPull   0          23m
        ~~~

    1. Port-forward from your local machine to one of the pods:

        {% include "copy-clipboard.html" %}
        ~~~ shell
        $ kubectl port-forward appdeploy-5f5868f6bf-2cjt5 5000:5000
        ~~~

        ~~~
        Forwarding from 127.0.0.1:5000 -> 5000
        Forwarding from [::1]:5000 -> 5000
        ~~~

    1. Go to `http://localhost:5000/` in your browser.

## Monitor the app

- [Step 1. Access the DB Console](#step-1-access-the-db-console)
- [Step 2. Monitor cluster health, metrics, and SQL statements](#step-2-monitor-cluster-health-metrics-and-sql-statements)

### Step 1. Access the DB Console

1. On the Console, navigate to the cluster's **Tools** page and click **Open DB Console**.

    You can also access the DB Console by navigating to `https://{cluster-name}crdb.io:8080/#/metrics/overview/cluster`. Replace `<cluster-name>` with the name of your cluster.

1. Enter the SQL user's username and password you created while [preparing the cluster](#step-2-create-a-sql-user).

    {% include "cockroachcloud/postgresql-special-characters.md" %}

1. Click **Log In**.

### Step 2. Monitor cluster health, metrics, and SQL statements

On the [**Cluster Overview** page]({% link "{{site.current_cloud_version}}/ui-cluster-overview-page.md" %}), view essential metrics about the cluster's health:

- Number of live, dead, and suspect nodes
- Number of unavailable and under-replicated ranges
- Queries per second
- Service latency across the cluster

#### Monitor the hardware metrics

1. Click **Metrics** on the left, and then select **Dashboard > Hardware**.
1. On the [**Hardware** dashboard]({% link "{{site.current_cloud_version}}/ui-hardware-dashboard.md" %}), view metrics about CPU usage, disk throughput, network traffic, storage capacity, and memory.

#### Monitor inter-node latencies

1. Click **Network Latency** in the left-hand navigation to check latencies between all nodes in your cluster.

#### Identify frequently executed or high latency SQL statements

1. Click **Statements** on the left.
1. The [**Statements** page]({% link "{{site.current_cloud_version}}/ui-statements-page.md" %}) helps you identify frequently executed or high latency SQL statements. The **Statements** page also allows you to view the details of an individual SQL statement by clicking on the statement to view the **Statement Details** page.
