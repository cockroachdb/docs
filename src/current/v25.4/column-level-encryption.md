---
title: Column Level Encryption
summary: SQL users are required to pass encryption keys when reading from or writing to specific columns
toc: true
docs_area: reference.sql
---

CockroachDB supports _column level encryption_. Using this feature, you can encrypt one or more of the columns in each row of a database table.

Column level encryption can be useful for compliance scenarios such as adhering to PCI.

Once a column is encrypted, SQL users are required to pass an encryption key when reading from or writing to that column. This prevents users without the encryption key from taking actions such as reading sensitive information (like _personally identifiable information_ ([PII](https://en.wikipedia.org/wiki/Personal_data))) when accessing the tables.

{{site.data.alerts.callout_info}}
The "column level encryption" feature described on this page specifically refers to symmetric-key encryption of data, **not** hashing functions operating on data.
{{site.data.alerts.end}}



## Available Functions

### `encrypt` and `encrypt_iv`

The `encrypt` and `encrypt_iv` functions encrypt a column's data with a given key and cipher method. For more information, see [Cryptographic functions]({% link {{ page.version.version }}/functions-and-operators.md %}#cryptographic-functions).

For usage examples, see:

- [Encrypt using the `encrypt` function](#encrypt-using-the-encrypt-function).
- [Encrypt using the `encrypt_iv` function](#encrypt-using-the-encrypt_iv-function).

If you do not have a [license]({% link {{ page.version.version }}/licensing-faqs.md %}), you will see an error message like the following if you try to use them:

~~~
ERROR: encrypt(): use of this cryptographic function (https://www.cockroachlabs.com/docs/stable/functions-and-operators#cryptographic-functions) requires an enterprise license. see https://cockroachlabs.com/pricing for details on how to enable enterprise features
~~~

{{site.data.alerts.callout_info}}
For more information about whether to use the `encrypt` or `encrypt_iv` variants of this function, see [Whether to use `encrypt` and `decrypt` or `encrypt_iv` and `decrypt_iv`](#whether-to-use-encrypt-and-decrypt-or-encrypt_iv-and-decrypt_iv).
{{site.data.alerts.end}}

### `decrypt` and `decrypt_iv`

The `decrypt` and `decrypt_iv` functions decrypt an encrypted column's data with a given key and cipher method. For more information, see [Cryptographic functions]({% link {{ page.version.version }}/functions-and-operators.md %}#cryptographic-functions).

For usage examples, see:

- [Decrypt using the `decrypt` function](#decrypt-using-the-decrypt-function).
- [Decrypt using the `decrypt_iv` function](#decrypt-using-the-decrypt_iv-function).

If you do not have a [license]({% link {{ page.version.version }}/licensing-faqs.md %}), you will see an error message like the following if you try to use them:

~~~
ERROR: decrypt(): use of this cryptographic function (https://www.cockroachlabs.com/docs/stable/functions-and-operators#cryptographic-functions) requires an enterprise license. see https://cockroachlabs.com/pricing for details on how to enable enterprise features
~~~

{{site.data.alerts.callout_info}}
For more information about whether to use the `decrypt` or `decrypt_iv` variants of this function, see [Whether to use `encrypt` and `decrypt` or `encrypt_iv` and `decrypt_iv`](#whether-to-use-encrypt-and-decrypt-or-encrypt_iv-and-decrypt_iv).
{{site.data.alerts.end}}

## Security considerations

### Whether to use `encrypt` and `decrypt` or `encrypt_iv` and `decrypt_iv`

Both `encrypt` and `decrypt` have `*_iv` variants: `encrypt_iv` and `decrypt_iv`. You will need to assess your risk profile to determine which functions to use.

The benefits of using `encrypt_iv` and `decrypt_iv` include:

- Avoid repetition: If you use the same encryption key and method to encrypt the same plaintext multiple times without an initialization vector (IV), you'll get the same ciphertext every time. This repetition can provide a point of attack for someone trying to break the encryption. By using an IV, even the same plaintext will produce different ciphertexts, provided a different IV is used each time.
- Defend against pattern analysis: Without an IV, if two users have the same piece of data (such as an SSN), their encrypted values will also be the same. An attacker can exploit these patterns. By using different IVs for each encryption, the encrypted values will be different even if the plaintext values are the same.
- Cipher block chaining (CBC) mode: Many encryption algorithms, like AES, operate on blocks of data. In modes like CBC, the previous block of ciphertext is used as an IV for the encryption of the next block. This means that even if there are patterns in the plaintext, they won't appear in the ciphertext. However, for the first block, there is no previous block of ciphertext, so an IV is used. This is another way IVs help in breaking up patterns in the ciphertext.
- Mitigate replay attacks: Since the IV is typically random and changed for every encryption, it makes replay attacks more difficult. An attacker can't simply take an old piece of encrypted data and send it again, as the IV will likely have changed.

The drawbacks of using `encrypt_iv` and `decrypt_iv` include:

- Storage: You need to store the IV alongside the ciphertext. It's common practice to prepend or append the IV to the ciphertext before storing it. Unlike the encryption key, the IV doesn't need to be kept secret, but it does need to be known for decryption.
- Randomness: It's crucial that IVs are random and not predictable. If an attacker can predict the next IV, some of the security benefits are negated.
- Unique IVs with the Same Key: While IVs need to be random, it's also essential that the same IV isn't used twice with the same encryption key. Doing so can leak information about the plaintext.

### How AES variants are determined

The actual AES variant (AES-128, AES-192, or AES-256) is determined by the length of the encryption key you provide in the functions:

- AES-128: 16-byte key
- AES-192: 24-byte key
- AES-256: 32-byte key

Internally, keys have to be 16-, 24-, or 32-byte lengths and map to the corresponding AES encryption strength. If you use a key with a different length, the key is zero-padded up to the next valid key length. If the key is more than 32 bytes long, it is truncated to 32 bytes.

## Performance considerations

Use of the `encrypt` built-in function can have anywhere from 10-40% overhead depending on the length of the data being encrypted and the hardware provisioned for CockroachDB. 

Cockroach Labs measured baseline performance in a 3-node CockroachDB cluster running on three [`n1-standard-4` machines on GCP](https://cloud.google.com/compute/docs/general-purpose-machines#n1_machines).

Without using `encrypt` or `decrypt`, the following statement generally ran in 60-80 ms:

{% include_cached copy-clipboard.html %}
~~~ sql
WITH
    a
        AS (
            SELECT
                lpad(
                    (1000 * random())::INT8::STRING,
                    3,
                    '0'
                )
                || '-'
                || lpad(
                        (100 * random())::INT8::STRING,
                        2,
                        '0'
                    )
                || '-'
                || lpad(
                        (10000 * random())::INT8::STRING,
                        4,
                        '0'
                    )
                    AS ssn
            FROM
                ROWS FROM (generate_series(1, 1.0E+04))
        )
SELECT
    ssn
FROM
    a
~~~

Using both `encrypt` and `decrypt`, the following statement generally ran in 80-100 ms:

{% include_cached copy-clipboard.html %}
~~~ sql
WITH
    a
        AS (
            SELECT
                lpad(
                    (1000 * random())::INT8::STRING,
                    3,
                    '0'
                )
                || '-'
                || lpad(
                        (100 * random())::INT8::STRING,
                        2,
                        '0'
                    )
                || '-'
                || lpad(
                        (10000 * random())::INT8::STRING,
                        4,
                        '0'
                    )
                    AS ssn
            FROM
                ROWS FROM (generate_series(1, 1.0E+04))
        )
SELECT
    convert_from(
        decrypt(
            encrypt(
                ssn::BYTES,
                e'\\xd54a43d2a4caf8d3fbe4e4f711b39d4a0fedf26ac0dcdfb0811c2078a6a9cd147e77da38e35e14cacfc79c7e11a052c4bc9449e1d6fa280dcdc45bb4004f1648',
                'aes'
            ),
            e'\\xd54a43d2a4caf8d3fbe4e4f711b39d4a0fedf26ac0dcdfb0811c2078a6a9cd147e77da38e35e14cacfc79c7e11a052c4bc9449e1d6fa280dcdc45bb4004f1648',
            'aes'
        ),
        'UTF8'
    )
FROM
    a
~~~

With `encrypt` only, the following statement generally ran in 80-100 ms:

{% include_cached copy-clipboard.html %}
~~~ sql
WITH
    a
        AS (
            SELECT
                lpad(
                    (1000 * random())::INT8::STRING,
                    3,
                    '0'
                )
                || '-'
                || lpad(
                        (100 * random())::INT8::STRING,
                        2,
                        '0'
                    )
                || '-'
                || lpad(
                        (10000 * random())::INT8::STRING,
                        4,
                        '0'
                    )
                    AS ssn
            FROM
                ROWS FROM (generate_series(1, 1.0E+04))
        )
SELECT
    encrypt(
        ssn::BYTES,
        e'\\xd54a43d2a4caf8d3fbe4e4f711b39d4a0fedf26ac0dcdfb0811c2078a6a9cd147e77da38e35e14cacfc79c7e11a052c4bc9449e1d6fa280dcdc45bb4004f1648',
        'aes'
    )
FROM
    a
~~~

{{site.data.alerts.callout_info}}
It is important to benchmark these built-in functions on your particular CockroachDB setup to establish the performance implications for your workloads. This is necessary because performance can vary depending on your hardware (CPU type), the typical amount of load on the cluster, etc.
{{site.data.alerts.end}}

## Examples

### Setup

The examples in this section operate on the following table.

{{site.data.alerts.callout_info}}
The columns that will store the encrypted values must be of type [`BYTES`]({% link {{ page.version.version }}/bytes.md %}) as shown below.
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE IF NOT EXISTS users (
    user_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255),
    encrypted_ssn BYTES,
    ssn_iv BYTES
);
~~~

### Encrypt using the `encrypt` function

{% include_cached copy-clipboard.html %}
~~~ sql
INSERT
INTO
    users (name, encrypted_ssn)
VALUES
    (
        'John Doe',
        encrypt(
            '123-45-6789'::BYTES,
            'your_secret_key'::BYTES,
            'aes'
        )
    );
~~~

### Encrypt using the `encrypt_iv` function

{% include_cached copy-clipboard.html %}
~~~ sql
WITH
    iv AS (SELECT gen_random_bytes(16) AS iv)
INSERT
INTO
    users (name, encrypted_ssn, ssn_iv)
SELECT
    'Jane Doe',
    encrypt_iv(
        '987-65-4321'::BYTES,
        'your_secret_key'::BYTES,
        iv,
        'aes'
    ),
    iv
FROM
    iv;
~~~

### Decrypt using the `decrypt` function

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT
    name,
    convert_from(
        decrypt(
            encrypted_ssn,
            'your_secret_key'::BYTES,
            'aes'
        ),
        'UTF8'
    )
        AS ssn
FROM
    users
WHERE
    name = 'John Doe';
~~~

### Decrypt using the `decrypt_iv` function

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT
    name,
    convert_from(
        decrypt_iv(
            encrypted_ssn,
            'your_secret_key'::BYTES,
            ssn_iv,
            'aes'
        ),
        'UTF8'
    )
        AS ssn
FROM
    users
WHERE
    name = 'Jane Doe';
~~~

## See also

+ [Encryption at Rest]({% link {{ page.version.version }}/encryption.md %})
+ [Cryptographic functions]({% link {{ page.version.version }}/functions-and-operators.md %}#cryptographic-functions)
