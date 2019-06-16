---
title: Dockerize your Managed CockroachDB app
summary: Learn how to build an application with Managed CockroachDB and orchestrate it using Kubernetes.
toc: true
build_for: [managed]
---

## Before your begin

1. Follow Docker's [documentation](https://docs.docker.com/v17.12/docker-for-mac/install/) to install Docker.
2. Build the sample Python application:

    This tutorial uses the [sample To-Do app](https://github.com/cockroachdb/examples-python/tree/master/flask-sqlalchemy) application with Managed CockroachDB using [SQLAlchemy](https://docs.sqlalchemy.org/en/latest/). Refer to the [Build a Python app with Managed CockroachDB](managed-build-a-python-app.html) tutorial to build the sample application.

## Create a Docker image for the application

1. In the `flask-python` folder you created while [building the python application](managed-build-a-python-app.html), create the file names `dockerfile` and copy the following code into the file:

    {% include copy-clipboard.html %}
    ~~~
    FROM python:3.7-slim

    WORKDIR /app

    ADD . /app

    RUN apt-get update && apt-get install -y libpq-dev gcc

    RUN pip3 install psycopg2~=2.6
    RUN apt-get autoremove -y gcc
    RUN pip install --trusted-host pypi.python.org -r requirements.txt


    EXPOSE 80

    CMD ["python", "hello.py"]

    ~~~

2. Create the Docker image:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ docker build -t appdocker .
    ~~~

3. Verify the image was created:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ docker image ls
    ~~~

4. Create a Docker container:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ docker run -d -p 5000:80 appdocker
    ~~~

5. Verify the application is running in the Docker container:

    Check [http://localhost:5000/](http://localhost:5000/)
