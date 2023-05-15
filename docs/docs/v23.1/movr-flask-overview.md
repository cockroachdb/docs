---
title: Develop and Deploy a Global Application
summary: Learn how to build and deploy an application built on CockroachDB, using Flask, SQLAlchemy, CockroachDB Cloud, and Google Cloud services.
toc: true
docs_area: develop
---

This tutorial guides you through developing and deploying a global application built on CockroachDB, using Flask, SQLAlchemy, {{ site.data.products.db }}, and [Google Cloud](https://cloud.google.com/) services.

The following sections make up the tutorial:

1. [MovR: A Global Application Use-case](movr-flask-use-case.html)
1. [Create a Multi-region Database Schema](movr-flask-database.html)
1. [Set up a Virtual Environment for Developing Global Applications](movr-flask-setup.html)
1. [Develop a Global Application](movr-flask-application.html)
1. [Deploy a Global Application](movr-flask-deployment.html)

Throughout the tutorial, we reference the source code for an example web application for the fictional vehicle-sharing company [MovR](movr.html). The source code for this application is open source and available on GitHub, in the [`movr-flask` repository ](https://github.com/cockroachlabs/movr-flask). The code is well-commented, with docstrings defined at the beginning of each class and function definition.

The repo's [README](https://github.com/cockroachlabs/movr-flask/blob/master/README.md) also includes instructions on debugging and deploying the application using Google Cloud services. Those instructions are reproduced in [Set Up a Virtual Environment for Developing Global Applications](movr-flask-setup.html) and [Deploy a Global Application](movr-flask-deployment.html).

<!-- {% include {{ page.version.version }}/misc/movr-live-demo.md %} -->
