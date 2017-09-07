---
title: Create Security Certificates
summary: A secure CockroachDB cluster uses TLS for encrypted inter-node and client-node communication.
toc: false
---

A secure CockroachDB cluster uses TLS for encrypted inter-node and client-node communication and requires CA, node, and client certificates and keys. To create these certificates and keys, use the `cockroach cert` [commands](cockroach-commands.html) with the appropriate subcommands and flags, or use [OpenSSL commands](https://wiki.openssl.org/index.php/).

<div class="filters filters-big clearfix">
  <a href="create-security-certificates.html"><button class="filter-button">Cockroach Cert Commands</button>
  <button class="filter-button current"><strong>OpenSSL Commands</strong></button></a>
</div>

When using OpenSSL commands to create node and client certificates, you will need access to a local copy of the CA certificate and key. It is therefore recommended to create all certificates and keys in one place and then distribute node and client certificates and keys appropriately. For the CA key, be sure to store it somewhere safe and keep a backup; if you lose it, you will not be able to add new nodes or clients to your cluster. For a walkthrough of this process, see [Manual Deployment](manual-deployment.html).

<div id="toc"></div>

## Subcommands

Subcommand | Usage
-----------|------
[`openssl genrsa`](https://wiki.openssl.org/index.php/Manual:Genrsa(1)) | Generate an RSA private key
[`openssl req`](https://wiki.openssl.org/index.php/Manual:Req(1)) | Create a private key and a CSR (certificate signing request)
[`openssl ca`](https://wiki.openssl.org/index.php/Manual:Ca(1)) | Issue a root CA certificate based on the CSR.

## Certificate Directory

Use the `openssl genrsa` and `openssl req` subcommands to generate the CA certificate and all node and client certificates and keys in a single directory, with the files named as follows:

File name pattern | File usage
-------------|------------
`ca.crt`     | CA certificate
`node.crt`   | Server certificate
`node.key`   | Key for server certificate
`client.<user>.crt` | Client certificate for `<user>` (eg: `client.root.crt` for user `root`)
`client.<user>.key` | Key for the client certificate

Note the following:

- The CA key is never loaded automatically by `cockroach` commands, so it should be created in a separate directory, identified by the `--ca-key` flag.

- <span style="color:red">Is this applicable to OpenSSL?</span> Keys (files ending in `.key`) must not have group or world permissions (maximum permissions are 0700, or `rwx------`). This check can be disabled by setting the environment variable `COCKROACH_SKIP_KEY_PERMISSION_CHECK=true`.

## Configuration Files

To use `openssl req` and `openssl ca` subcommands, you need the following configuration files:

File name pattern | File usage
-------------|------------
`ca.conf`     | CA configuration file
`node.conf`   | Server configuration file
`client.conf` | Client configuration file

## Examples

### Generate the CA key and certificate pair

1. Create two directories:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ mkdir certs
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ mkdir my-safe-directory
    ~~~
    - `certs`: You'll generate your CA certificate and all node and client certificates and keys in this directory and then upload some of the files to your nodes.
    - `my-safe-directory`: You'll generate your CA key in this directory and then reference the key when generating node and client certificates. After that, you'll keep the key safe and secret; you will not upload it to your nodes.

2. Create the ca.conf file

    {% include copy-clipboard.html %}
    ~~~ shell
    [ ca ]
    default_ca = CA_default

    [ CA_default ]
    default_days = 3660
    database = index.txt
    serial = serial.txt 
    default_md = sha256 
    copy_extensions = copy

    # Used to generate the CA certificate.
    [ req ]
    prompt=no
    distinguished_name = distinguished_name
    x509_extensions = extensions

    [ distinguished_name ]
    organizationName = Cockroach
    commonName = Cockroach CA

    [ extensions ]
    keyUsage = critical,digitalSignature,nonRepudiation,keyEncipherment,keyCertSign
    basicConstraints = critical,CA:true,pathlen:1

    # Common policy for nodes and users.
    [ signing_policy ]
    organizationName = supplied
    commonName = supplied

    # Used to sign node certificates.
    [ signing_node_req ]
    keyUsage = critical,digitalSignature,keyEncipherment
    extendedKeyUsage = serverAuth,clientAuth

    # Used to sign client certificates.
    [ signing_client_req ]
    keyUsage = critical,digitalSignature,keyEncipherment
    extendedKeyUsage = clientAuth
    ~~~

3. Generate the CA key using the [`openssl genrsa`](https://wiki.openssl.org/index.php/Manual:Genrsa(1)) command:

    {% include copy-clipboard.html %}
    ~~~ shell
    openssl genrsa -out ${my-safe-directory}/ca.key 2048 2> /dev/null
    chmod 400 ${my-safe-directory}/ca.key
    ~~~

4. Generate the CA certificate using the [`openssl req`](https://wiki.openssl.org/index.php/Manual:Req(1)) command:

    {% include copy-clipboard.html %}
    ~~~ shell
    # Create CA certificate.
    openssl req \
      -new \
      -x509 \
      -config ca.conf \
      -key ${CCERTS}/ca.key \
      -out ${OSCERTS}/ca.crt \
      -days 3660 \
      -batch

    # Reset database and index files.
    rm -f index.txt serial.txt
    touch index.txt
    echo '01' > serial.txt
    ~~~

### Generate the certificate and key pairs for nodes

1. Create the node.conf file for the first node:

    {% include copy-clipboard.html %}
    ~~~ shell
    [ req ]
    prompt=no
    distinguished_name = distinguished_name
    req_extensions = extensions

    [ distinguished_name ]
    organizationName = Cockroach
    commonName = <node-hostname>

    [ extensions ]
    subjectAltName = DNS:<node-hostname>,DNS:<node-domain>,IP:<IP Address>
    ~~~

2. Generate the key for the first node using the [`openssl genrsa`](https://wiki.openssl.org/index.php/Manual:Genrsa(1)) command:

    {% include copy-clipboard.html %}
    ~~~ shell
    openssl genrsa -out ${certs}/node.key 2048 2> /dev/null
    chmod 400 ${certs}/node.key
    ~~~

3. Generate the CSR for the first node using the [`openssl req`](https://wiki.openssl.org/index.php/Manual:Req(1)) command:

    {% include copy-clipboard.html %}
    ~~~ shell
    # Create Node certificate signing request.
    openssl req \
      -new \
      -config node.conf \
      -key ${certs}/node.key \
      -out ${certs}/node.csr \
      -batch
    ~~~

4. Sign the node CSR to create the node certificate for the first node using the [`openssl ca`](https://wiki.openssl.org/index.php/Manual:Ca(1)) command:

    {% include copy-clipboard.html %}
    ~~~ shell
    # Sign the CSR using the CA key.
    openssl ca \
      -config ca.conf \
      -keyfile ${OSCERTS}/ca.key \
      -cert ${OSCERTS}/ca.crt \
      -policy signing_policy \
      -extensions signing_node_req \
      -out ${OSCERTS}/node.crt \
      -outdir ${OSCERTS}/ \
      -in ${OSCERTS}/node.csr \
      -days 1830 \
      -batch
    ~~~

5. Upload certificates to the first node:

    {% include copy-clipboard.html %}
    ~~~ shell
    # Create the certs directory:
    $ ssh <username>@<node1 address> "mkdir certs"
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    # Upload the CA certificate and node certificate and key:
    $ scp certs/ca.crt \
    certs/node.crt \
    certs/node.key \
    <username>@<node1 address>:~/certs
    ~~~

6. Delete the local copy of the first node's certificate and key:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ rm certs/node.crt certs/node.key
    ~~~

    {{site.data.alerts.callout_info}}This is necessary because the certificates and keys for additional nodes will also be named <code>node.crt</code> and <code>node.key</code>.{{site.data.alerts.end}}

7. Repeat steps 1 - 6 for each additional node.

### Create the certificate and key pair for a client

1. Create the client.conf file for the first client:

    {% include copy-clipboard.html %}
    ~~~ shell
    [ req ]
    prompt=no
    distinguished_name = distinguished_name

    [ distinguished_name ]
    organizationName = Cockroach
    commonName = <username>
    ~~~

2. Generate the key for the first client using the [`openssl genrsa`](https://wiki.openssl.org/index.php/Manual:Genrsa(1)) command:

    {% include copy-clipboard.html %}
    ~~~ shell
    openssl genrsa -out ${certs}/client.<username>.key 2048 2> /dev/null
    chmod 400 ${certs}/client.<username>.key
    ~~~

3. Generate the CSR for the first client using the [`openssl req`](https://wiki.openssl.org/index.php/Manual:Req(1)) command:

    {% include copy-clipboard.html %}
    ~~~ shell
    # Create client certificate signing request
    openssl req \
      -new \
      -config client.conf \
      -key ${OSCERTS}/client.maxroach.key \
      -out ${OSCERTS}/client.maxroach.csr \
      -batch
    ~~~

4. Sign the client CSR to create the client certificate for the first client using the [`openssl ca`](https://wiki.openssl.org/index.php/Manual:Ca(1)) command:

    {% include copy-clipboard.html %}
    ~~~ shell
    openssl ca \
      -config ca.conf \
      -keyfile ${OSCERTS}/ca.key \
      -cert ${OSCERTS}/ca.crt \
      -policy signing_policy \
      -extensions signing_client_req \
      -out ${OSCERTS}/client.maxroach.crt \
      -outdir ${OSCERTS}/ \
      -in ${OSCERTS}/client.maxroach.csr \
      -days 1830 \
      -batch
    ~~~    

5. Upload certificates to the first client using your preferred method. 

6. Repeat steps 1 - 5 for each additional client.


## See Also

- [Manual Deployment](manual-deployment.html): Walkthrough starting a multi-node secure cluster and accessing it from a client.
- [Start a Node](start-a-node.html): Learn more about the flags you pass when adding a node to a secure cluster.
- [Other Cockroach Commands](cockroach-commands.html)
