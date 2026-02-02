---
title: Install a FIPS-ready CockroachDB Runtime
summary: Learn how to install and run CockroachDB in an environment subject to FIPS 140-3.
toc: true
docs_area: deploy
---

{{site.data.alerts.callout_danger}}
**FIPS is Experimental in v26.1**

FIPS support is marked as **Experimental** in CockroachDB v26.1 and will return to **General Availability** (GA) status in v26.2. As an [Innovation release]({% link releases/index.md %}#major-releases), CockroachDB v26.1 can be skipped. Production clusters running v25.4 with FIPS should be upgraded directly to v26.2 after it is available (May 2026) for continuous GA support of FIPS.

CockroachDB v26.1 has been upgraded to use the FIPS cryptographic module and FIPS 140-3 mode that are available with Go 1.25 (`GOFIPS140=latest`), transitioning from the previous OpenSSL-based approach. This version of the module is not under NIST review and will not be FIPS 140-3 validated. v26.2 will complete this transition by using the frozen v1.0.0 module (`GOFIPS140=v1.0.0`), which is on the [CMVP Modules In Process List](https://csrc.nist.gov/Projects/cryptographic-module-validation-program/modules-in-process/modules-in-process-list) and can be deployed in certain regulated environments.

**Recommendation for Production Deployments:**

- **Current FIPS users:** Stay on v25.4 or wait for v26.2.
- **New FIPS deployments:** Wait for v26.2, or start on v25.4 and later upgrade directly to v26.2.
- **Testing/non-production:** v26.1 can be used for testing and evaluation.

For more information about Go's FIPS 140-3 module, refer to the [Go FIPS 140 documentation](https://go.dev/doc/security/fips140).
{{site.data.alerts.end}}

## Overview of FIPS-ready CockroachDB

[Federal Information Processing Standards (FIPS) 140-3](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.140-3.pdf) is a U.S. government standard that specifies security requirements for cryptographic modules. FIPS 140-3 provides measurable security guidelines for protecting sensitive but unclassified information. The standard is applicable to all federal agencies that use cryptographic-based security systems to protect sensitive information in computer and telecommunication systems. U.S. and Canadian governments, as well as organizations working with them, may be subject to FIPS 140-3 requirements.

The Cryptographic Module Validation Program (CMVP) validates cryptographic modules to FIPS 140-3 and other cryptography-based standards. When a cryptographic module or library has a FIPS 140-3 certificate, it has been tested and formally validated under the CMVP as meeting the requirements for FIPS 140-3.

FIPS-ready CockroachDB binaries and Docker images are available for CockroachDB v23.1.0 and later. FIPS-ready CockroachDB runtimes run on Intel 64-bit Linux systems.

Starting with v26.1, FIPS-ready CockroachDB binaries are built using Go 1.25's native FIPS 140-3 support. The cryptographic operations are performed by Go's built-in cryptographic modules, which are independent of the host operating system's libraries. This represents a significant architectural change from previous versions (v25.4 and earlier), which used Red Hat's golang-fips toolchain with OpenSSL.

{{site.data.alerts.callout_info}}
**Migration from FIPS 140-2 to FIPS 140-3**

Previous versions of CockroachDB (v25.4 and earlier) supported FIPS 140-2. Starting with v26.1, CockroachDB supports FIPS 140-3. FIPS 140-2 will transition to historical status on September 22, 2026, per [NIST's FIPS 140-3 Transition Effort](https://csrc.nist.gov/Projects/fips-140-3-transition-effort).
{{site.data.alerts.end}}

For details about cryptographic algorithms and key lengths used by CockroachDB, refer to [Details About Cryptographic Algorithms](#details-about-cryptographic-algorithms).

### FIPS-ready features

When you use a FIPS-ready CockroachDB runtime, Cockroach Labs has verified that cryptographic operations in the following contexts meet the requirements of FIPS 140-3:

- [Encryption At Rest]({% link {{ page.version.version }}/security-reference/encryption.md %}#encryption-keys-used-by-cockroachdb-self-hosted-clusters)
- [Encrypted Backups]({% link {{ page.version.version }}/take-and-restore-encrypted-backups.md %})
- [Change Data Capture to Kafka over TLS]({% link {{ page.version.version }}/create-changefeed.md %}#query-parameters)
- [Certificate-based Node-to-Node and Client-to-Node Authentication]({% link {{ page.version.version }}/authentication.md %})
- [SASL SCRAM-SHA-256 Password Authentication]({% link {{ page.version.version }}/security-reference/scram-authentication.md %})
- [SQL Cryptographic Built-in Functions]({% link {{ page.version.version }}/functions-and-operators.md %}#cryptographic-functions)

  {{site.data.alerts.callout_danger}}
  When running a FIPS-ready runtime, Cockroach Labs recommends that you avoid using cryptographic operations that are not supported by FIPS 140-3. For example, generating an MD5 hash is not compatible with FIPS 140-3, because MD5 is not a FIPS-validated algorithm. Use algorithms and functions that do not comply with the standard at your own risk.
  {{site.data.alerts.end}}

This page shows how to install and configure a FIPS-ready CockroachDB {{ site.data.products.core }} runtime using Go's native FIPS 140-3 support.

### Performance considerations

When comparing performance of the same workload in a FIPS-ready CockroachDB runtime to a standard CockroachDB runtime, some performance difference may be observed. The amount of performance impact depends upon the workload, cluster configuration, query load, and other factors.

### Upgrading to a FIPS-ready CockroachDB runtime

Upgrading an existing CockroachDB cluster's binaries in-place to be FIPS-ready is not supported.

## Operating System Requirements

FIPS-ready CockroachDB v26.1 uses Go's native cryptographic module, which is independent of the host operating system's libraries. The FIPS-ready binary can run on any Intel 64-bit Linux system.

{{site.data.alerts.callout_info}}
**Optional: Enable FIPS mode in the Linux kernel**

While not required for Go's native FIPS support to function, enabling FIPS mode in the Linux kernel provides an additional layer of compliance enforcement and may be required by your organization's security policies. The kernel's FIPS mode helps prevent the use of weak cryptographic algorithms system-wide.

To enable kernel FIPS mode on Red Hat Enterprise Linux or its derivatives, refer to [Enable FIPS mode](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/9/html/security_hardening/assembly_installing-the-system-in-fips-mode_security-hardening) in Red Hat's documentation.
{{site.data.alerts.end}}

The FIPS-ready CockroachDB Docker images are based on [Red Hat's Universal Base Image 10](https://catalog.redhat.com/software/containers/ubi10/ubi-minimal/). To [use the FIPS-ready CockroachDB Docker image](#use-the-fips-ready-cockroachdb-docker-image), skip directly to that section of this page.

### Extend Red Hat's Universal Base Image 10 Docker image

If you do not want to use the FIPS-ready CockroachDB Docker image directly, you can create a custom Docker image based on [Red Hat's Universal Base Image 10](https://catalog.redhat.com/software/containers/ubi10/ubi-minimal/):

- You can model your Dockerfile on the one that Cockroach Labs uses to produce the [FIPS-ready Docker image](https://github.com/cockroachdb/cockroach/blob/master/build/deploy/Dockerfile) for CockroachDB.
- The FIPS-ready binary includes Go's native FIPS cryptographic module and does not require additional system libraries to be installed.

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
**Upgrading from v25.4 FIPS to v26.1 FIPS**

CockroachDB v26.1 represents a major architectural change in FIPS implementation (migration from golang-fips/OpenSSL to Go's native FIPS support). Because v26.1 FIPS is experimental, production FIPS customers are recommended to stay on v25.4 or wait for v26.2.

Upgrading an existing CockroachDB cluster's binary in-place from non-FIPS to FIPS is not supported. Instead, you can [restore your cluster]({% link {{ page.version.version }}/restore.md %}#full-cluster) to a new FIPS-ready cluster.
{{site.data.alerts.end}}

### Verify that CockroachDB is FIPS-ready

To verify that the CockroachDB binary is FIPS-ready, use the `cockroach version` command and check for the `FIPS enabled` field:

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach version | grep -i fips
~~~

~~~ shell
FIPS enabled: true
~~~

This indicates that CockroachDB was built with Go's native FIPS 140-3 support.

{{site.data.alerts.callout_info}}
**Change from previous versions:** In v25.4 and earlier, FIPS-ready binaries showed `fips` appended to the Go version (e.g., `go1.19.5fips`). Starting with v26.1, FIPS status is indicated by the `FIPS enabled: true` field.
{{site.data.alerts.end}}

## Use the FIPS-ready CockroachDB Docker image

The FIPS-ready CockroachDB Docker image is based on Red Hat Universal Base Image 10 and includes the FIPS-ready CockroachDB binary.

1. Go to [Download FIPS-ready Runtimes](#download-fips-ready-runtimes) and copy the name of a FIPS-ready Docker image tag. The image tag format is `cockroachdb/cockroach:v26.1.0-fips` (replace with the specific version).

1. Pull the Docker image locally, create a new container that uses it, run the container, and attach to it. The following example gives the running container the name `cockroachdb-fips-container`. Replace `{image_tag}` with the name of the Docker image tag you copied.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    docker run {image_tag} --name="cockroachdb-fips-container" -i
    ~~~

1. In the running container, [verify that CockroachDB is FIPS-ready](#verify-that-cockroachdb-is-fips-ready).

1. To stop the container, use `CTRL-C`. To detach from the container but keep it running in the background, use the sequence `CTRL+P+CTRL+Q`.

## Password Requirements in FIPS Mode

FIPS 140-3 has stricter requirements for password length compared to FIPS 140-2. When running a FIPS-ready CockroachDB binary, the minimum password length is **14 characters**. This aligns with NIST's recommendation that HMAC keys should have a length of at least 112 bits, which translates to 14 ASCII characters.

{{site.data.alerts.callout_danger}}
**Important for upgrades:** Users with passwords shorter than 14 characters may be locked out when upgrading to v26.1 FIPS from an earlier version. Ensure all user passwords meet the minimum length requirement before upgrading.
{{site.data.alerts.end}}

For more information about this change, refer to the [pull request #151636](https://github.com/cockroachdb/cockroach/pull/151636).

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
