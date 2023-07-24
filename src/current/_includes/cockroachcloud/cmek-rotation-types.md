You can rotate a CMEK key for a {{ site.data.products.dedicated }} cluster either by creating a new version of the existing CMEK key or by creating a new CMEK key. At a high level:

**To begin using a new version of an existing CMEK key**:

1. In your KMS platform, you can either configure automatic rotation for the CMEK key, or you can perform a manual rotation.
1. {{ site.data.products.db }} does not automatically re-encrypt the store key using the new CMEK key version. For each region you want to update, you must also perform a rotation using the {{ site.data.products.db }} API without modifying the CMEK key URI. {{ site.data.products.db }} re-encrypts the store key using the new CMEK key version.

**To begin using an entirely new CMEK key**:

1. Within your KMS platform, you create a new CMEK key.
1. Next, you perform a rotation using the {{ site.data.products.db }} API and provide the new CMEK key URI.
