---
title: Third-Party Monitoring & Alerting
summary: Learn how you can set up third-party software to monitor your CockroachDB cluster.
toc: false
sidebar_data: sidebar-data-training.json
---

<div id="toc"></div>

## Presentation

<iframe src="https://docs.google.com/presentation/d/e/2PACX-1vSI2ZKhtfhFeLuCNesbWfpIvdGelYwDmASsbLi7cl3WnVkIfWvICwBHWL2XVUddk7JFas_4MgMiaE6_/embed?start=false&loop=false" frameborder="0" width="756" height="454" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>

## Lab

In this lab, we'll take a quick look at the Prometheus file Cockroach Labs provides. If you use Prometheus, you can use this file to integrate CockroachDB; if not, you can use it as a template for whatever monitoring service you prefer.

### Step 1. Find the CockroachDB monitoring templates

1. Go to [https://github.com/cockroachdb/cockroach/tree/master/monitoring](https://github.com/cockroachdb/cockroach/tree/master/monitoring).

2. Open `prometheus.yml` and `alerts/alerts.rules`.

### Step 2. Examine the files

Check out both of these files and see if you can align their structure with the values you expect to work with your monitoring service. If not, ask the instructor to discuss how you can integrate CockroachDB monitoring with your preferred tools.

### (Optional) 3. Set up monitoring

If you're interested, we have a walkthrough to [configure Prometheus, Grafana, and AlertManager with your CockroachDB cluster](https://www.cockroachlabs.com/docs/stable/monitor-cockroachdb-with-prometheus.html).

## What's Next?

- [Logs & Common Troubleshooting](logs.html)
