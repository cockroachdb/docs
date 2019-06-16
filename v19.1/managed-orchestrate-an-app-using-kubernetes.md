---
title: Orchestrate an application with Kubernetes
summary: Learn how to build an application with Managed CockroachDB and orchestrate it using Kubernetes.
toc: true
build_for: [managed]
---

On top of Managed CockroachDB's built-in automation, you can use a third-party [orchestration](orchestration.html) system to simplify and automate even more of your operations, from deployment to scaling to overall cluster management. This page walks you through a simple demonstration, using the open-source [Kubernetes](http://kubernetes.io/) orchestration system.

## Before your begin

1. Follow Docker's [documentation](https://docs.docker.com/v17.12/docker-for-mac/install/) to install Docker.
2. Follow Kubernetes' [documentation](https://kubernetes.io/docs/tasks/tools/install-minikube/) to install `minikube`, the tool used to run Kubernetes locally, for your OS. This includes installing a hypervisor and `kubectl`, the command-line tool used to managed Kubernetes from your local workstation.

    {{site.data.alerts.callout_info}}Make sure you install <code>minikube</code> version 0.21.0 or later. Earlier versions do not include a Kubernetes server that supports the <code>maxUnavailability</code> field and <code>PodDisruptionBudget</code> resource type used in the CockroachDB StatefulSet configuration.{{site.data.alerts.end}}

3. Build the sample Python application:

    This tutorial uses the [sample To-Do app](https://github.com/cockroachdb/examples-python/tree/master/flask-sqlalchemy) application with Managed CockroachDB using [SQLAlchemy](https://docs.sqlalchemy.org/en/latest/). Refer to the [Build a Python app with Managed CockroachDB](managed-build-a-python-app.html) tutorial to build the sample application.

## Step 1: Start a local Kubernetes cluster

{% include copy-clipboard.html %}
~~~ shell
$ minikube start
~~~

## Step 2: Dockerize your application

1. In the `flask-python` folder you created while [building the python application](managed-build-a-python-app.html), create the file names `dockerfile` and copy the following code into the file:

    {% include copy-clipboard.html %}
    ~~~
    # this is an official Python runtime, used as the parent image
    FROM python:3.7-slim

    # set the working directory in the container to /app
    WORKDIR /app

    # add the current directory to the container as /app
    ADD . /app

    # execute everyone's favorite pip command, pip install -r
    RUN apt-get update && apt-get install -y libpq-dev gcc
    # need gcc to compile psycopg2
    RUN pip3 install psycopg2~=2.6
    RUN apt-get autoremove -y gcc
    RUN pip install --trusted-host pypi.python.org -r requirements.txt


    # unblock port 80 for the Flask app to run on
    EXPOSE 80

    # execute the Flask app
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

## Step 4: Create a Kubernetes secret

{% include copy-clipboard.html %}
~~~ shell
$ kubectl create secret generic maxroach-secret --from-file <absolute path to the CA certificate>
~~~

## Step 5: Create the deployment files

Create a file `app-deployment.yaml` and copy the following code into the file:

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

## Step 6: Run the `kubectl` commands

{% include copy-clipboard.html %}
~~~ shell
$ kubectl apply -f app-deployment.yaml
~~~

## Step 7: Verify the Kubernetes deployment

{% include copy-clipboard.html %}
~~~ shell
$ kubectl get pods
~~~

{% include copy-clipboard.html %}
~~~ shell
$ kubectl get deployments
~~~

{% include copy-clipboard.html %}
~~~ shell
$ kubectl get services
~~~

{% include copy-clipboard.html %}
~~~ shell
$ minikube service appdeploy
~~~
