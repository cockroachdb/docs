---
title: Sign Up for a Managed Cluster
summary:
toc: true
build_for: [managed]
---

The Managed CockroachDB offering is currently in Limited Availability and accepting customers on a qualified basis. The offering provides a running CockroachDB cluster suitable to your needs, fully managed by Cockroach Labs on GCP or AWS. Benefits include:

- No provisioning or deployment efforts for you
- Daily full backups and hourly incremental backups of your data
- Upgrades to the latest stable release of CockroachDB
- Monitoring to provide SLA-level support

## Application process

To be considered for participation:

1. [Sign up for an Enterprise Trial license](https://www.cockroachlabs.com/get-cockroachdb/).

2. During sign up, check **I am interested in Managed CockroachDB**. You'll be asked to provide some basic details about your company and deployment requirements.

    {% comment %}- The type of app you want to run against CockroachDB (e.g., point-in-time retail transactions)
    - The cloud and regions where you want CockroachDB running
    - The general shape of your workload (e.g., reads vs. writes, overwriting keys vs. new keys)
    - Your expected QPS or TPS
    - Your current data size and expected growth in size{% endcomment %}

3. Once you've submitted your request, two things will happen:
    - Cockroach Labs will consider your use case and follow up with you within 1 business day.
    - You'll receive an email with links to download and start exploring CockroachDB right away.

        The email will include a 30-day license key for CockroachDB with Enterprise features (backup & restore, geo-partitioning, priority support, cluster visualization).

## Set your password

Once you are approved and your Managed CockroachDB cluster is available, you'll receive an email prompting you to set a password and sign in:

1. In the confirmation email, click **Set password**.

    The **Set Password** page displays.

2. Enter your name.
3. Enter and confirm your password.
4. Click **Submit**.

    The [**Clusters**](managed-clusters-page.html) page displays.

## Sign in

Once [your password is set](#set-your-password), to sign in:

1. Navigate to the [Console](https://cockroachlabs.cloud/).
2. Enter your **Email** and **Password**.
3. Click **Log in**.
    The **Clusters** page displays.
