You can rotate a CMEK key for a CockroachDB {{ site.data.products.advanced }} cluster either by creating a new version of the existing CMEK key or by creating a new CMEK key. At a high level:

**To begin using a new version of an existing CMEK key**:

1. In your KMS platform, either configure automatic rotation for the CMEK key or perform a manual rotation.
1. CockroachDB {{ site.data.products.cloud }} does not automatically re-encrypt the store key using the new CMEK key version. For each region you want to update, perform a rotation without modifying the CMEK key URI. CockroachDB {{ site.data.products.cloud }} re-encrypts the store key using the new CMEK key version.

**To begin using an entirely new CMEK key**:

1. Within your KMS platform, create a new CMEK key.
1. Next, perform a rotation in CockroachDB {{ site.data.products.cloud }} and provide the new CMEK key URI.
