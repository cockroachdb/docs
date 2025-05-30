---
title: Take and Restore Encrypted Backups
summary: Learn about the advanced options you can use when you backup and restore a CockroachDB cluster.
toc: true
docs_area: manage
---

This page provides information about how to take and restore encrypted backups in the following ways:

- [Using AWS Key Management Service (KMS)](#aws-kms-uri-format)
- [Using Google Cloud Key Management Service (KMS)](#google-cloud-kms-uri-format)
- [Using Azure Key Vault](#azure-key-vault-uri-format)
- [Using a passphrase](#use-a-passphrase)

{% include {{ page.version.version }}/backups/support-products.md %}

## Use Key Management Service

You can encrypt [full or incremental backups]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}) with AWS KMS, Google Cloud KMS, or Azure Key Vault by using the [`kms` option]({% link {{ page.version.version }}/backup.md %}#options).

During the [backup process]({% link {{ page.version.version }}/backup-architecture.md %}), a cryptographically secure 32-byte (256-bit) key is generated. Individual data files are encrypted with the backup-specific random key using AES-GCM-256. This backup-specific random key is then encrypted using the Key Management Service (KMS) APIs provided by the relevant cloud provider—AWS KMS, Google Cloud KMS, or Azure Key Vault. The resulting encrypted version of the random key is then stored within the backup metadata in the `ENCRYPTION_INFO` file.

Note that the encryption algorithm for the random key is determined by the specific cloud provider. [AWS](https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html#symmetric-cmks) and [GCP](https://cloud.google.com/kms/docs/algorithms#symmetric_encryption_algorithms) use symmetric encryption with [AES-GCM-256](https://en.wikipedia.org/wiki/Galois/Counter_Mode). [Azure](https://learn.microsoft.com/en-us/azure/security/fundamentals/encryption-atrest) uses asymmetric encryption with RSA-OAEP-256.

During a restore job, CockroachDB retrieves the encrypted random key from the backup metadata and attempts to decrypt it using the KMS URI specified in the [`RESTORE`]({% link {{ page.version.version }}/restore.md %}) statement. Once successfully decrypted, CockroachDB uses this key to decrypt the [`BACKUP`]({% link {{ page.version.version }}/backup.md %}) manifest and data files. Similarly, the same KMS URI is required for decrypting the files when listing the backup contents using [`SHOW BACKUP`]({% link {{ page.version.version }}/show-backup.md %}).

When incremental backups are in use, the `kms` option is applied to all backup file URLs. Therefore, each incremental backup must include at least one of the KMS URIs used during the full backup. This subset can consist of any combination of the original URIs, but you cannot introduce new KMS URIs. Likewise, when taking [locality-aware backups](#locality-aware-backup-with-kms-encryption), the specified KMS URI is applied to files across all localities.

### Generate a KMS key

Before you can use a KMS to encrypt a CockroachDB backup, you must first generate a **KMS key**. This is the key generated by the cloud provider and it never leaves the KMS. It contains key-related metadata and key material to encrypt/decrypt other data. The key material can never be exported, deleted, or extracted. CockroachDB expects the key to be symmetric (256 bit).

### Locality-aware backup with kms encryption

CockroachDB also supports [kms encryption](#take-a-locality-aware-backup-with-kms-encryption) for your locality-aware backup. At the time of `BACKUP`, you can [provide multiple KMS URIs](#aws-kms-uri-format), each referencing a KMS key in a different region. This allows CockroachDB to save multiple versions of the encrypted data key used to encrypt the backup data, one per KMS URI. With these encrypted versions of the data key stored alongside the encrypted backup data, a user can `RESTORE` the encrypted data using any one of the KMS URIs that were supplied during backup. In the case of a single KMS region outage, the data can be decrypted with any of the KMS keys from the other regions.

### Add a new KMS key to an existing backup

To add a new KMS key to an existing backup, use the [`ALTER BACKUP`]({% link {{ page.version.version }}/alter-backup.md %}) statement. `ALTER BACKUP` allows for new KMS encryption keys to be applied to an existing chain of encrypted backups (full and incremental). Once completed, subsequent `BACKUP`, `RESTORE`, and [`SHOW BACKUP`]({% link {{ page.version.version }}/show-backup.md %}) statements can use any of the existing or new KMS URIs to decrypt the backup.

For examples on adding a new KMS key to an existing backup, see the [`ALTER BACKUP` examples]({% link {{ page.version.version }}/alter-backup.md %}#examples).

### URI formats

#### AWS KMS URI format

The AWS KMS URI must use the following format:

~~~
aws:///{key}?AUTH={auth_type>}&REGION={region}
~~~

The AWS URI **requires** the following:

 Component                  | Description
----------------------------+------------------------------------------------------------------------
`aws:///`                   | The AWS scheme. Note the triple slash (`///`).
`{key}`                     | The key identifiers used to reference the KMS key that should be used to encrypt or decrypt. For information about the supported formats, see the [AWS KMS docs](https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html#key-id).
`AUTH=<auth_type>`          | The user-specified credentials. If you use `AUTH=specified`, you must provide access keys in the URI parameters (e.g., `AWS_ACCESS_KEY_ID=<key_id>&AWS_SECRET_ACCESS_KEY=<secret_key>`). If you use `AUTH=implicit`, the access keys can be omitted and the [credentials will be loaded from the environment](https://docs.aws.amazon.com/sdk-for-go/api/aws/session/). For details on setting up and using the different authentication types, see [Authentication]({% link {{ page.version.version }}/cloud-storage-authentication.md %}).
`REGION=<region>`           | The region of the KMS key.
(optional) `AWS_ENDPOINT` | A custom endpoint for Amazon S3. Use to define a particular region or a Virtual Private Cloud (VPC) endpoint. Use with `specified` or `implicit` [authentication]({% link {{ page.version.version }}/cloud-storage-authentication.md %}).

See AWS's [KMS keys](https://docs.aws.amazon.com/kms/latest/developerguide/create-keys.html) documentation for guidance on creating an AWS KMS key.

#### Azure Key Vault URI format

The Azure Key Vault URI must use one of two formats:

- Explicit authentication using the `AUTH=specified` parameter (or omitting this, as it is the default option) with the tenant ID, client ID, client secret, and key vault name parameters:

    ~~~
    azure-kms:///{key}/{key version}?AZURE_TENANT_ID={tenant ID}&AZURE_CLIENT_ID={client ID}&AZURE_CLIENT_SECRET={client secret}&AZURE_VAULT_NAME={key vault name}
    ~~~

- Implicit authentication with the `AUTH=implicit` and key vault name parameters:

    ~~~
    azure-kms:///{key}/{key version}?AUTH=implicit&AZURE_VAULT_NAME={key vault name}
    ~~~

    See [Cloud Storage Authentication]({% link {{ page.version.version }}/cloud-storage-authentication.md %}?filters=azure#azure-blob-storage-implicit-authentication) for more detail on `implicit` authentication.

The Azure Key Vault URI uses the following parameters:

 Component                  | Description
----------------------------+------------------------------------------------------------------------
`azure-kms:///`             | The Azure scheme. Note the triple slash (`///`).
`{key}`                     | Name of the key stored in your key vault.
`{key version}`             | Current version of the key in your key vault.
`AZURE_TENANT_ID={tenant ID}` | Directory (tenant) ID for your App Registration. (This is not required for `implicit` authentication.)
`AZURE_CLIENT_ID={client ID}` | Application (client) ID for your App Registration. (This is not required for `implicit` authentication.)
`AZURE_CLIENT_SECRET={client secret}` | Client credentials secret generated for your App Registration. (This is not required for `implicit` authentication.)
`AZURE_VAULT_NAME={key vault name}` | Name of your key vault.

To run an encrypted Azure backup, it is necessary to create the following:

- [Azure Key Vault](https://learn.microsoft.com/azure/key-vault/general/overview) to generate and store your keys. See Microsoft's quickstart to [Create a key vault using the Azure portal](https://learn.microsoft.com/azure/key-vault/general/quick-create-portal).
- Azure App Registration to manage role-based access control. See Microsoft's [Register an application with the Microsoft identity platform](https://learn.microsoft.com/azure/active-directory/develop/quickstart-register-app#register-an-application) to register an application.

Once you have created your App Registration you must assign it permissions to your key vault. To complete a successful encrypted backup, your App Registration needs the following permissions:

~~~json
"dataActions": [
    "Microsoft.KeyVault/vaults/keys/encrypt/action",
    "Microsoft.KeyVault/vaults/keys/decrypt/action"
]
~~~

Follow Microsoft's [Assign a Key Vault access policy](https://learn.microsoft.com/en-us/azure/key-vault/general/assign-access-policy?tabs=azure-portal) tutorial for instructions.

#### Google Cloud KMS URI format

The Google Cloud KMS URI must use the following format:

~~~
gs:///projects/{project name}/locations/{location}/keyRings/{key ring name}/cryptoKeys/{key name}?AUTH={auth_type}
~~~

The Google Cloud URI **requires** the following:

 Component                  | Description
----------------------------+------------------------------------------------------------------------
`gs:///`                    | The Google Cloud scheme. Note the triple slash (`///`).
`projects/{project name}`   | The name of the project that will hold the objects to encrypt.
`locations/{location}`      | The location specified at key creation.
`keyRings/{key ring}`       | The Google Cloud key ring created to group keys.
`cryptoKeys/{key name}`     | The name of the key.
`AUTH=<auth_type>`          | The user-specified credentials. If you use `AUTH=specified`, then you must include `&CREDENTIALS=` with your base-64 encoded key. To load credentials from your environment, use `AUTH=implicit`. For details on setting up and using the different authentication types, see [Authentication]({% link {{ page.version.version }}/cloud-storage-authentication.md %}).

See Google Cloud's [customer-managed encryption key](https://cloud.google.com/storage/docs/encryption/using-customer-managed-keys) documentation for guidance on creating a KMS key.

### Examples

The following examples provide connection strings to Amazon S3 and Google Cloud Storage. For guidance using other authentication parameters, read Use Cloud Storage for Bulk Operations.

<div class="filters clearfix">
  <button class="filter-button" data-scope="s3">AWS</button>
  <button class="filter-button" data-scope="azure">Azure</button>
  <button class="filter-button" data-scope="gcs">Google Cloud</button>
</div>

<section class="filter-content" markdown="1" data-scope="s3">

#### Take an encrypted Amazon S3 backup

To take an encrypted backup with AWS KMS, use the `kms` [option]({% link {{ page.version.version }}/backup.md %}#options):

{% include_cached copy-clipboard.html %}
~~~ sql
BACKUP INTO 's3://{BUCKET NAME}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}'
    WITH kms = 'aws:///{key}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}&REGION=us-east-1';
~~~

#### Take a locality-aware backup with kms encryption

To take a [locality-aware backup]({% link {{ page.version.version }}/take-and-restore-locality-aware-backups.md %}) with kms encryption, use the `kms` option to specify a comma-separated list of KMS URIs:

{% include_cached copy-clipboard.html %}
~~~ sql
BACKUP INTO 's3://{BUCKET NAME}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}'
    WITH KMS=(
      'aws:///{key}?AUTH=implicit&REGION=us-east-1',
      'aws:///{key}?AUTH=implict&REGION=us-west-1'
    );
~~~

#### Show a locality-aware backup with kms encryption

To view a [kms encrypted locality-aware backup](#use-key-management-service), use the `kms` option and the same KMS URIs that were used to create the backup:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW BACKUP FROM '2023/07/14-211406.03' IN 's3://{BUCKET NAME}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}'
    WITH KMS=(
      'aws:///{key}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}&REGION=us-east-1',
      'aws:///{key}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}&REGION=us-west-1'
    );
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
database_name | parent_schema_name |      object_name       | object_type | backup_type | start_time |          end_time          | size_bytes | rows | is_full_cluster | regions
----------------+--------------------+------------------------+-------------+-------------+------------+----------------------------+------------+------+-----------------+----------
  NULL          | NULL               | system                 | database    | full        | NULL       | 2023-07-14 21:14:06.031943 |       NULL | NULL |        t        | NULL
  system        | public             | users                  | table       | full        | NULL       | 2023-07-14 21:14:06.031943 |        136 |    2 |        t        | NULL
  system        | public             | zones                  | table       | full        | NULL       | 2023-07-14 21:14:06.031943 |        338 |   13 |        t        | NULL
  system        | public             | settings               | table       | full        | NULL       | 2023-07-14 21:14:06.031943 |        373 |    5 |        t        | NULL
  system        | public             | ui                     | table       | full        | NULL       | 2023-07-14 21:14:06.031943 |          0 |    0 |        t        | NULL
  system        | public             | locations              | table       | full        | NULL       | 2023-07-14 21:14:06.031943 |        261 |    5 |        t        | NULL
  system        | public             | role_members           | table       | full        | NULL       | 2023-07-14 21:14:06.031943 |        217 |    1 |        t        | NULL
  system        | public             | comments               | table       | full        | NULL       | 2023-07-14 21:14:06.031943 |          0 |    0 |        t        | NULL
  system        | public             | role_options           | table       | full        | NULL       | 2023-07-14 21:14:06.031943 |          0 |    0 |        t        | NULL
  system        | public             | scheduled_jobs         | table       | full        | NULL       | 2023-07-14 21:14:06.031943 |        496 |    2 |        t        | NULL
  system        | public             | database_role_settings | table       | full        | NULL       | 2023-07-14 21:14:06.031943 |          0 |    0 |        t        | NULL
  system        | public             | role_id_seq            | table       | full        | NULL       | 2023-07-14 21:14:06.031943 |         11 |    1 |        t        | NULL
  system        | public             | tenant_settings        | table       | full        | NULL       | 2023-07-14 21:14:06.031943 |         50 |    1 |        t        | NULL
  system        | public             | privileges             | table       | full        | NULL       | 2023-07-14 21:14:06.031943 |          0 |    0 |        t        | NULL
  system        | public             | external_connections   | table       | full        | NULL       | 2023-07-14 21:14:06.031943 |          0 |    0 |        t        | NULL
  NULL          | NULL               | defaultdb              | database    | full        | NULL       | 2023-07-14 21:14:06.031943 |       NULL | NULL |        t        | NULL
  defaultdb     | NULL               | public                 | schema      | full        | NULL       | 2023-07-14 21:14:06.031943 |       NULL | NULL |        t        | NULL
  NULL          | NULL               | postgres               | database    | full        | NULL       | 2023-07-14 21:14:06.031943 |       NULL | NULL |        t        | NULL
  postgres      | NULL               | public                 | schema      | full        | NULL       | 2023-07-14 21:14:06.031943 |       NULL | NULL |        t        | NULL
(19 rows)
~~~

#### Restore from an encrypted Amazon S3 backup

To decrypt an [encrypted backup](#take-an-encrypted-amazon-s3-backup), use the `kms` option and any subset of the KMS URIs that were used to take the backup:

{% include_cached copy-clipboard.html %}
~~~ sql
RESTORE FROM LATEST IN 's3://{BUCKET NAME}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}'
    WITH kms = 'aws:///{key}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}&REGION=us-east-1';
~~~

</section>

<section class="filter-content" markdown="1" data-scope="azure">

#### Take an encrypted Azure Blob Storage backup

To take an encrypted backup with Azure KMS, use the `kms` [option]({% link {{ page.version.version }}/backup.md %}#options):

{% include_cached copy-clipboard.html %}
~~~ sql
BACKUP INTO 'azure-blob://{container name}?AUTH=specified&AZURE_ACCOUNT_NAME={account name}&AZURE_CLIENT_ID={client ID}&AZURE_CLIENT_SECRET={client secret}&AZURE_TENANT_ID={tenant ID}'
    WITH kms = 'azure-kms:///{key}/{key version}?AZURE_TENANT_ID={tenant ID}&AZURE_CLIENT_ID={client ID}&AZURE_CLIENT_SECRET={client secret}&AZURE_VAULT_NAME={key vault name}';
~~~

#### Take a locality-aware backup with kms encryption

To take a [locality-aware backup with kms encryption](#locality-aware-backup-with-kms-encryption), use the `kms` option to specify a comma-separated list of KMS URIs:

{% include_cached copy-clipboard.html %}
~~~ sql
BACKUP INTO 'azure-blob://{container name}?AUTH=specified&AZURE_ACCOUNT_NAME={account name}&AZURE_CLIENT_ID={client ID}&AZURE_CLIENT_SECRET={client secret}&AZURE_TENANT_ID={tenant ID}'
    WITH KMS=(
      'azure-kms:///{key}/{key version}?AZURE_TENANT_ID={tenant ID}&AZURE_CLIENT_ID={client ID}&AZURE_CLIENT_SECRET={client secret}&AZURE_VAULT_NAME={key vault name}',
      'azure-kms:///{key}/{key version}?AZURE_TENANT_ID={tenant ID}&AZURE_CLIENT_ID={client ID}&AZURE_CLIENT_SECRET={client secret}&AZURE_VAULT_NAME={key vault name}'
    );
~~~

#### Show a locality-aware backup with kms encryption

To view a [kms encrypted locality-aware backup](#use-key-management-service), use the `kms` option and the same KMS URIs that were used to create the backup:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW BACKUP FROM '2023/07/14-211406.03' IN 'azure-blob://{container name}?AUTH=specified&AZURE_ACCOUNT_NAME={account name}&AZURE_CLIENT_ID={client ID}&AZURE_CLIENT_SECRET={client secret}&AZURE_TENANT_ID={tenant ID}'
    WITH KMS=(
      'azure-kms:///{key}/{key version}?AZURE_TENANT_ID={tenant ID}&AZURE_CLIENT_ID={client ID}&AZURE_CLIENT_SECRET={client secret}&AZURE_VAULT_NAME={key vault name}',
      'azure-kms:///{key}/{key version}?AZURE_TENANT_ID={tenant ID}&AZURE_CLIENT_ID={client ID}&AZURE_CLIENT_SECRET={client secret}&AZURE_VAULT_NAME={key vault name}'
    );
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
database_name | parent_schema_name |      object_name       | object_type | backup_type | start_time |          end_time          | size_bytes | rows | is_full_cluster | regions
----------------+--------------------+------------------------+-------------+-------------+------------+----------------------------+------------+------+-----------------+----------
  NULL          | NULL               | system                 | database    | full        | NULL       | 2023-07-14 21:14:06.031943 |       NULL | NULL |        t        | NULL
  system        | public             | users                  | table       | full        | NULL       | 2023-07-14 21:14:06.031943 |        136 |    2 |        t        | NULL
  system        | public             | zones                  | table       | full        | NULL       | 2023-07-14 21:14:06.031943 |        338 |   13 |        t        | NULL
  system        | public             | settings               | table       | full        | NULL       | 2023-07-14 21:14:06.031943 |        373 |    5 |        t        | NULL
  system        | public             | ui                     | table       | full        | NULL       | 2023-07-14 21:14:06.031943 |          0 |    0 |        t        | NULL
  system        | public             | locations              | table       | full        | NULL       | 2023-07-14 21:14:06.031943 |        261 |    5 |        t        | NULL
  system        | public             | role_members           | table       | full        | NULL       | 2023-07-14 21:14:06.031943 |        217 |    1 |        t        | NULL
  system        | public             | comments               | table       | full        | NULL       | 2023-07-14 21:14:06.031943 |          0 |    0 |        t        | NULL
  system        | public             | role_options           | table       | full        | NULL       | 2023-07-14 21:14:06.031943 |          0 |    0 |        t        | NULL
  system        | public             | scheduled_jobs         | table       | full        | NULL       | 2023-07-14 21:14:06.031943 |        496 |    2 |        t        | NULL
  system        | public             | database_role_settings | table       | full        | NULL       | 2023-07-14 21:14:06.031943 |          0 |    0 |        t        | NULL
  system        | public             | role_id_seq            | table       | full        | NULL       | 2023-07-14 21:14:06.031943 |         11 |    1 |        t        | NULL
  system        | public             | tenant_settings        | table       | full        | NULL       | 2023-07-14 21:14:06.031943 |         50 |    1 |        t        | NULL
  system        | public             | privileges             | table       | full        | NULL       | 2023-07-14 21:14:06.031943 |          0 |    0 |        t        | NULL
  system        | public             | external_connections   | table       | full        | NULL       | 2023-07-14 21:14:06.031943 |          0 |    0 |        t        | NULL
  NULL          | NULL               | defaultdb              | database    | full        | NULL       | 2023-07-14 21:14:06.031943 |       NULL | NULL |        t        | NULL
  defaultdb     | NULL               | public                 | schema      | full        | NULL       | 2023-07-14 21:14:06.031943 |       NULL | NULL |        t        | NULL
  NULL          | NULL               | postgres               | database    | full        | NULL       | 2023-07-14 21:14:06.031943 |       NULL | NULL |        t        | NULL
  postgres      | NULL               | public                 | schema      | full        | NULL       | 2023-07-14 21:14:06.031943 |       NULL | NULL |        t        | NULL
(19 rows)
~~~

#### Restore from an encrypted Azure Blob Storage backup

To decrypt an [encrypted backup](#take-an-encrypted-azure-blob-storage-backup), use the `kms` option and any subset of the KMS URIs that were used to take the backup:

{% include_cached copy-clipboard.html %}
~~~ sql
RESTORE FROM LATEST IN 'azure-blob://{container name}?AUTH=specified&AZURE_ACCOUNT_NAME={account name}&AZURE_CLIENT_ID={client ID}&AZURE_CLIENT_SECRET={client secret}&AZURE_TENANT_ID={tenant ID}'
    WITH kms = 'azure-kms:///{key}/{key version}?AZURE_TENANT_ID={tenant ID}&AZURE_CLIENT_ID={client ID}&AZURE_CLIENT_SECRET={client secret}&AZURE_VAULT_NAME={key vault name}';
~~~

</section>

<section class="filter-content" markdown="1" data-scope="gcs">

#### Take an encrypted Google Cloud Storage backup

To take an encrypted backup with Google Cloud KMS, use the `kms` [option]({% link {{ page.version.version }}/backup.md %}#options):

{% include_cached copy-clipboard.html %}
~~~ sql
BACKUP INTO 'gs://{BUCKET NAME}?AUTH=specified&CREDENTIALS={ENCODED KEY}'
    WITH kms = 'gs:///projects/{project name}/locations/us-east1/keyRings/{key ring name}/cryptoKeys/{key name}?AUTH=specified&CREDENTIALS={encoded key}';
~~~

#### Take a locality-aware backup with kms encryption

To take a [locality-aware backup with kms encryption](#locality-aware-backup-with-kms-encryption), use the `kms` option to specify a comma-separated list of KMS URIs:

{% include_cached copy-clipboard.html %}
~~~ sql
BACKUP INTO 'gs://{BUCKET NAME}?AUTH=specified&CREDENTIALS={ENCODED KEY}'
    WITH KMS=(
      'gs:///projects/{project name}/locations/us-east1/keyRings/{key ring name}/cryptoKeys/{key name}?AUTH=specified&CREDENTIALS={encoded key}',
      'gs:///projects/{project name}/locations/us-west1/keyRings/{key ring name}/cryptoKeys/{key name}?AUTH=specified&CREDENTIALS={encoded key}'
    );
~~~

#### Show a locality-aware backup with kms encryption

To view a [kms encrypted locality-aware backup](#use-key-management-service), use the `kms` option and the same KMS URIs that were used to create the backup:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW BACKUP FROM '2023/07/14-211406.03' IN 'gs://{BUCKET NAME}?AUTH=specified&CREDENTIALS={ENCODED KEY}'
    WITH KMS=(
      'gs:///projects/{project name}/locations/us-east1/keyRings/{key ring name}/cryptoKeys/{key name}?AUTH=specified&CREDENTIALS={encoded key}',
      'gs:///projects/{project name}/locations/us-west1/keyRings/{key ring name}/cryptoKeys/{key name}?AUTH=specified&CREDENTIALS={encoded key}'
    );
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
database_name | parent_schema_name |      object_name       | object_type | backup_type | start_time |          end_time          | size_bytes | rows | is_full_cluster | regions
----------------+--------------------+------------------------+-------------+-------------+------------+----------------------------+------------+------+-----------------+----------
  NULL          | NULL               | system                 | database    | full        | NULL       | 2023-07-14 21:14:06.031943 |       NULL | NULL |        t        | NULL
  system        | public             | users                  | table       | full        | NULL       | 2023-07-14 21:14:06.031943 |        136 |    2 |        t        | NULL
  system        | public             | zones                  | table       | full        | NULL       | 2023-07-14 21:14:06.031943 |        338 |   13 |        t        | NULL
  system        | public             | settings               | table       | full        | NULL       | 2023-07-14 21:14:06.031943 |        373 |    5 |        t        | NULL
  system        | public             | ui                     | table       | full        | NULL       | 2023-07-14 21:14:06.031943 |          0 |    0 |        t        | NULL
  system        | public             | locations              | table       | full        | NULL       | 2023-07-14 21:14:06.031943 |        261 |    5 |        t        | NULL
  system        | public             | role_members           | table       | full        | NULL       | 2023-07-14 21:14:06.031943 |        217 |    1 |        t        | NULL
  system        | public             | comments               | table       | full        | NULL       | 2023-07-14 21:14:06.031943 |          0 |    0 |        t        | NULL
  system        | public             | role_options           | table       | full        | NULL       | 2023-07-14 21:14:06.031943 |          0 |    0 |        t        | NULL
  system        | public             | scheduled_jobs         | table       | full        | NULL       | 2023-07-14 21:14:06.031943 |        496 |    2 |        t        | NULL
  system        | public             | database_role_settings | table       | full        | NULL       | 2023-07-14 21:14:06.031943 |          0 |    0 |        t        | NULL
  system        | public             | role_id_seq            | table       | full        | NULL       | 2023-07-14 21:14:06.031943 |         11 |    1 |        t        | NULL
  system        | public             | tenant_settings        | table       | full        | NULL       | 2023-07-14 21:14:06.031943 |         50 |    1 |        t        | NULL
  system        | public             | privileges             | table       | full        | NULL       | 2023-07-14 21:14:06.031943 |          0 |    0 |        t        | NULL
  system        | public             | external_connections   | table       | full        | NULL       | 2023-07-14 21:14:06.031943 |          0 |    0 |        t        | NULL
  NULL          | NULL               | defaultdb              | database    | full        | NULL       | 2023-07-14 21:14:06.031943 |       NULL | NULL |        t        | NULL
  defaultdb     | NULL               | public                 | schema      | full        | NULL       | 2023-07-14 21:14:06.031943 |       NULL | NULL |        t        | NULL
  NULL          | NULL               | postgres               | database    | full        | NULL       | 2023-07-14 21:14:06.031943 |       NULL | NULL |        t        | NULL
  postgres      | NULL               | public                 | schema      | full        | NULL       | 2023-07-14 21:14:06.031943 |       NULL | NULL |        t        | NULL
(19 rows)
~~~

#### Restore from an encrypted Google Cloud Storage backup

To decrypt an [encrypted backup](#take-an-encrypted-google-cloud-storage-backup), use the `kms` option and any subset of the KMS URIs that were used to take the backup:

{% include_cached copy-clipboard.html %}
~~~ sql
RESTORE FROM LATEST IN 'gs://{BUCKET NAME}?AUTH=specified&CREDENTIALS={ENCODED KEY}'
    WITH kms = 'gs:///projects/{project name}/locations/us-east1/keyRings/{key ring name}/cryptoKeys/{key name}?AUTH=specified&CREDENTIALS={encoded key}';
~~~

</section>

## Use a passphrase

{% include {{ page.version.version }}/backups/encrypted-backup-description.md %}

{% include {{ page.version.version }}/backups/bulk-auth-options.md %}

<section class="filter-content" markdown="1" data-scope="s3">

#### Take an encrypted backup using a passphrase

To take an encrypted backup, use the [`encryption_passphrase` option]({% link {{ page.version.version }}/backup.md %}#with-encryption-passphrase):

{% include_cached copy-clipboard.html %}
~~~ sql
BACKUP INTO 's3://{BUCKET NAME}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}' WITH encryption_passphrase = 'password123';
~~~

To [restore]({% link {{ page.version.version }}/restore.md %}), use the same `encryption_passphrase`. See the [example](#restore-from-an-encrypted-backup-using-a-passphrase) below for more details.

#### Restore from an encrypted backup using a passphrase

To decrypt an encrypted backup, use the [`encryption_passphrase` option]({% link {{ page.version.version }}/backup.md %}#with-encryption-passphrase) option and the same passphrase that was used to create the backup.

For example, the encrypted backup created in the previous example can be restored with:

{% include_cached copy-clipboard.html %}
~~~ sql
RESTORE FROM LATEST IN 's3://{BUCKET NAME}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}' WITH encryption_passphrase = 'password123';
~~~

To restore from a specific backup, use [`RESTORE FROM {subdirectory} IN ...`]({% link {{ page.version.version }}/restore.md %}#restore-a-specific-full-or-incremental-backup).

## See also

- [`BACKUP`][backup]
- [`RESTORE`][restore]
- [`ALTER BACKUP`]({% link {{ page.version.version }}/alter-backup.md %})
- [Take Full and Incremental Backups]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %})
- [Take and Restore Locality-aware Backups]({% link {{ page.version.version }}/take-and-restore-locality-aware-backups.md %})
- [Take Backups with Revision History and Restore from a Point-in-time]({% link {{ page.version.version }}/take-backups-with-revision-history-and-restore-from-a-point-in-time.md %})
- [Migration Overview]({% link molt/migration-overview.md %})
- [Use the Built-in SQL Client]({% link {{ page.version.version }}/cockroach-sql.md %})
- [`cockroach` Commands Overview]({% link {{ page.version.version }}/cockroach-commands.md %})

{% comment %} Reference links {% endcomment %}

[backup]:  backup.html
[restore]: restore.html
