---
title: Sign Up for a Managed Cluster
summary:
toc: true
build_for: [standard, managed]
---

The Managed CockroachDB offering is currently in Limited Availability and accepting customers on a qualified basis. The offering provides a running CockroachDB cluster suitable to your needs, fully managed by Cockroach Labs on GCP or AWS. Benefits include:

- No provisioning or deployment efforts for you
- Daily full backups and hourly incremental backups of your data
- Upgrades to the latest stable release of CockroachDB
- Monitoring to provide SLA level support

## Application process

To be considered for participation:

1. [Sign up for an Enterprise Trial license](https://www.cockroachlabs.com/pricing/start-trial/).

2. During sign up, indicate that you're interested in the Managed offering. You'll be asked to provide details about your company, use case, and deployment requirements.

    {% comment %}- The type of app you want to run against CockroachDB (e.g., point-in-time retail transactions)
    - The cloud and regions where you want CockroachDB running
    - The general shape of your workload (e.g., reads vs. writes, overwriting keys vs. new keys)
    - Your expected QPS or TPS
    - Your current data size and expected growth in size{% endcomment %}

3. Once you've submitted your request, two things will happen:
    - You'll receive an email with links to download and start exploring CockroachDB right away.

        The email will include a 30-day license key for CockroachDB with Enterprise features (backup & restore, geo-partitioning, priority support, cluster visualization).
    - Cockroach Labs will consider your use case.

        If we think it is a good fit for a Managed CockroachDB trial, a member of our team will follow up with you within two business days.

## Confirmation email

Once your Managed CockroachDB cluster is available, you'll receive an email confirming its shape (e.g., regions, number of nodes per region, etc.) and providing you the following important details.

### Connection details

You use these details to [connect to your cluster](managed-connect-to-your-cluster.html) from the CockroachDB SQL shell or a Postgres-compatible driver or ORM.

Detail | Description
-------|------------
Hosts | The hostnames to use in your connection URLs.<br><br>Typically, you'll receive one global hostname to use for the Admin UI and for ad-hoc querying via the CockroachDB SQL client, and one load balancer hostname per region for your client applications.
Ports | The ports to use for SQL connections and for reaching the Admin UI, by default, `26257` and `8080` respectively.
User | The initial username to use in your connection URLs.
Password | The initial password to use in your connection URLs.
Database name | The initial database to in your connection URLs.
CA Certificate | The `ca.crt` file that must be available on every machine from which you want to connect the cluster and referenced in connection URLs.

**SQL connection URL with placeholders**

~~~
postgres://<username>:<password>@<host>:26257/<database>?sslmode=verify-full&sslrootcert=certs-dir/ca.crt'
~~~

**SQL connection URL with fake details**

~~~
postgres://maxroach:LeiCisGclLcmaWOls@gcp-us-east1.company-domain.cockroachcloud.com:26257/firstdb?sslmode=verify-full&sslrootcert=certs-dir/ca.crt'
~~~

### Admin UI URL

You use this URL to reach the [Admin UI for your cluster](managed-use-the-admin-ui.html). This URL is typically the combination of the global hostname and port `8080`.

Once you open the URL, you'll need to log in with the username and password mentioned above.
