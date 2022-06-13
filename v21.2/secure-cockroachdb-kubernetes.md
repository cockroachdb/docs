---
title: Certificate management
summary: How to authenticate a secure 3-node CockroachDB cluster with Kubernetes.
toc: true
toc_not_nested: true
secure: true
docs_area: deploy
---

{{site.data.alerts.callout_info}}
This article assumes you have already [deployed CockroachDB securely on a single Kubernetes cluster](deploy-cockroachdb-with-kubernetes.html) using the Operator or Helm. However, it's possible to configure these settings before starting CockroachDB on Kubernetes.
{{site.data.alerts.end}}

By default, self-signed certificates are used when using the Operator or Helm to securely [deploy CockroachDB on Kubernetes](deploy-cockroachdb-with-kubernetes.html).

This page explains how to:

- Authenticate an Operator or Helm deployment using a [custom CA](#use-a-custom-ca)
- [Rotate security certificates](#rotate-security-certificates)
- [Secure the webhooks](#secure-the-webhooks) (Operator)

{{site.data.alerts.callout_danger}}
If you are running a secure Helm deployment on Kubernetes 1.22 and later, you must migrate away from using the Kubernetes CA for cluster authentication. For details, see [Migration to self-signer](#migration-to-self-signer).
{{site.data.alerts.end}}

<div class="filters filters-big clearfix">
    <button class="filter-button" data-scope="operator">Operator</button>
    <button class="filter-button" data-scope="helm">Helm</button>
</div>

{% include {{ page.version.version }}/orchestration/operator-check-namespace.md %}

## Use a custom CA

<section class="filter-content" markdown="1" data-scope="operator">
By default, the Operator will generate and sign 1 client and 1 node certificate to secure the cluster.

To use your own certificate authority instead, add the following to the Operator's custom resource **before** [initializing the cluster](deploy-cockroachdb-with-kubernetes.html#initialize-the-cluster):

~~~ yaml
spec:
  nodeTLSSecret: {node secret name}
  clientTLSSecret: {client secret name}
~~~

These should specify the names of Kubernetes secrets that contain your generated certificates and keys:

- `clientTLSSecret` specifies the client secret name.
- `nodeTLSSecret` specifies the node secret name.

{{site.data.alerts.callout_info}}
Currently, the Operator requires that the client and node secrets each contain the filenames `tls.crt` and `tls.key`.
{{site.data.alerts.end}}

{% include {{ page.version.version }}/orchestration/apply-custom-resource.md %}
</section>

<section class="filter-content" markdown="1" data-scope="helm">
By default on secure deployments, the Helm chart will generate and sign 1 client and 1 node certificate to secure the cluster. 

To use your own certificate authority instead, specify the following in the custom values file you created when [deploying the cluster](deploy-cockroachdb-with-kubernetes.html?filters=helm#step-2-start-cockroachdb):

{% include_cached copy-clipboard.html %}
~~~ yaml
tls:
  enabled: true
  certs:
    provided: true
    clientRootSecret: {client secret name}
    nodeSecret: {node secret name}
~~~

`clientRootSecret` and `nodeSecret` should specify the names of Kubernetes secrets that contain your generated certificates and keys:

- `clientRootSecret` specifies the client secret name.
- `nodeSecret` specifies the node secret name.

{% include {{ page.version.version }}/orchestration/apply-helm-values.md %}
</section>

### Example: Authenticating with `cockroach cert`

{{site.data.alerts.callout_info}}
The below steps use [`cockroach cert` commands](cockroach-cert.html) to quickly generate and sign the CockroachDB node and client certificates. Read our [Authentication](authentication.html#using-digital-certificates-with-cockroachdb) docs to learn about other methods of signing certificates.
{{site.data.alerts.end}}

<section class="filter-content" markdown="1" data-scope="operator">
{{site.data.alerts.callout_info}}
Complete the following steps **before** [initializing the cluster](deploy-cockroachdb-with-kubernetes.html#initialize-the-cluster).
{{site.data.alerts.end}}

1. Create two directories:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ mkdir certs my-safe-directory
    ~~~

    Directory | Description
    ----------|------------
    `certs` | You'll generate your CA certificate and all node and client certificates and keys in this directory.
    `my-safe-directory` | You'll generate your CA key in this directory and then reference the key when generating node and client certificates.

1. Create the CA certificate and key pair:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-ca \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

1. Create a client certificate and key pair for the root user:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-client \
    root \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

1. Upload the client certificate and key to the Kubernetes cluster as a secret, renaming them to the filenames required by the Operator:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl create secret \
    generic cockroachdb.client.root \
    --from-file=tls.key=certs/client.root.key \
    --from-file=tls.crt=certs/client.root.crt \
    --from-file=ca.crt=certs/ca.crt
    ~~~

    ~~~
    secret/cockroachdb.client.root created
    ~~~

1. Create the certificate and key pair for your CockroachDB nodes, specifying the namespace you used when [deploying the cluster](deploy-cockroachdb-with-kubernetes.html#initialize-the-cluster). This example uses the Operator's default namespace (`cockroach-operator-system`):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach cert create-node \
    localhost 127.0.0.1 \
    cockroachdb-public \
    cockroachdb-public.cockroach-operator-system \
    cockroachdb-public.cockroach-operator-system.svc.cluster.local \
    *.cockroachdb \
    *.cockroachdb.cockroach-operator-system \
    *.cockroachdb.cockroach-operator-system.svc.cluster.local \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

1. Upload the node certificate and key to the Kubernetes cluster as a secret, renaming them to the filenames required by the Operator:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl create secret \
    generic cockroachdb.node \
    --from-file=tls.key=certs/node.key \
    --from-file=tls.crt=certs/node.crt \
    --from-file=ca.crt=certs/ca.crt
    ~~~

    ~~~
    secret/cockroachdb.node created
    ~~~

1. Check that the secrets were created on the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get secrets
    ~~~

    ~~~
    NAME                      TYPE                                  DATA   AGE
    cockroachdb.client.root   Opaque                                3      13s
    cockroachdb.node          Opaque                                3      3s
    default-token-6js7b       kubernetes.io/service-account-token   3      9h
    ~~~

1. Add `nodeTLSSecret` and `clientTLSSecret` to the Operator's [custom resource](deploy-cockroachdb-with-kubernetes.html#initialize-the-cluster), specifying the generated secret names:

    ~~~ yaml
    spec:
      clientTLSSecret: cockroachdb.client.root
      nodeTLSSecret: cockroachdb.node
    ~~~
</section>

<section class="filter-content" markdown="1" data-scope="helm">
1. Create two directories:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ mkdir certs my-safe-directory
    ~~~

    Directory | Description
    ----------|------------
    `certs` | You'll generate your CA certificate and all node and client certificates and keys in this directory.
    `my-safe-directory` | You'll generate your CA key in this directory and then reference the key when generating node and client certificates.

1. Create the CA certificate and key pair:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-ca \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

1. Create a client certificate and key pair for the root user:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-client \
    root \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

1. Upload the client certificate and key to the Kubernetes cluster as a secret:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl create secret \
    generic cockroachdb.client.root \
    --from-file=certs
    ~~~

    ~~~
    secret/cockroachdb.client.root created
    ~~~

1. Create the certificate and key pair for your CockroachDB nodes:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-node \
    localhost 127.0.0.1 \
    my-release-cockroachdb-public \
    my-release-cockroachdb-public.default \
    my-release-cockroachdb-public.default.svc.cluster.local \
    *.my-release-cockroachdb \
    *.my-release-cockroachdb.default \
    *.my-release-cockroachdb.default.svc.cluster.local \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

    {{site.data.alerts.callout_info}}
    This example assumes that you followed our [deployment example](deploy-cockroachdb-with-kubernetes.html?filters=helm), which uses `my-release` as the release name. If you used a different value, be sure to adjust the release name in this command.
    {{site.data.alerts.end}}

1. Upload the node certificate and key to the Kubernetes cluster as a secret:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl create secret \
    generic cockroachdb.node \
    --from-file=certs
    ~~~

    ~~~
    secret/cockroachdb.node created
    ~~~

1. Check that the secrets were created on the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get secrets
    ~~~

    ~~~
    NAME                      TYPE                                  DATA   AGE
    cockroachdb.client.root   Opaque                                3      41m
    cockroachdb.node          Opaque                                5      14s
    default-token-6qjdb       kubernetes.io/service-account-token   3      4m
    ~~~

1. Specify the following in the custom values file you created when [deploying the cluster](deploy-cockroachdb-with-kubernetes.html?filters=helm#step-2-start-cockroachdb), using the generated secret names:

    {% include_cached copy-clipboard.html %}
    ~~~
    tls:
      enabled: true
      certs:
        provided: true
	    clientRootSecret: cockroachdb.client.root
	    nodeSecret: cockroachdb.node
    ~~~

1. Apply the custom values to override the default Helm chart [values](https://github.com/cockroachdb/helm-charts/blob/master/cockroachdb/values.yaml):

	{% include_cached copy-clipboard.html %}
    ~~~ shell
    $ helm upgrade {release-name} --values {custom-values}.yaml cockroachdb/cockroachdb
    ~~~
</section>

## Rotate security certificates

You may need to rotate the node, client, or CA certificates in the following scenarios:

- The node, client, or CA certificates are expiring soon.
- Your organization's compliance policy requires periodic certificate rotation.
- The key (for a node, client, or CA) is compromised.
- You need to modify the contents of a certificate, for example, to add another DNS name or the IP address of a load balancer through which a node can be reached. In this case, you would need to rotate only the node certificates.

### Example: Rotating certificates signed with `cockroach cert`

<section class="filter-content" markdown="1" data-scope="operator">
If you previously [authenticated with `cockroach cert`](#example-authenticating-with-cockroach-cert), follow these steps to rotate the certificates using the same CA:

1. Create a new client certificate and key pair for the root user, overwriting the previous certificate and key:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-client \
    root \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key \
    --overwrite
    ~~~

1. Upload the new client certificate and key to the Kubernetes cluster as a **new** secret, renaming them to the filenames required by the Operator:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl create secret \
    generic cockroachdb.client.root.2 \
    --from-file=tls.key=certs/client.root.key \
    --from-file=tls.crt=certs/client.root.crt \
    --from-file=ca.crt=certs/ca.crt
    ~~~

    ~~~
    secret/cockroachdb.client.root created
    ~~~

1. Create a new certificate and key pair for your CockroachDB nodes, overwriting the previous certificate and key. Specify the namespace you used when [deploying the cluster](deploy-cockroachdb-with-kubernetes.html#initialize-the-cluster). This example uses the Operator's default namespace (`cockroach-operator-system`):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach cert create-node \
    localhost 127.0.0.1 \
    cockroachdb-public \
    cockroachdb-public.cockroach-operator-system \
    cockroachdb-public.cockroach-operator-system.svc.cluster.local \
    *.cockroachdb \
    *.cockroachdb.cockroach-operator-system \
    *.cockroachdb.cockroach-operator-system.svc.cluster.local \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key \
    --overwrite
    ~~~

1. Upload the new node certificate and key to the Kubernetes cluster as a **new** secret, renaming them to the filenames required by the Operator:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl create secret \
    generic cockroachdb.node.2 \
    --from-file=tls.key=certs/node.key \
    --from-file=tls.crt=certs/node.crt \
    --from-file=ca.crt=certs/ca.crt
    ~~~

    ~~~
    secret/cockroachdb.node created
    ~~~

1. Add `nodeTLSSecret` and `clientTLSSecret` to the Operator's [custom resource](deploy-cockroachdb-with-kubernetes.html#initialize-the-cluster), specifying the new secret names:

    ~~~ yaml
    spec:
      clientTLSSecret: cockroachdb.client.root.2
      nodeTLSSecret: cockroachdb.node.2
    ~~~

1. Check that the secrets were created on the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get secrets
    ~~~

    ~~~
    NAME                        TYPE                                  DATA   AGE
    cockroachdb.client.root.2   Opaque                                3      4s
    cockroachdb.node.2          Opaque                                3      1s
    default-token-6js7b         kubernetes.io/service-account-token   3      9h
    ~~~

    {{site.data.alerts.callout_info}}
    Remember that `nodeTLSSecret` and `clientTLSSecret` in the Operator's [custom resource](deploy-cockroachdb-with-kubernetes.html#initialize-the-cluster) must specify these secret names. For details, see [Use a custom CA](#use-a-custom-ca).
    {{site.data.alerts.end}}

1. Apply the new settings to the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl apply -f example.yaml
    ~~~

    The pods will terminate and restart one at a time, using the new certificates.

1. You can observe this process:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods
    ~~~

    ~~~
    NAME                                  READY   STATUS        RESTARTS   AGE
    cockroach-operator-655fbf7847-lvz6x   1/1     Running       0          4h29m
    cockroachdb-0                         1/1     Running       0          4h16m
    cockroachdb-1                         1/1     Terminating   0          4h16m
    cockroachdb-2                         1/1     Running       0          43s
    ~~~

1. Delete the existing client secret that is no longer in use:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl delete secret cockroachdb.client.root
    ~~~

    ~~~
    secret "cockroachdb.client.root" deleted
    ~~~

1. Delete the existing node secret that is no longer in use:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl delete secret cockroachdb.node
    ~~~

    ~~~
    secret "cockroachdb.node" deleted
    ~~~
</section>

<section class="filter-content" markdown="1" data-scope="helm">
The Helm chart includes [values](https://github.com/cockroachdb/helm-charts/blob/master/cockroachdb/values.yaml) to configure a Kubernetes [cron job](https://kubernetes.io/docs/tasks/job/automated-tasks-with-cron-jobs/) that regularly rotates certificates before they expire.

If you previously [authenticated with `cockroach cert`](#example-authenticating-with-cockroach-cert), follow these steps to ensure the certificates are rotated:

1. Upload the CA certificate that you previously created to the Kubernetes cluster as a secret:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl create secret \
    generic cockroachdb.ca \
    --from-file=certs/ca.crt
    ~~~

    ~~~
    secret/cockroachdb.ca created
    ~~~

1. Specify the following in the custom values file you created when [deploying the cluster](deploy-cockroachdb-with-kubernetes.html?filters=helm#step-2-start-cockroachdb), using the generated secret name:

    {% include_cached copy-clipboard.html %}
    ~~~ yaml
    selfSigner:
      enabled: true
      caProvided: true
      caSecret: cockroachdb.ca
      rotateCerts: true
    ~~~

    {{site.data.alerts.callout_info}}
    `selfSigner.enabled` and `selfSigner.rotateCerts` are `true` by default in the Helm chart [values](https://github.com/cockroachdb/helm-charts/blob/master/cockroachdb/values.yaml).
    {{site.data.alerts.end}}

1. Customize the following `selfSigner` fields to set the frequency of certificate rotation. These should correspond to the durations of the CA, client, and node certificates.

    {% include_cached copy-clipboard.html %}
    ~~~ yaml
    selfSigner:
      minimumCertDuration: 624h
      caCertDuration: 43800h
      caCertExpiryWindow: 648h
      clientCertDuration: 672h
      clientCertExpiryWindow: 48h
      nodeCertDuration: 8760h
      nodeCertExpiryWindow: 168h
    ~~~

    <ul>
        <li><code>caCertDuration</code>, <code>clientCertDuration</code>, and <code>nodeCertDuration</code> specify the duration in hours of the CA, client, and node certificates, respectively.</li>
        <li><code>caCertExpiryWindow</code>, <code>clientCertExpiryWindow</code>, and <code>nodeCertExpiryWindow</code> specify the timeframe in hours during which the CA, client, and node certificates, respectively, should be rotated before they expire.</li>
        <li><code>minimumCertDuration</code> specifies the minimum duration in hours for all certificates. This is to ensure that the client and node certificates are rotated within the duration of the CA certificate. This value must be less than:
            <ul><li><code>cacertExpiryWindow</code></li>
                <li>The difference of <code>clientCertDuration</code> and <code>clientExpiryWindow</code></li>
                <li>The difference of <code>nodeCertDuration</code> and <code>nodeCertExpiryWindow</code></li>
            </ul>
    </ul>

    Certificate duration is configured when running [`cockroach cert`](cockroach-cert.html#general). You can check the expiration dates of the `cockroach cert` certificates by running:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach cert list --certs-dir=certs
    ~~~

    ~~~
    Certificate directory: certs
      Usage  | Certificate File |    Key File     |  Expires   |                                                                                                                                  Notes                                                                                                                                  | Error
    ---------+------------------+-----------------+------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+--------
      CA     | ca.crt           |                 | 2031/09/07 | num certs: 1                                                                                                                                                                                                                                                            |
      Node   | node.crt         | node.key        | 2026/09/03 | addresses: localhost,my-release-cockroachdb-public,my-release-cockroachdb-public.default,my-release-cockroachdb-public.default.svc.cluster.local,*.my-release-cockroachdb,*.my-release-cockroachdb.default,*.my-release-cockroachdb.default.svc.cluster.local,127.0.0.1 |
      Client | client.root.crt  | client.root.key | 2026/09/03 | user: root                                                                                                                                                                                                                                                              |
    ~~~

1. Apply the custom values to override the default Helm chart [values](https://github.com/cockroachdb/helm-charts/blob/master/cockroachdb/values.yaml):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ helm upgrade {release-name} --values {custom-values}.yaml cockroachdb/cockroachdb
    ~~~

    The certificates will be rotated during the specified expiry windows.

## Migration to self-signer

Previous versions of the Helm chart used the Kubernetes CA to sign certificates. However, the Kubernetes CA is deprecated from Kubernetes 1.22 and later. The Helm chart now uses a self-signer for cluster authentication.

To migrate your Helm deployment to use the self-signer:

1. Set the cluster's upgrade strategy to `OnDelete`, which specifies that only pods deleted by the user will be upgraded.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    helm upgrade {release-name} cockroachdb/cockroachdb --set statefulset.updateStrategy.type="OnDelete"
    ~~~

1. Confirm that the `init` pod has been created:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods
    ~~~

    ~~~
    NAME                                READY     STATUS     RESTARTS   AGE
    my-release-cockroachdb-0            1/1       Running    0          6m
    my-release-cockroachdb-1            1/1       Running    0          6m
    my-release-cockroachdb-2            1/1       Running    0          6m
    my-release-cockroachdb-init-59ndf   0/1       Completed  0          8s
    ~~~

1. Delete the cluster pods to start the upgrade process.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl delete pods -l app.kubernetes.io/component=cockroachdb
    ~~~

    ~~~
    pod "my-release-cockroachdb-0" deleted
    pod "my-release-cockroachdb-1" deleted
    pod "my-release-cockroachdb-2" deleted
    ~~~

    All pods will be restarted with new certificates generated by the self-signer. Note that this is not a rolling upgrade, so the cluster will experience some downtime. You can monitor this process:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods
    ~~~

    ~~~
    NAME                       READY   STATUS              RESTARTS   AGE
    my-release-cockroachdb-0   0/1     ContainerCreating   0          14s
    my-release-cockroachdb-1   0/1     ContainerCreating   0          4s
    my-release-cockroachdb-2   0/1     Terminating         0          7m16s
    ~~~
</section>

<section class="filter-content" markdown="1" data-scope="operator">
## Secure the webhooks

The Operator ships with both [mutating](https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/#mutatingadmissionwebhook) and [validating](https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/#validatingadmissionwebhook) webhooks. Communication between the Kubernetes API server and the webhook service must be secured with TLS.

By default, the Operator searches for the TLS secret `cockroach-operator-webhook-ca`, which contains a CA certificate. If the secret is not found, the Operator auto-generates `cockroach-operator-webhook-ca` with a CA certificate for future runs.

The Operator then generates a one-time server certificate for the webhook server that is signed with `cockroach-operator-webhook-ca`. Finally, the CA bundle for both mutating and validating webhook configurations is patched with the CA certificate.

You can also use your own certificate authority rather than `cockroach-operator-webhook-ca`. Both the certificate and key files you generate must be PEM-encoded. See the following [example](#example-using-openssl-to-secure-the-webhooks).

### Example: Using OpenSSL to secure the webhooks

These steps demonstrate how to use the [`openssl genrsa`](https://www.openssl.org/docs/manmaster/man1/genrsa.html) and [`openssl req`](https://www.openssl.org/docs/manmaster/man1/req.html) subcommands to secure the webhooks on a running Kubernetes cluster:

1. Generate a 4096-bit RSA private key:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    openssl genrsa -out tls.key 4096
    ~~~

1. Generate an X.509 certificate, valid for 10 years. You will be prompted for the certificate field values.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    openssl req -x509 -new -nodes -key tls.key -sha256 -days 3650 -out tls.crt
    ~~~

1. Create the secret, making sure that [you are in the correct namespace](deploy-cockroachdb-with-kubernetes.html#install-the-operator):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl create secret tls cockroach-operator-webhook-ca --cert=tls.crt --key=tls.key
    ~~~

    ~~~
    secret/cockroach-operator-webhook-ca created
    ~~~

1. Remove the certificate and key from your local environment:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    rm tls.crt tls.key
    ~~~

1. Roll the Operator deployment to ensure a new server certificate is generated:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl rollout restart deploy/cockroach-operator-manager
    ~~~

    ~~~
    deployment.apps/cockroach-operator-manager restarted
    ~~~
</section>