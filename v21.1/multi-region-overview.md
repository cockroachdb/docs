---
title: Develop and Deploy a Multi-Region Web Application
summary: Learn how to build and deploy a multi-region web application on CockroachDB, using Flask, SQLAlchemy, CockroachCloud, and Google Cloud services.
toc: true
---

This tutorial walks you through developing and deploying a multi-region web application built on CockroachDB, using Flask, SQLAlchemy, CockroachCloud, and Google Cloud Platform services.

The following sections make up the tutorial:

1. [MovR: An Example Multi-Region Use-Case](multi-region-use-case.html)
1. [Create a Multi-Region Database Schema](multi-region-database.html)
1. [Set Up a Virtual Environment for Developing Multi-Region Applications](multi-region-setup.html)
1. [Develop a Multi-Region Web Application](multi-region-application.html)
1. [Deploy a Multi-Region Web Application](multi-region-deployment.html)

Throughout the tutorial, we reference the source code for an example web application for the fictional vehicle-sharing company [MovR](movr.html). The source code for this application is open source and available on GitHub, in the [movr-flask repo](https://github.com/cockroachlabs/movr-flask). The code is well-commented, with docstrings defined at the beginning of each class and function definition. The repo's [README](https://github.com/cockroachlabs/movr-flask/blob/master/README.md) also includes instructions on debugging and deploying the application using Google Cloud services. Those instructions are reproduced in [Setting Up a Virtual Environment for Developing Multi-Region Applications](multi-region-setup.html) and [Deploying a Multi-Region Web Application](multi-region-deployment.html).

{% include {{ page.version.version }}/misc/movr-live-demo.md %}
