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

<div id="toc"></div>

## Subcommands

Subcommand | Usage
-----------|------
[`openssl genrsa`](https://wiki.openssl.org/index.php/Manual:Genrsa(1)) | Create an RSA private key.
[`openssl req`](https://wiki.openssl.org/index.php/Manual:Req(1)) | Create CA certificate and CSRs (certificate signing requests).
[`openssl ca`](https://wiki.openssl.org/index.php/Manual:Ca(1)) | Create node and client certificates using the CSRs.

## Certificate Directory

When using OpenSSL commands to create node and client certificates, you will need access to a local copy of the CA certificate and key. We recommend that you create all certificates (node, client, and CA certificates), and node and client keys in one place and then distribute them appropriately. For the CA key, be sure to store it somewhere safe and keep a backup; if you lose it, you will not be able to add new nodes or clients to your cluster. For a walkthrough of this process, see [Manual Deployment](manual-deployment.html).

Use the [`openssl genrsa`](https://wiki.openssl.org/index.php/Manual:Genrsa(1)) and [`openssl req`](https://wiki.openssl.org/index.php/Manual:Req(1)) subcommands to create all certificates, and node and client keys in a single directory, with the files named as follows:

File name pattern | File usage
-------------|------------
`ca.crt`     | CA certificate
`node.crt`   | Server certificate
`node.key`   | Key for server certificate
`client.<user>.crt` | Client certificate for `<user>` (eg: `client.root.crt` for user `root`)
`client.<user>.key` | Key for the client certificate

Note the following:

- The CA key is never loaded automatically by `cockroach` commands, so it should be created in a separate directory, identified by the `--ca-key` flag.

- Keys (files ending in `.key`) must not have group or world permissions (maximum permissions are 0700, or `rwx------`). This check can be disabled by setting the environment variable `COCKROACH_SKIP_KEY_PERMISSION_CHECK=true`.

## Configuration Files

To use [`openssl req`](https://wiki.openssl.org/index.php/Manual:Req(1)) and [`openssl ca`](https://wiki.openssl.org/index.php/Manual:Ca(1)) subcommands, you need the following configuration files:

File name pattern | File usage
-------------|------------
`ca.cnf`     | CA configuration file
`node.cnf`   | Server configuration file
`client.cnf` | Client configuration file

## Examples

### Create the CA key and certificate pair

1. Create two directories:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ mkdir certs
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ mkdir my-safe-directory
    ~~~
    - `certs`: You'll create your CA certificate and all node and client certificates and keys in this directory and then upload the relevant files to your nodes and clients.
    - `my-safe-directory`: You'll create your CA key in this directory and then reference the key when generating node and client certificates. After that, you'll keep the key safe and secret; you will not upload it to your nodes.

2. Create the ca.cnf file:

    We recommend that you use the CockroachDB default value of the CA certificate expiration period, which is 3660 days. You can set the CA certificate expiration period using the `default_days` parameter.

    {% include copy-clipboard.html %}
    ~~~ shell
    # OpenSSL CA configuration file
    [ ca ]
    default_ca = CA_default

    [ CA_default ]
    default_days = 3660
    database = index.txt
    serial = serial.txt 
    default_md = sha256 
    copy_extensions = copy

    # Used to create the CA certificate.
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

    {{site.data.alerts.callout_info}}The <code>keyUsage</code> and <code>extendedkeyUsage</code> parameters are vital for CockroachDB functions. You can modify or leave out other parameters as per your preferred OpenSSL configuration, but do not leave out the <code>keyUsage</code> and <code>extendedkeyUsage</code> parameters. {{site.data.alerts.end}}
  
3. Create the CA key using the [`openssl genrsa`](https://wiki.openssl.org/index.php/Manual:Genrsa(1)) command:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ openssl genrsa -out my-safe-directory/ca.key 2048 
    $ chmod 400 my-safe-directory/ca.key
    ~~~

4. Create the CA certificate using the [`openssl req`](https://wiki.openssl.org/index.php/Manual:Req(1)) command:

    {% include copy-clipboard.html %}
    ~~~ shell
    # Create CA certificate.
    $ openssl req \
      -new \
      -x509 \
      -config ca.cnf \
      -key my-safe-directory/ca.key \
      -out certs/ca.crt \
      -days 3660 \
      -batch

    # Reset database and index files.
    $ rm -f index.txt serial.txt
    $ touch index.txt
    $ echo '01' > serial.txt
    ~~~

### Create the certificate and key pairs for nodes

1. Create the node.cnf file for the first node:

    {% include copy-clipboard.html %}
    ~~~ shell
    # OpenSSL node configuration file
    [ req ]
    prompt=no
    distinguished_name = distinguished_name
    req_extensions = extensions

    [ distinguished_name ]
    organizationName = Cockroach
    commonName = node

    [ extensions ]
    subjectAltName = DNS:<node-hostname>,DNS:<node-domain>,IP:<IP Address>
    ~~~

    {{site.data.alerts.callout_info}}The <code>commonName</code> and <code>subjectAltName</code> parameters are vital for CockroachDB functions. It is also important that <code>commonName</code> be set to <code>node</code>. You can modify or leave out other parameters as per your preferred OpenSSL configuration, but do not leave out the <code>commonName</code> and <code>subjectAltName</code> parameters.  {{site.data.alerts.end}}
  

2. Create the key for the first node using the [`openssl genrsa`](https://wiki.openssl.org/index.php/Manual:Genrsa(1)) command:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ openssl genrsa -out certs/node.key 2048 
    $ chmod 400 certs/node.key
    ~~~

3. Create the CSR for the first node using the [`openssl req`](https://wiki.openssl.org/index.php/Manual:Req(1)) command:

    {% include copy-clipboard.html %}
    ~~~ shell
    # Create Node certificate signing request.
    $ openssl req \
      -new \
      -config node.cnf \
      -key certs/node.key \
      -out node.csr \
      -batch
    ~~~

4. Sign the node CSR to create the node certificate for the first node using the [`openssl ca`](https://wiki.openssl.org/index.php/Manual:Ca(1)) command. 

    We recommend that you use the CockroachDB default value of the node certificate expiration period, which is 1830 days. You can set the CA certificate expiration period using the `days` flag.

    {% include copy-clipboard.html %}
    ~~~ shell
    # Sign the CSR using the CA key.
    $ openssl ca \
      -config ca.cnf \
      -keyfile my-safe-directory/ca.key \
      -cert certs/ca.crt \
      -policy signing_policy \
      -extensions signing_node_req \
      -out certs/node.crt \
      -outdir certs/ \
      -in node.csr \
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

1. Create the client.cnf file for the first client:

    {% include copy-clipboard.html %}
    ~~~ shell
    # OpenSSL client configuration file
    [ req ]
    prompt=no
    distinguished_name = distinguished_name

    [ distinguished_name ]
    organizationName = Cockroach
    commonName = <username>
    ~~~

    {{site.data.alerts.callout_info}}The <code>commonName</code> parameter is vital for CockroachDB functions. You can modify or leave out other parameters as per your preferred OpenSSL configuration, but do not leave out the <code>commonName</code> parameter.  {{site.data.alerts.end}}
  

2. Create the key for the first client using the [`openssl genrsa`](https://wiki.openssl.org/index.php/Manual:Genrsa(1)) command:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ openssl genrsa -out certs/client.<username>.key 2048 
    $ chmod 400 certs/client.<username>.key
    ~~~

3. Create the CSR for the first client using the [`openssl req`](https://wiki.openssl.org/index.php/Manual:Req(1)) command:

    {% include copy-clipboard.html %}
    ~~~ shell
    # Create client certificate signing request
    $ openssl req \
      -new \
      -config client.cnf \
      -key certs/client.maxroach.key \
      -out certs/client.maxroach.csr \
      -batch
    ~~~

4. Sign the client CSR to create the client certificate for the first client using the [`openssl ca`](https://wiki.openssl.org/index.php/Manual:Ca(1)) command:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ openssl ca \
      -config ca.cnf \
      -keyfile my-safe-directory/ca.key \
      -cert certs/ca.crt \
      -policy signing_policy \
      -extensions signing_client_req \
      -out certs/client.maxroach.crt \
      -outdir certs/ \
      -in certs/client.maxroach.csr \
      -days 1830 \
      -batch
    ~~~    

5. Upload certificates to the first client using your preferred method. 

6. Repeat steps 1 - 5 for each additional client.


## See Also

- [Manual Deployment](manual-deployment.html): Walkthrough starting a multi-node secure cluster and accessing it from a client.
- [Start a Node](start-a-node.html): Learn more about the flags you pass when adding a node to a secure cluster.
