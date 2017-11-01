---
title: Third-Party Monitoring & Alerting
summary: Learn how you can set up third-party software to monitor your CockroachDB cluster.
toc: false
sidebar_data: sidebar-data-training.json
---

## Presentation

[Third-Party Monitoring & Alerting](https://docs.google.com/presentation/d/13KpWFSC30Ly5FKykbsgdRK7eIgA-jtIAt1EDUWbrYHs/edit)

## Lab

In this lab, we'll take a quick look at the Prometheus file Cockroach Labs provides. If you use Prometheus, you can use this file to integrate CockroachDB; if not, you can use it as a template for whatever monitoring service you prefer.

### Step 1. Find the CockroachDB Monitoring Templates

1. Go to [https://github.com/cockroachdb/cockroach/tree/master/monitoring](https://github.com/cockroachdb/cockroach/tree/master/monitoring).

2. Open `prometheus.yml` and `alerts/alerts.rules`.

### Step 2. Examine the Files

Check out both of these files and see if you can align their structure with the values you expect to work with your monitoring service.

### (Optional) 3. Set Up Monitoring

If you're interested, we have a walkthrough to [configure Prometheus, Grafana, and AlertManager with your CockroachDB cluster](https://www.cockroachlabs.com/docs/stable/monitor-cockroachdb-with-prometheus.html).

## Up Next

- [Logs & Common Troubleshooting](logs.html)
