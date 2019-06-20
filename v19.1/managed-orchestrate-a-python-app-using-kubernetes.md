---
title: Build a Python application with Kubernetes on Managed CockroachDB
summary: Learn how to build a Python application with Managed CockroachDB and orchestrate it using Kubernetes.
toc: true
build_for: [managed]
---

This tutorial shows you how build a [sample To-Do app](https://github.com/cockroachdb/examples-python/tree/master/flask-sqlalchemy) application on your local workstation with Managed CockroachDB using [SQLAlchemy](https://docs.sqlalchemy.org/en/latest/) and the [Kubernetes](http://kubernetes.io/) orchestration system.

## Before your begin

1. Follow Docker's [documentation](https://docs.docker.com/v17.12/docker-for-mac/install/) to install Docker.
2. Follow Kubernetes' [documentation](https://kubernetes.io/docs/tasks/tools/install-minikube/) to install `minikube`, the tool used to run Kubernetes locally, for your OS. This includes installing a hypervisor and `kubectl`, the command-line tool used to managed Kubernetes from your local workstation.

    {{site.data.alerts.callout_info}}Make sure you install <code>minikube</code> version 0.21.0 or later. Earlier versions do not include a Kubernetes server that supports the <code>maxUnavailability</code> field and <code>PodDisruptionBudget</code> resource type used in the CockroachDB StatefulSet configuration.{{site.data.alerts.end}}

## Build a Python application with Managed CockroachDB

### Step 1. Authorize your local workstation's network

Before you connect to your Managed CockroachDB cluster, you need to authorize your network (i.e., whitelist the public IP address of the workstation). Otherwise, connections from this workstation will be rejected.

Once you are [logged in](managed-sign-up-for-a-cluster.html#sign-in), you can use the Console to authorize your network:

1. Navigate to your cluster's [Networking](managed-networking-page.html) page.
2. Click the **Add Network** button in the top right corner.

    The **Add Network** modal displays.

    <img src="{{ 'images/v19.1/managed/add-network-modal.png' | relative_url }}" alt="Add network" style="border:1px solid #eee;max-width:100%" />

3. Enter the public IPv4 address of your local workstation in the **Network** field.

    You can use `0.0.0.0/0`, which allows all networks. Use this with caution; anybody who uses your password will be able to access the database, and your cluster will be more exposed if there's ever a security bug. The firewall is an extra layer of defense.

    {{site.data.alerts.callout_success}}
    IPv6 addresses are currently not supported.
    {{site.data.alerts.end}}

4. Select what the network can connect to: the cluster's **UI**, **SQL** client, or both.

    The **UI** refers to the cluster's Admin UI, where you can observe your cluster's health and performance. For more information, see [Admin UI Overview](admin-ui-overview.html).

5. Click **Save**.

### Step 2. Create a SQL user

1. Navigate to your cluster's **SQL Users** page.
2. Click the **Add User** button in the top right corner.

    The **Add User** modal displays.

    <img src="{{ 'images/v19.1/managed/add-user-modal.png' | relative_url }}" alt="Add user" style="border:1px solid #eee;max-width:100%" />

3. In the **Username** field, enter `maxroach`.
4. In the **Password** field, enter `Q7gc8rEdS`.
5. Click **Create**.

    Currently, all new users are created with admin privileges. For more information and to change the default settings, see [Granting privileges](managed-authorization.html#granting-privileges) and [Using roles](managed-authorization.html#using-roles).

### Step 3. Generate the CockroachDB client connection string

1. In the top right corner of the Console, click the **Connect** button.

    The **Connect** modal displays.

    <img src="{{ 'images/v19.1/managed/connect-modal.png' | relative_url }}" alt="Connect to cluster" style="border:1px solid #eee;max-width:100%" />

3. From the **User** dropdown, select `maxroach`.
4. Select a **Region** to connect to.
5. From the **Database** dropdown, select `defaultdb`.
6. On the **Connect from Shell** tab, click **Copy connection string**.

    Replace the `<certs_dir>` placeholders with the path to your `certs` directory. Copy the client connection string to an accessible location since you need it to use the built-in SQL client later.

7. Click the **Download ca.crt** button.
8. Create a `certs` directory on your local workstation and move the `ca.crt` file to the `certs` directory.

### Step 4. Create the Managed CockroachDB database

On your local workstation's terminal:

1. [Download the CockroachDB binary](install-cockroachdb.html):

    <div class="filters clearfix">
      <button style="width: 15%" class="filter-button" data-scope="mac">Mac</button>
      <button style="width: 15%" class="filter-button" data-scope="linux">Linux</button>
    </div>
    <p></p>

    <section class="filter-content" markdown="1" data-scope="mac">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ curl https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.darwin-10.9-amd64.tgz \
    | tar -xJ
    ~~~
    </section>

    <section class="filter-content" markdown="1" data-scope="linux">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ wget -qO- https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz \
    | tar  xvz
    ~~~
    </section>

2. Copy the binary into the `PATH` so it's easy to run the SQL client from any location:

    <section class="filter-content" markdown="1" data-scope="mac">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ cp -i cockroach-{{ page.release_info.version }}.darwin-10.9-amd64/cockroach /usr/local/bin
    ~~~
    </section>

    <section class="filter-content" markdown="1" data-scope="linux">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ sudo cp -i cockroach-{{ page.release_info.version }}.linux-amd64/cockroach /usr/local/bin
    ~~~
    </section>

3. Use the connection string generated in Step 3 to connect to CockroachDB's built-in SQL client:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --url 'postgres://maxroach@<region>.<cluster_name>:26257/defaultdb?sslmode=verify-full&sslrootcert=<certs_dir>/<ca.crt>'
    ~~~

4. Enter the password you created for `maxroach`:

    {% include copy-clipboard.html %}
    ~~~ shell
    Q7gc8rEdS
    ~~~

5. Create a database `todos`:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE DATABASE todos;
    ~~~

6. Use database `todos`:

    {% include copy-clipboard.html %}
    ~~~ sql
    > USE todos;
    ~~~

7. Create a table `todos`:

    {% include copy-clipboard.html %}
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

      The **Connect** modal displays.

        <img src="{{ 'images/v19.1/managed/connect-modal.png' | relative_url }}" alt="Connect to cluster" style="border:1px solid #eee;max-width:100%" />

  2. From the **User** dropdown, select `maxroach`.
  3. Select a **Region** to connect to.
  4. From the **Database** dropdown, select `todos`.
  5. On the **Connect Your App** tab, click **Copy connection string**.

      You will need to replace the `<password>` and `<certs_dir>` placeholders with your SQL username's password and the absolute path to your `certs` directory, respectively. Copy the application connection string to an accessible location since you need it to configure the sample application in the next step.

### Step 6. Configure the sample Python app

1. In a new terminal tab, install SQLAlchemy:

    To install SQLAlchemy, as well as a [CockroachDB Python package](https://github.com/cockroachdb/cockroachdb-python) that accounts for some differences between CockroachDB and PostgreSQL, run the following command in a new terminal window:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ pip install flask sqlalchemy cockroachdb Flask-SQLAlchemy
    ~~~

    For other ways to install SQLAlchemy, see the [official documentation](http://docs.sqlalchemy.org/en/latest/intro.html#installation-guide).

2. Clone the `examples-python` repository to your local machine:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ git clone https://github.com/cockroachdb/examples-python
    ~~~

3. Navigate to the flask-alchemy folder:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cd examples-python/flask-sqlalchemy
    ~~~

4. In the `hello.cfg` file, replace the value for the `SQLALCHEMY_DATABASE_URI` with the application connection string you generated in [Step 5. Generate the application connection string](#step-5-generate-the-application-connection-string) and save the file.

    {% include copy-clipboard.html %}
    ~~~
    SQLALCHEMY_DATABASE_URI = 'cockroachdb://maxroach:Q7gc8rEdS@<region>.<cluster_name>:26257/todos?sslmode=verify-full&sslrootcert=<absolute path to CA certificate>'
    ~~~

    {{site.data.alerts.callout_info}}
    You must use the `cockroachdb://` prefix in the URL passed to [`sqlalchemy.create_engine`](https://docs.sqlalchemy.org/en/latest/core/engines.html?highlight=create_engine#sqlalchemy.create_engine) to make sure the [`cockroachdb`](https://github.com/cockroachdb/cockroachdb-python") dialect is used. Using the `postgres://` URL prefix to connect to your CockroachDB cluster will not work.
    {{site.data.alerts.end}}

### Step 7. Test the application locally:

  1. Run the `hello.py` code:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ python hello.py
    ~~~

    The application should run at [http://localhost:5000](http://localhost:5000)

  2. Enter a new to-do item.

  3. Verify if the user interface reflects the new to-do item added to the database.

## Deploy the application to minikube

### Step 8. Start a local Kubernetes cluster

On your local workstation's terminal:

{% include copy-clipboard.html %}
~~~ shell
$ minikube start
~~~

### Step 9. Dockerize your application

1. In the `flask-python` folder you created in [Step 6. Configure the sample Python app](#step-6-configure-the-sample-python-app), create a file named `Dockerfile` and copy the following code into the file:

    {% include copy-clipboard.html %}
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

2. Set the environment variable:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ eval $(minikube docker-env)
    ~~~

3. Create the Docker image:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ docker build -t appdocker .
    ~~~

4. Verify the image was created:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ docker image ls
    ~~~

    Output:

    ~~~
    REPOSITORY         TAG             IMAGE ID            CREATED             SIZE
    appdocker          latest          cfb155afed03        3 seconds ago       299MB
    ~~~

### Step 10. Create a Kubernetes secret

Create a Kubernetes secret to store the CA certificate you downloaded in [Step 3. Generate the CockroachDB client connection string](#step-3-generate-the-cockroachdb-client-connection-string):

{% include copy-clipboard.html %}
~~~ shell
$ kubectl create secret generic maxroach-secret --from-file <absolute path to the CA certificate>
~~~

Verify the Kubernetes secret was created:

{% include copy-clipboard.html %}
~~~ shell
$ kubectl get secrets
~~~

Output:

~~~ shell
NAME                  TYPE                                  DATA   AGE
default-token-875zk   kubernetes.io/service-account-token   3      75s
maxroach-secret       Opaque                                1      10s
~~~

### Step 11. Create the deployment files

In the `flask-alchemy` folder, create a file `app-deployment.yaml` and copy the following code into the file:

{% include copy-clipboard.html %}
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
          secretName: maxroach-secret
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

### Step 12. Create the deployment with `kubectl`

Run the following `kubectl` command:

{% include copy-clipboard.html %}
~~~ shell
$ kubectl apply -f app-deployment.yaml
~~~

Output:

~~~ shell
deployment.apps/appdeploy created
service/appdeploy created
~~~

### Step 13. Verify the Kubernetes deployment

Run the following `kubectl` commands:

{% include copy-clipboard.html %}
~~~ shell
$ kubectl get deployments
~~~

Output:

~~~ shell
NAME           READY   UP-TO-DATE   AVAILABLE   AGE
appdeploy      3/3     3            3           27s
~~~

{% include copy-clipboard.html %}
~~~ shell
$ kubectl get services
~~~

Output:

~~~ shell
NAME         TYPE           CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
appdeploy    LoadBalancer   10.96.154.104   <pending>     80:32349/TCP   42s
~~~

{% include copy-clipboard.html %}
~~~ shell
$ minikube service appdeploy
~~~

The application will open in the browser.
