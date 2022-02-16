---
title: Network Security in CockroachDB
summary: Overview of CockroachDB Network Security Features and Requirements
toc: true
docs_area: reference.security
---

There are two ways to connect to a CockroachDB Cluster, whether it has been deployed by Cockroach Labs as part of their Cloud Serverless or Dedicated offering, or you have deployed it yourself.

- The HTTP client (Web Console)
- SQL client

All SQL connections are TLS encrypted (unless an environment has been deployed in `--insecure` mode). See [Encryption in CockroachDB](encryption.html).

## CockroachDB Serverless cloud

For CockroachDB Cloud offerings (Serverless and Dedicated) the Web Console is found at [https://cockroachlabs.cloud](https://cockroachlabs.cloud).

Once you have created an account, you may provision clusters and perform cluster operations such as creating databases and users. See our [Quickstart Guide](quickstart.html).

To access the SQL client using the Cockroach CLI or a SDK for your programming language of choice, you can obtain a connection string from the Web Console.

By default, CockroachDB Serverless clusters accepts web and SQL connections from anywhere on the internet. Access can be restricted to allow-listed IPs using [CockroachDB Authentication Configuration](authentication.html).

Cockroach Serverless currently only accepts password authentication for web console and SQL client access.


## CockroachDB Dedicated cloud

For CockroachDB Cloud offerings (Serverless and Dedicated) the Web Console is found at [https://cockroachlabs.cloud](https://cockroachlabs.cloud).

CockroachDB Dedicated enforces network security by requiring explicit IP allow-listing for SQL client access. Additionally, network access can be enabled for CockroachDB Dedicated Cloud clusters in Google Cloud via [VPC Network Peering](https://cloud.google.com/vpc/docs/vpc-peering), or in Amazon Web Services via [AWS PriveLink](https://aws.amazon.com/privatelink).

See [Managing Network Authorization for CockroachDB Dedicated](network-authorization.html).

## Self-Hosted CockroachDB

When deploying CockroachDB yourself, you must manage your own network security. Explore the [production checklist](recommended-production-settings.html) to see what is involved.



