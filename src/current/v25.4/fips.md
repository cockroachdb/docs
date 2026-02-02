---
title: Install a FIPS-ready CockroachDB Runtime
summary: Learn how to install and run CockroachDB in an environment subject to FIPS 140-2.
toc: true
docs_area: deploy
---

{{site.data.alerts.callout_info}}
FIPS support is GA in v25.4, experimental in v26.1, and will return to GA in v26.2, completing a transition to Go's native FIPS cryptographic module.

As an [Innovation release]({% link releases/index.md %}#major-releases), v26.1 can be skipped by CockroachDB self-hosted clusters.

Production clusters running a v25.4 FIPS binary should be upgraded directly to a v26.2 FIPS binary (available May 2026) for continuous GA support of FIPS.

For more information, refer to the [v26.1 FIPS documentation]({% link v26.1/fips.md %}).
{{site.data.alerts.end}}

## Overview of FIPS-ready CockroachDB

[Federal Information Processing Standards (FIPS) 140-2](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.140-2.pdf) is a mandatory standard that is used to approve cryptographic models. The goal of FIPS 140-2 is to provide measurable security guidelines for handling and accessing sensitive but unclassified (SBU) information. The FIPS 140-2 standard is applicable to all federal agencies that use cryptographic-based security systems to protect sensitive information in computer and telecommunication systems (including voice systems) as defined in Section 5131 of the Information Technology Management Reform Act of 1996, Public Law 104-106; and the Federal Information Security Management Act of 2002, Public Law 107-347. U.S. and Canadian governments, as well as organizations working with them, may be subject to FIPS 140-2 requirements.

The Cryptographic Module Validation Program (CMVP) validates cryptographic modules to FIPS 140-2 and other cryptography-based standards. When a cryptographic module or library has a FIPS 140-2 certificate, it has been tested and formally validated under the CMVP as meeting the requirements for FIPS 140-2.

FIPS-ready CockroachDB binaries and Docker images are available for CockroachDB v23.1.0 and later. FIPS-ready CockroachDB runtimes run only on Intel 64-bit Linux systems.

FIPS-ready CockroachDB binaries are built using [Red Hat's Go FIPS with OpenSSL toolchain](https://github.com/golang-fips/go), which contains the necessary modifications for the Go crypto library to use an external cryptographic library in a manner compatible with FIPS 140-2. FIPS-ready CockroachDB delegates cryptographic operations to the host operating system's OpenSSL libraries and commands, rather than Go's cryptographic libraries. When the installed OpenSSL has a FIPS 140-2 certificate and [FIPS mode is enabled in the Linux kernel](#enable-fips-mode-in-the-linux-kernel), the CockroachDB runtime is suitable for workloads that are subject to FIPS 140-2 requirements.

For details about cryptographic algorithms and key lengths used by CockroachDB. refer to [Details About Cryptographic Algorithms](#details-about-cryptographic-algorithms).

### FIPS-ready features

When you use a FIPS-ready CockroachDB runtime and each cluster node's OpenSSL is FIPS-validated and configured correctly, Cockroach Labs has verified that cryptographic operations in the following contexts meet the requirements of FIPS 140-2:

- [Encryption At Rest]({% link {{ page.version.version }}/security-reference/encryption.md %}#encryption-keys-used-by-cockroachdb-self-hosted-clusters)
- [Encrypted Backups]({% link {{ page.version.version }}/take-and-restore-encrypted-backups.md %})
- [Change Data Capture to Kafka over TLS]({% link {{ page.version.version }}/create-changefeed.md %}#query-parameters)
- [Certificate-based Node-to-Node and Client-to-Node Authentication]({% link {{ page.version.version }}/authentication.md %})
- [SASL SCRAM-SHA-256 Password Authentication]({% link {{ page.version.version }}/security-reference/scram-authentication.md %})
- [SQL Cryptographic Built-in Functions]({% link {{ page.version.version }}/functions-and-operators.md %}#cryptographic-functions)

  {{site.data.alerts.callout_danger}}
  When running a FIPS-ready runtime, Cockroach Labs recommends that you avoid using cryptographic operations that are not supported by FIPS 140-2. For example, generating an MD5 hash is not compatible with FIPS 140-2, because MD5 is not a FIPS-validated algorithm. Use algorithms and functions that do not comply with the standard at your own risk.
  {{site.data.alerts.end}}

This page shows how to configure a FIPS-ready CockroachDB {{ site.data.products.core }} runtime using Red Hat's FIPS-validated OpenSSL package. The FIPS-ready Docker image for CockroachDB comes with Red Hat's OpenSSL libraries pre-installed and configured.

### Performance considerations

When comparing performance of the same workload in a FIPS-ready CockroachDB runtime to a standard CockroachDB runtime, some performance degradation is expected, due to the use of the system's installed FIPS-validated OpenSSL libraries. The amount of performance impact depends upon the workload, cluster configuration, query load, and other factors.

### Upgrading to a FIPS-ready CockroachDB runtime

Upgrading an existing CockroachDB cluster's binaries in-place to be FIPS-ready is not supported.

## Enable FIPS mode in the Linux kernel

The following section provides several ways to help ensure that the FIPS object module is loaded in your system's kernel and is used by your system's OpenSSL libraries. The FIPS object module helps to prevent the use of weak cryptographic algorithms and functions which are incompatible with FIPS 140-2.

The FIPS-ready CockroachDB Docker images are based on [Red Hat's Universal Base Image 8 Docker image](https://catalog.redhat.com/software/containers/ubi8/ubi/), which comes with FIPS-validated OpenSSL libraries pre-installed with settings to comply with FIPS 140-2. To [use the FIPS-ready CockroachDB Docker image](#use-the-fips-ready-cockroachdb-docker-image), skip directly to that section of this page.

{{site.data.alerts.callout_info}}
A [Ubuntu Pro or Ubuntu Advantage subscription](https://ubuntu.com/pro) is required to access [FIPS-validated OpenSSL libraries and pre-configured Docker images](https://ubuntu.com/security/certifications/docs/fips). See [Enabling FIPS with the `ua` tool](https://ubuntu.com/security/certifications/docs/fips-enablement) in Ubuntu's documentation. This page does not provide specific instructions for Ubuntu.
{{site.data.alerts.end}}

A system must have FIPS mode enabled in the kernel before it can run the FIPS-ready CockroachDB binary or the FIPS-ready CockroachDB Docker image. Enabling FIPS mode loads the FIPS kernel module so that the kernel itself enforces compliance with FIPS 140-2. To enable FIPS mode on Red Hat Enterprise Linux or its derivatives, refer to [Enable FIPS mode](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/8/html/security_hardening/assembly_installing-a-rhel-8-system-with-fips-mode-enabled_security-hardening) in Red Hat's documentation. To verify that FIPS mode is enabled, refer to [Verify that the kernel enforces FIPS mode](#verify-that-the-kernel-enforces-fips-mode).

### Extend Red Hat's Universal Base Image 8 Docker image

If you do not want to use the FIPS-ready CockroachDB Docker image directly, you can create a custom Docker image based on [Red Hat's Universal Base Image 8 Docker image](https://catalog.redhat.com/software/containers/ubi8/ubi/):

- You can model your Dockerfile on the one that Cockroach Labs uses to produce the [FIPS-ready Docker image](https://github.com/cockroachdb/cockroach/blob/master/build/deploy/Dockerfile) for CockroachDB.
- Your Dockerfile must install OpenSSL before it starts the `cockroach` binary.
- You must enable FIPS mode on the Docker host kernel before it can run containers with FIPS mode enabled. The FIPS-ready CockroachDB Docker image must run with FIPS mode enabled. To enable FIPS mode in the Docker host kernel, refer to [Enable FIPS mode](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/8/html/security_hardening/assembly_installing-a-rhel-8-system-with-fips-mode-enabled_security-hardening) in Red Hat's documentation. To verify that FIPS mode is enabled, refer to [Verify that the kernel enforces FIPS mode](#verify-that-the-kernel-enforces-fips-mode).

### Install on Red Hat Enterprise Linux

When you install Red Hat Enterprise Linux (RHEL) on a host, or after installation has completed, you can [enable FIPS mode](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/8/html/security_hardening/assembly_installing-a-rhel-8-system-with-fips-mode-enabled_security-hardening). Red Hat recommends installing RHEL with FIPS mode enabled, as opposed to enabling FIPS mode later, to help ensure that the system generates all keys with FIPS-approved algorithms and continuous monitoring tests in place.

Once FIPS mode is enabled, install OpenSSL so that the FIPS-validated OpenSSL libraries are installed.

To install OpenSSL on RHEL:

{% include_cached copy-clipboard.html %}
~~~ shell
microdnf -y install openssl crypto-policies-scripts
fips-mode-setup --enable
~~~

Next, [verify that the kernel enforces FIPS mode](#verify-that-the-kernel-enforces-fips-mode).

### Verify that the kernel enforces FIPS mode

If FIPS mode is not enabled in the Linux kernel, or if OpenSSL is not configured correctly, the Linux kernel does not enforce FIPS 140-2 by default even if the FIPS module is present. Take these steps to verify that the Linux kernel is enforcing FIPS 140-2:

1. You can list the FIPS-validated ciphers using the `openssl ciphers` command. If FIPS mode is disabled, a `no cipher match` error occurs.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    openssl ciphers FIPS -v
    ~~~

1. When FIPS mode is enabled, the `sysctl` variable `fips_enabled` is set to `1`:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    sysctl crypto.fips_enabled
    ~~~

    ~~~ shell
    1
    ~~~

    {{site.data.alerts.callout_info}}
    The preceding command does not work from within a Docker container. A Docker container runs with FIPS mode enabled if the Docker host has FIPS mode enabled. Run this command from the Docker host rather than from the Docker container.
    {{site.data.alerts.end}}

1. The MD5 hashing algorithm is not compatible with FIPS 140-2. If the following command **fails**, FIPS mode is enabled:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    echo "test" | openssl md5
    ~~~

After verifying that the kernel enforces FIPS mode, you can [download](#downloads) and [install](#install) the FIPS-ready CockroachDB binary. If the tests indicate that FIPS mode is not enforced, refer to your operating system's documentation about enabling FIPS mode to resolve the issue before continuing.

<a id="downloads"></a>

## Download FIPS-ready runtimes

{% comment %}
    This uses logic adapted from /docs/releases.md, but with some differences because this page is versioned and that page is not.
{% endcomment %}

{% assign sections = site.data.releases | map: "release_type" | uniq | reverse %}
{% comment %} Fetch the list of all release types (currently Testing, Production) {% endcomment %}

{% assign latest_hotfix = site.data.releases | where_exp: "latest_hotfix", "latest_hotfix.major_version == site.versions['stable']" | where_exp: "latest_hotfix", "latest_hotfix.withdrawn != true"  | sort: "release_date" | reverse | first %}
{% comment %} For the latest GA version, find the latest hotfix that is not withdrawn. {% endcomment %}

{% assign fips_releases = site.data.releases | where_exp: "releases", "releases.major_version == page.version.version" | where_exp: "releases", "releases.linux.linux_intel_fips == true or releases.linux.linux_arm_fips == true" %}

{% if fips_releases.size > 0 %}
To download FIPS-ready CockroachDB runtimes, use the following links.

    {% for s in sections %}

        {% assign releases = fips_releases | where_exp: "releases", "releases.release_type == s" | sort: "release_date" | reverse %} {% comment %} Fetch all releases for that major version based on release type (Production/Testing). {% endcomment %}

        {% comment %} Logic to determine whether to print the ARM column {% endcomment %}
        {% assign v_linux_arm_fips = false %}
        {% for r in releases %}
            {% if r.linux.linux_arm_fips == true %}
                {% assign v_linux_arm_fips = true %}
                {% break %}
            {% endif %}
        {% endfor %}

        {% if releases[0] %}
### {{ s }} releases

<table class="release-table">
    <thead>
        <tr>
            <td>Version</td>
            <td>Date</td>
            <td>Intel 64-bit Downloads</td>
            {% if v_linux_arm_fips == true %}
            <td>ARM 64-bit Downloads</td>
            {% endif %}
            <td>Intel 64-bit Docker Images</td>
        </tr>
    </thead>
    <tbody>
            {% for r in releases %}
                {% comment %}Only print FIPS-ready download links{% endcomment %}
                {% if r.linux.linux_intel_fips == true %}
    <tr {% if r.release_name == latest_hotfix.release_name %}class="latest"{% endif %}> {% comment %} Add "Latest" class to release if it's the latest release. {% endcomment %}
        <td>
                {% comment %}Version{% endcomment %}
            <a href="{% link releases/{{ page.version.version }}.md %}#{{ r.release_name | replace: '.', '-' }}">{{ r.release_name }}</a> {% comment %} Add link to each release r. {% endcomment %}
                    {% if r.release_name == latest_hotfix.release_name %}
            <span class="badge-new">Latest</span> {% comment %} Add "Latest" badge to release if it's the latest release. {% endcomment %}
                    {% endif %}
        </td>
                {% comment %}Date{% endcomment %}
        <td>{{ r.release_date }}</td>
                {% comment %}Intel 64-bit Binary {% endcomment %}
        <td>
                    {% if r.withdrawn == true %} {% comment %} Suppress withdrawn releases. {% endcomment %}
            <span class="badge badge-gray">Withdrawn</span>
                    {% else %}
            <div><a href="https://binaries.cockroachdb.com/cockroach-{{ r.release_name }}.linux-amd64-fips.tgz">Full Binary</a>{% if r.has_sha256sum == true %} (<a href="https://binaries.cockroachdb.com/cockroach-{{ r.release_name }}.linux-amd64-fips.tgz.sha256sum">SHA256</a>){% endif %}</div>
                        {% if r.has_sql_only == true %}
            <div><a href="https://binaries.cockroachdb.com/cockroach-sql-{{ r.release_name }}.linux-amd64-fips.tgz">SQL Shell Binary</a>{% if r.has_sha256sum == true %} (<a href="https://binaries.cockroachdb.com/cockroach-sql-{{ r.release_name }}.linux-amd64-fips.tgz.sha256sum">SHA256</a>{% endif %})</div>
                        {% endif %}
                    {% endif %}
        </td>
                {% comment %}ARM 64-bit Binary {% endcomment %}
                {% if v_linux_arm_fips == true %}
        <td>
                    {% if r.withdrawn == true %} {% comment %} Suppress withdrawn releases. {% endcomment %}
            <span class="badge badge-gray">Withdrawn</span>
                    {% else %}
            <div><a href="https://binaries.cockroachdb.com/cockroach-{{ r.release_name }}.linux-arm64.fips.tgz">Full Binary</a>{% if r.has_sha256sum == true %} (<a href="https://binaries.cockroachdb.com/cockroach-{{ r.release_name }}.linux-arm64.fips.tgz.sha256sum">SHA256</a>){% endif %}</div>
                        {% if r.has_sql_only == true %}
            <div><a href="https://binaries.cockroachdb.com/cockroach-sql-{{ r.release_name }}.linux-arm64.fips.tgz">SQL Shell Binary</a>{% if r.has_sha256sum == true %} (<a href="https://binaries.cockroachdb.com/cockroach-sql-{{ r.release_name }}.linux-arm64.fips.tgz.sha256sum">SHA256</a>{% endif %})</div>
                        {% endif %}
                    {% endif %}
        </td>
                {% endif %}

                {% comment %}Docker image{% endcomment %}
        <td>
            <code>cockroachdb/cockroach:{{ r.release_name }}-fips</code>
        </td>
    </tr>
                {% endif %}
            {% endfor %} {% comment %}Releases {% endcomment %}
</table>
        {% endif %}
    {% endfor %}{% comment %}Sections {%endcomment %}
{% else %}
No FIPS-ready runtimes are available at this time. Please check again later.
{% endif %}

<a id="install"></a>

## Install the FIPS-ready CockroachDB runtime

After you [download](#downloads) a FIPS-ready CockroachDB binary, install it in the same way as the standard binary. Refer to [Install CockroachDB on Linux]({% link {{ page.version.version }}/install-cockroachdb-linux.md %}).

{{site.data.alerts.callout_info}}
Upgrading an existing CockroachDB cluster's binary in-place to be FIPS-ready is not supported. Instead, you can [restore your cluster]({% link {{ page.version.version }}/restore.md %}#full-cluster) to a new FIPS-ready cluster.
{{site.data.alerts.end}}

### Verify that CockroachDB is FIPS-ready

If the CockroachDB binary is FIPS-ready, the string `fips` is appended to the Go version in the `cockroach version` command:

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach version |grep fips
~~~

~~~ shell
go1.19.5fips
~~~

This indicates that CockroachDB was built using [Red Hat's Go FIPS with OpenSSL toolchain](https://github.com/golang-fips/go).

## Use the FIPS-ready CockroachDB Docker image

1. If necessary, enable FIPS mode on the Docker host. The FIPS-ready CockroachDB Docker image must run on a Docker host with FIPS mode enabled. To enable FIPS mode in the Docker host kernel, refer to [Enable FIPS mode](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/8/html/security_hardening/assembly_installing-a-rhel-8-system-with-fips-mode-enabled_security-hardening) in Red Hat's documentation. To verify that FIPS mode is enabled, refer to [Verify that the kernel enforces FIPS mode](#verify-that-the-kernel-enforces-fips-mode).
1. Go to [Download FIPS-ready Runtimes](#download-fips-ready-runtimes) and copy the name of a FIPS-ready Docker image tag.
1. Pull the Docker image locally, create a new container that uses it, run the container, and attach to it. The following example gives the running container the name `cockroachdb-fips-container`. Replace `{image_tag}` with the name of the Docker image tag you copied.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    docker run {image_tag} --name="cockroachdb-fips-container" -i
    ~~~

1. In the Docker host, [verify that the kernel enforces FIPS mode](#verify-that-the-kernel-enforces-fips-mode).

    {{site.data.alerts.callout_info}}
    Do not attempt to run the `sysctl` test from within the running container. Run the command from the Docker host rather than from the Docker container.
    {{site.data.alerts.end}}

1. In the running container, [verify that CockroachDB is FIPS-ready](#verify-that-cockroachdb-is-fips-ready).
1. To stop the container, use `CTRL-C`. To detach from the container but keep it running in the background, use the sequence `CTRL+P+CTRL+Q`.

## Details about cryptographic algorithms

This section provides more information about the cryptographic algorithms and key lengths used by FIPS-ready CockroachDB.

### Authentication

#### Inter-node and node identity

**Algorithm**: [TLS 1.3 (RFC 8446)](https://www.rfc-editor.org/rfc/rfc8446).

Refer to [Using Digital Certificates with CockroachDB]({% link {{ page.version.version }}/authentication.md %}#using-digital-certificates-with-cockroachdb).

#### Client identity

##### Password authentication

**Algorithm**: `bcrypt` or `scram-sha-256`.

Refer to [SASL/SCRAM-SHA-256 Secure Password-based Authentication]({% link {{ page.version.version }}/security-reference/scram-authentication.md %}).

##### Client certificates

**Algorithm**: [TLS 1.3 (RFC 8446)](https://www.rfc-editor.org/rfc/rfc8446).

Refer to [Using Digital Certificates with CockroachDB]({% link {{ page.version.version }}/authentication.md %}#using-digital-certificates-with-cockroachdb).

##### GSSAPI / Kerberos

Not supported for FIPS-ready deployments.

##### SASL / SCRAM password authentication

**Algorithm**: `scram-sha-256`.

Refer to [SASL/SCRAM-SHA-256 Secure Password-based Authentication]({% link {{ page.version.version }}/security-reference/scram-authentication.md %}).

##### JSON Web Tokens (JWTs)

**Algorithms**: Specified by the [`server.jwt_authentication.jwks` cluster setting]({% link {{ page.version.version }}/sso-sql.md %}#cluster-settings).

Refer to [Cluster Single Sign-on (SSO) using a JSON web token (JWT)]({% link {{ page.version.version }}/sso-sql.md %}).

##### DB Console Authentication via OIDC

**Algorithm**: Specified by the identity provider (IdP) as part of the OIDC handshake process.

Refer to [Single Sign-on (SSO) for DB Console]({% link {{ page.version.version }}/sso-db-console.md %}).

##### HTTP API access via login tokens

**Algorithm**: `sha256` ([RFC 6234](https://datatracker.ietf.org/doc/html/rfc6234)).

### Encryption

#### In flight

**Algorithm**: [TLS 1.3 (RFC 8446)](https://www.rfc-editor.org/rfc/rfc8446).

**Key sizes**: Depends upon the cipher suite in use:

- TLS 1.2:
  - `tls.TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256`
  - `tls.TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384`
  - `tls.TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256`
  - `tls.TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384`
  - If the `COCKROACH_TLS_ENABLE_OLD_CIPHER_SUITES` environment variable is set:

    - `tls.TLS_RSA_WITH_AES_128_GCM_SHA256`
    - `tls.TLS_RSA_WITH_AES_256_GCM_SHA384`

- TLS 1.3:
    - `TLS_AES_128_GCM_SHA256`
    - `TLS_AES_256_GCM_SHA384`

#### At rest

##### Customer-managed backups

##### AWS

Default encryption provided by the [AWS Encryption SDK](https://docs.aws.amazon.com/encryption-sdk/latest/developer-guide/introduction.html).

##### GCP

Default encryption provided by [Google Cloud](https://cloud.google.com/docs/security/encryption/default-encryption).

##### Data Encryption at Rest (EAR)

**Algorithm**: Advanced Encryption Standard (AES) encryption, in counter (CTR) mode.

**Key sizes**: The store key is specified by the user, and can be of length 16, 24, or 32 bytes (corresponding to AES-128, AES-192, or AES-256). Data keys are the same length as the store key.

## See also

- [Install CockroachDB]({% link {{ page.version.version }}/install-cockroachdb-linux.md %})
- [Releases]({% link releases/index.md %})
