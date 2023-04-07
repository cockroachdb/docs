---
title: Deploy a Python To-Do App with Flask, Kubernetes, and CockroachDB Cloud
summary: Learn how to deploy a sample Python web app with Flask, Kubernetes, and CockroachDB Cloud
toc: true
toc_not_nested: true
docs_area:
---

This tutorial shows you how to run a sample To-Do app in [Kubernetes](https://kubernetes.io/) with {{ site.data.products.dedicated }} as the datastore. The app is written in Python with Flask as the web framework and SQLAlchemy for working with SQL data, and the code is [open-source and forkable](https://github.com/cockroachdb/examples-python/tree/master/flask-sqlalchemy).

## Before you begin

1. If you haven't already, <a href="https://cockroachlabs.cloud/signup?referralId=docs_cc_python_flask" rel="noopener" target="_blank">sign up for a {{ site.data.products.db }} account</a>.

1. Install the following tools, if you do not already have them:

    Tool | Purpose
    -----|--------
    [pip](https://pip.pypa.io/en/stable/installing/) | You'll need pip to install SQLAlchemy and a CockroachDB Python package that accounts for some differences between CockroachDB and PostgreSQL.
    [Docker](https://docs.docker.com/v17.12/docker-for-mac/install/) | You'll dockerize your application for running in Kubernetes.
    [minikube](https://kubernetes.io/docs/tasks/tools/install-minikube/) | This is the tool you'll use to run Kubernetes locally, for your OS. This includes installing a hypervisor and `kubectl`, the command-line tool used to manage Kubernetes from your local workstation.

1. If you haven't already, [create a {{ site.data.products.dedicated }} cluster](create-your-cluster.html).

## Prepare your cluster

- [Step 1. Authorize your local workstation's network](#step-1-authorize-your-local-workstations-network)
- [Step 2. Create a SQL user](#step-2-create-a-sql-user)
- [Step 3. Generate the CockroachDB client connection string](#step-3-generate-the-cockroachdb-client-connection-string)
- [Step 4. Create the {{ site.data.products.dedicated }} database](#step-4-create-the-cockroachdb-cloud-database)
- [Step 5. Generate the application connection string](#step-5-generate-the-application-connection-string)

### Step 1. Authorize your local workstation's network

Before you connect to your {{ site.data.products.dedicated }} cluster, you need to authorize your network (i.e., add the public IP address of the workstation to the allowlist). Otherwise, connections from this workstation will be rejected.

Once you are [logged in](https://cockroachlabs.cloud/), you can use the Console to authorize your network:

1. In the left navigation bar, click **Networking**.
1. Click the **Add Network** button in the right corner. The **Add Network** dialog displays.
1. (Optional) Enter a descriptive name for the network.
1. From the **Network** dropdown, select **Current Network**. Your local machine's IP address will be auto-populated in the box.
1. Select both networks: **DB Console to monitor the cluster** and **CockroachDB Client to access the databases**.

    The **DB Console** refers to the cluster's DB Console, where you can observe your cluster's health and performance. For more information, see [DB Console Overview](../{{site.current_cloud_version}}/ui-overview.html).

1. Click **Apply**.

### Step 2. Create a SQL user

{% include cockroachcloud/cockroachcloud-ask-admin.md %}

1. Navigate to your cluster's **SQL Users** page.
1. Click the **Add User** button in the top right corner. The **Add User** dialog displays.
1. Enter a **Username** and **Password**.
1. Click **Save**.

    Currently, all new users are created with admin privileges. For more information and to change the default settings, see [Granting privileges](managing-access.html#grant-privileges) and [Using roles](managing-access.html#use-roles).

### Step 3. Generate the CockroachDB client connection string

1. In the top right corner of the Console, click the **Connect** button. The **Connection info** dialog displays.
1. From the **User** dropdown, select the user you created in [Step 2](#step-2-create-a-sql-user).
1. Select a **Region** to connect to.
1. From the **Database** dropdown, select `defaultdb`.
1. Run the following command to create a new `certs` directory on your local machine and download the CA certificate to that directory:
    <div class="filters clearfix">
      <button style="width: 15%" class="filter-button" data-scope="mac">Mac</button>
      <button style="width: 15%" class="filter-button" data-scope="linux">Linux</button>
      <button style="width: 15%" class="filter-button" data-scope="windows">Windows</button>
    </div>
    {% include cockroachcloud/download-the-cert.md %}

1. On the **Command Line** tab, copy the connection string.

    Edit the connection string to include your SQL user's password, then save the string in an accessible location since you'll need it to use the built-in SQL client later.

### Step 4. Create the {{ site.data.products.db }} database

On your local workstation's terminal:

1. If you haven't already, [Download the CockroachDB binary](../{{site.current_cloud_version}}/install-cockroachdb.html) and copy it into the `PATH`:

    <div class="filters clearfix">
      <button style="width: 15%" class="filter-button" data-scope="mac">Mac</button>
      <button style="width: 15%" class="filter-button" data-scope="linux">Linux</button>
      <button style="width: 15%" class="filter-button" data-scope="windows">Windows</button>
    </div>
    <p></p>

    {% include cockroachcloud/download-the-binary.md %}

1. Use the connection string generated in Step 3 to connect to CockroachDB's built-in SQL client:

    {% include cockroachcloud/sql-connection-string.md %}

1. Create a database `todos`:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE DATABASE todos;
    ~~~

1. Use database `todos`:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > USE todos;
    ~~~

1. Create a table `todos`:

    {% include_cached copy-clipboard.html %}
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

### Step 5. Generate the application connection string

  1. In the top right corner of the Console, click the **Connect** button.

      The **Connect** dialog displays.

  1. From the **User** dropdown, select the SQL user you created in [Step 2](#step-2-create-a-sql-user).
  1. Select a **Region** to connect to.
  1. From the **Database** dropdown, select `todos`.
  1. On the **Connection String** tab, click **Copy connection string**.

      Copy the application connection string to an accessible location. You will update the password and certificate path in the next step.

## Build the app

- [Step 1. Configure the sample Python app](#step-1-configure-the-sample-python-app)
- [Step 2. Test the application locally](#step-2-test-the-application-locally)

### Step 1. Configure the sample Python app

In a new terminal:

1. Clone the `examples-python` repository to your local machine:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ git clone https://github.com/cockroachdb/examples-python
    ~~~

1. Navigate to the `flask-alchemy` folder:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cd examples-python/flask-sqlalchemy
    ~~~

1. In the `hello.cfg` file, replace the value for the `SQLALCHEMY_DATABASE_URI` with the application connection string you generated in [Step 5. Generate the application connection string](#step-5-generate-the-application-connection-string) and save the file.

    {% include_cached copy-clipboard.html %}
    ~~~
    SQLALCHEMY_DATABASE_URI = 'cockroachdb://<username>@<host>:26257/todos?sslmode=verify-full&sslrootcert=$Home/Library/CockroachCloud/certs/<cluster-name>-ca.crt'
    ~~~

    {{site.data.alerts.callout_info}}
    You must use the `cockroachdb://` prefix in the URL passed to [`sqlalchemy.create_engine`](https://docs.sqlalchemy.org/en/latest/core/engines.html?highlight=create_engine#sqlalchemy.create_engine) to make sure the [`cockroachdb`](https://github.com/cockroachdb/sqlalchemy-cockroachdb) dialect is used. Using the `postgres://` URL prefix to connect to your CockroachDB cluster will not work.
    {{site.data.alerts.end}}

    Copy the application connection string to an accessible location since you need it to configure the sample application in the next step.

### Step 2. Test the application locally

1. Install SQLAlchemy, as well as a CockroachDB Python package that accounts for some differences between CockroachDB and PostgreSQL:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ pip install flask sqlalchemy sqlalchemy-cockroachdb Flask-SQLAlchemy
    ~~~

    For other ways to install SQLAlchemy, see the [official documentation](http://docs.sqlalchemy.org/en/latest/intro.html#installation-guide).

1. Run the `hello.py` code:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ python hello.py
    ~~~

    The application should run at `http://localhost:5000`.

1. Enter a new to-do item.

1. Verify that the user interface reflects the new to-do item added to the database.

1. Use `Ctrl+C` to stop the application.

## Deploy the app

{{site.data.alerts.callout_info}}
These steps focus on deploying your app locally. For production Kubernetes deployments, use a service like GKE.
{{site.data.alerts.end}}

- [Step 1. Start a local Kubernetes cluster](#step-1-start-a-local-kubernetes-cluster)
- [Step 2. Create a Kubernetes secret](#step-2-create-a-kubernetes-secret)
- [Step 3. Change certificate directory path in configuration file](#step-3-change-certificate-directory-path-in-configuration-file)
- [Step 4. Dockerize the application](#step-4-dockerize-the-application)
- [Step 5. Deploy the application](#step-5-deploy-the-application)

### Step 1. Start a local Kubernetes cluster

On your local workstation's terminal:

{% include_cached copy-clipboard.html %}
~~~ shell
$ minikube start
~~~

The startup procedure might take a few minutes.

### Step 2. Create a Kubernetes secret

Create a Kubernetes secret to store the CA certificate you downloaded earlier:

{% include_cached copy-clipboard.html %}
~~~ shell
$ kubectl create secret generic <username>-secret --from-file $Home/Library/CockroachCloud/certs/<cluster-name>-ca.crt
~~~

Verify the Kubernetes secret was created:

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
~~~
SQLALCHEMY_DATABASE_URI = 'cockroachdb://<username>@<host>:26257/todos?sslmode=verify-full&sslrootcert=$Home/Library/CockroachCloud/certs/<cluster-name>-ca.crt'
~~~

{{site.data.alerts.callout_info}}
You must use the `cockroachdb://` prefix in the URL passed to [`sqlalchemy.create_engine`](https://docs.sqlalchemy.org/en/latest/core/engines.html?highlight=create_engine#sqlalchemy.create_engine) to make sure the [`cockroachdb`](https://github.com/cockroachdb/sqlalchemy-cockroachdb) dialect is used. Using the `postgres://` URL prefix to connect to your CockroachDB cluster will not work.
{{site.data.alerts.end}}

### Step 4. Dockerize the application

1. In the `flask-sqlalchemy` folder, create a file named `Dockerfile` and copy the following code into the file:

    {% include_cached copy-clipboard.html %}
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

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ eval $(minikube docker-env)
    ~~~

1. Create the Docker image:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ docker build -t appdocker .
    ~~~

1. Verify the image was created:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ docker image ls
    ~~~

    ~~~
    REPOSITORY         TAG             IMAGE ID            CREATED             SIZE
    appdocker          latest          cfb155afed03        3 seconds ago       299MB
    ~~~

### Step 5. Deploy the application

1. In the `flask-alchemy` folder, create a file named `app-deployment.yaml` and copy the following code into the file. Replace the `<username>` placeholder with the SQL user's username that you created  [while preparing the cluster](#step-2-create-a-sql-user):

    {% include_cached copy-clipboard.html %}
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
              secretName: <username>-secret
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

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl apply -f app-deployment.yaml
    ~~~

    ~~~
    deployment.apps/appdeploy created
    service/appdeploy created
    ~~~

1. Verify that the deployment and server were created:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get deployments
    ~~~

    ~~~
    NAME           READY   UP-TO-DATE   AVAILABLE   AGE
    appdeploy      3/3     3            3           27s
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get services
    ~~~

    ~~~
    NAME         TYPE           CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
    appdeploy    LoadBalancer   10.96.154.104   <pending>     80:32349/TCP   42s
    ~~~

1. Start the app:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ minikube service appdeploy
    ~~~

    The application will open in the browser. If you get a `refused to connect` message, use port-forwarding to reach the application:

    1. Get the name of one of the pods:

        {% include_cached copy-clipboard.html %}
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

        {% include_cached copy-clipboard.html %}
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

    You can also access the DB Console by navigating to `https://<cluster-name>crdb.io:8080/#/metrics/overview/cluster`. Replace the `<cluster-name>` placeholder with the name of your cluster.

1. Enter the SQL user's username and password you created while [preparing the cluster](#step-2-create-a-sql-user).

    {% include cockroachcloud/postgresql-special-characters.md %}

1. Click **Log In**.

### Step 2. Monitor cluster health, metrics, and SQL statements

On the [**Cluster Overview** page](../{{site.current_cloud_version}}/ui-cluster-overview-page.html), view essential metrics about the cluster's health:

- Number of live, dead, and suspect nodes
- Number of unavailable and under-replicated ranges
- Queries per second
- Service latency across the cluster

#### Monitor the hardware metrics

1. Click **Metrics** on the left, and then select **Dashboard > Hardware**.
1. On the [**Hardware** dashboard](../{{site.current_cloud_version}}/ui-hardware-dashboard.html), view metrics about CPU usage, disk throughput, network traffic, storage capacity, and memory.

#### Monitor inter-node latencies

1. Click **Network Latency** in the left-hand navigation to check latencies between all nodes in your cluster.

#### Identify frequently executed or high latency SQL statements

1. Click **Statements** on the left.
1. The [**Statements** page](../{{site.current_cloud_version}}/ui-statements-page.html) helps you identify frequently executed or high latency SQL statements. The **Statements** page also allows you to view the details of an individual SQL statement by clicking on the statement to view the **Statement Details** page.
