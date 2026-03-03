---
title: Migrate from Avro
summary: Learn how to migrate data from Avro files into a CockroachDB cluster.
toc: true
docs_area: migrate
---

This page has instructions for migrating data from Avro files into CockroachDB using [`IMPORT INTO`]({% link {{ page.version.version }}/import-into.md %}).

{% include {{ page.version.version }}/misc/import-perf.md %}

## Step 1. Export data to Avro

Please refer to the documentation of your database for instructions on exporting data to Avro.

You will need to export one file per table, with the following requirements:

- Files must be self-contained [object container file (OFC)](#import-an-object-container-file) or a [binary or JSON file](#import-binary-or-json-records) containing one Avro record per line.
- Files must be UTF-8 encoded.

### Data type mapping

Avro data types will be flexibly mapped to the target schema; that is, Avro and CockroachDB SQL types do not need to match exactly. By default, CockroachDB ignores unknown Avro fields and sets any columns to `NULL` if they were not set in the Avro record.

Use the table below for data type mappings:

 Avro Data Type | CockroachDB Data Type
----------------+------------------------------------------------
`BOOL`          | [`BOOL`]({% link {{ page.version.version }}/bool.md %}), [`STRING`]({% link {{ page.version.version }}/string.md %})
`INT`           | [`INT`]({% link {{ page.version.version }}/int.md %}), [`STRING`]({% link {{ page.version.version }}/string.md %})
`FLOAT`         | [`FLOAT`]({% link {{ page.version.version }}/float.md %}), [`STRING`]({% link {{ page.version.version }}/string.md %})
`STRING`        | [`STRING`]({% link {{ page.version.version }}/string.md %})
`BYTES`         | [`BYTES`]({% link {{ page.version.version }}/bytes.md %}), [`STRING`]({% link {{ page.version.version }}/string.md %})
`ARRAY`         | [`ARRAY`]({% link {{ page.version.version }}/array.md %}), [`STRING`]({% link {{ page.version.version }}/string.md %})
`UUID`          | [`STRING`]({% link {{ page.version.version }}/string.md %})
`DATE`          | [`STRING`]({% link {{ page.version.version }}/string.md %})
`TIME`          | [`STRING`]({% link {{ page.version.version }}/string.md %})
`INTERVAL`      | [`STRING`]({% link {{ page.version.version }}/string.md %})
`TIMESTAMP`     | [`STRING`]({% link {{ page.version.version }}/string.md %})
`JSON`          | [`STRING`]({% link {{ page.version.version }}/string.md %})
`BIT`           | [`STRING`]({% link {{ page.version.version }}/string.md %})
`DECIMAL`       | [`STRING`]({% link {{ page.version.version }}/string.md %})

{{site.data.alerts.callout_info}}
CockroachDB will attempt to convert the Avro data type to the CockroachDB data type; otherwise, it will report an error.
{{site.data.alerts.end}}

## Step 2. Host the files where the cluster can access them

Each node in the CockroachDB cluster needs to have access to the files being imported. There are several ways for the cluster to access the data; for more information on the types of storage [`IMPORT INTO`]({% link {{ page.version.version }}/import-into.md %}) can pull from, see the following:

- [Use Cloud Storage]({% link {{ page.version.version }}/use-cloud-storage.md %})
- [Use a Local File Server]({% link {{ page.version.version }}/use-a-local-file-server.md %})

{{site.data.alerts.callout_success}}
We strongly recommend using cloud storage such as Amazon S3 or Google Cloud to host the data files you want to import.
{{site.data.alerts.end}}

## Step 3. Import the Avro

To import Avro data:

- [Import an object container file](#import-an-object-container-file).
- [Import binary or JSON records](#import-binary-or-json-records).

### Import an object container file

An [object container file (OCF)](https://avro.apache.org/docs/current/spec.html#Object+Container+Files) is a self-contained Avro file and includes both the table schema and records. For Avro OCF, the `strict_validation` import option rejects Avro records that do not have a [one-to-one data type mapping][datatypes] to the target schema. By default, CockroachDB ignores unknown Avro fields and sets missing SQL fields to `NULL`.

{{site.data.alerts.callout_info}}
The following example uses [sample data from Teradata](https://github.com/Teradata/kylo/tree/master/samples/sample-data/avro).
{{site.data.alerts.end}}

For example, to import the data from `userdata1.avro` into an `employees` table, issue the following [`IMPORT`]({% link {{ page.version.version }}/import-into.md %}) statement:

{% include_cached copy-clipboard.html %}
~~~sql
CREATE TABLE employees (
    registration_dttm STRING,
    id INT,
    first_name STRING,
    last_name STRING,
    email STRING,
    gender STRING,
    ip_address STRING,
    cc INT,
    country STRING,
    birthdate STRING,
    salary FLOAT,
    title STRING,
    comments STRING
        );
~~~

Next, use `IMPORT INTO` to import the data into the new table:

{% include_cached copy-clipboard.html %}
~~~sql
IMPORT INTO employees (
    registration_dttm,
    id,
    first_name,
    last_name, email,
    gender,
    ip_address,
    cc, country,
    birthdate,
    salary,
    title,
    comments
  )
     AVRO DATA (
       's3://[bucket-placeholder]/userdata1.avro?AWS_ACCESS_KEY_ID=[placeholder]&AWS_SECRET_ACCESS_KEY=[placeholder]'
     );
~~~

~~~
        job_id       |  status   | fraction_completed | rows | index_entries | bytes
---------------------+-----------+--------------------+------+---------------+---------
  535041064396062721 | succeeded |                  1 | 1000 |             0 | 162825
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM employees LIMIT 5;
~~~

~~~
   registration_dttm   | id | first_name | last_name |          email           | gender |   ip_address   |        cc        |        country         | birthdate  |  salary   |          title           | comments
-----------------------+----+------------+-----------+--------------------------+--------+----------------+------------------+------------------------+------------+-----------+--------------------------+-----------
  2016-02-03T07:55:29Z |  1 | Amanda     | Jordan    | ajordan0@com.com         | Female | 1.197.201.2    | 6759521864920116 | Indonesia              | 3/8/1971   |  49756.53 | Internal Auditor         | 1E+02
  2016-02-03T17:04:03Z |  2 | Albert     | Freeman   | afreeman1@is.gd          | Male   | 218.111.175.34 |             NULL | Canada                 | 1/16/1968  | 150280.17 | Accountant IV            |
  2016-02-03T01:09:31Z |  3 | Evelyn     | Morgan    | emorgan2@altervista.org  | Female | 7.161.136.94   | 6767119071901597 | Russia                 | 2/1/1960   | 144972.51 | Structural Engineer      |
  2016-02-03T12:36:21Z |  4 | Denise     | Riley     | driley3@gmpg.org         | Female | 140.35.109.83  | 3576031598965625 | China                  | 4/8/1997   |  90263.05 | Senior Cost Accountant   |
  2016-02-03T05:05:31Z |  5 | Carlos     | Burns     | cburns4@miitbeian.gov.cn |        | 169.113.235.40 | 5602256255204850 | South Africa           |            | NULL      |                          |
(5 rows)
~~~

Repeat this process for each OCF you want to import.

{{site.data.alerts.callout_info}}
You will need to run [`ALTER TABLE ... ADD CONSTRAINT`]({% link {{ page.version.version }}/alter-table.md %}#add-constraint) to add any foreign key relationships.
{{site.data.alerts.end}}

### Import binary or JSON records

In addition to importing [Avro OCF](#import-an-object-container-file), you can also import a binary or JSON file containing Avro records:

- To import a binary file, use the `data_as_binary_records` [option][option].
- To import a JSON file, use the `data_as_json_records` [option][option].

The schema is not included in these types of files, so you need to specify the schema. You need to either:

- Specify the schema inline with the `schema` [option][option].
- Specify the schema by pointing to the file with the `schema_uri` [option][option].

There are additional import [options][option] you can use when importing binary and JSON files:

- `strict_validation`, which rejects Avro records that do not have a [one-to-one data type mapping][datatypes] to the target schema. By default, CockroachDB ignores unknown Avro fields and sets missing SQL fields to `NULL`.
- `records_terminated_by`, which specifies the unicode character used to indicate new lines in the input binary or JSON file (default: `\n`).

{{site.data.alerts.callout_info}}
The following example uses sample data generated by [Avro tools](https://github.com/cockroachdb/cockroach/tree/master/pkg/sql/importer/testdata/avro).
{{site.data.alerts.end}}

For example, to import the data from `simple-schema.json` into a `simple` table, first [create the table]({% link {{ page.version.version }}/create-table.md %}) to import into. Then run `IMPORT INTO` with the following options:

{% include_cached copy-clipboard.html %}
~~~ sql
IMPORT INTO simple
    AVRO DATA ('s3://[bucket-placeholder]/simple-sorted.json?AWS_ACCESS_KEY_ID=[placeholder]&AWS_SECRET_ACCESS_KEY=[placeholder]')
    WITH
  	   data_as_json_records,
  	   schema = '{ "type": "record",
    "name": "simple",
    "fields":
      [
        { "name": "i", "type": "int" },
        { "name": "s", "type": "string" },
        { "name": "b", "type": ["null", "bytes"] }
      ]
    }';
~~~

~~~
        job_id       |  status   | fraction_completed | rows | index_entries | bytes
---------------------+-----------+--------------------+------+---------------+--------
  535294613223669761 | succeeded |                  1 | 1000 |             0 | 50372
(1 row)
~~~

~~~ sql
> SELECT * FROM  simple LIMIT 5;
~~~

~~~
       i      |                 s                 |                   b
--------------+-----------------------------------+---------------------------------------------...
  -2135825688 | dcpamywjlvtohbbtbtpypubccu        | \303\204\303\264\303\216\027\303\221\017\303...
  -2135463332 | rmspluxnumigrpbrkfmuktphnmfskt    | \303\232\017i>{b.~\302\277\177A\302\264\303\...
  -2132354298 | mebfxrhurtngsqvlyjechuglymuxfjpvv | \303\2541E\302\277\302\2714\302\257\303\201\...
  -2131856455 | hfrgfefflpopvtemrspaixitncghwqfrr | NULL
  -2116408431 | thuosfwm                          | \016s\026\303\264\303\247\302\201\302\264o\3...
(5 rows)
~~~

Repeat this process for each binary or JSON file you want to import.

{{site.data.alerts.callout_info}}
You will need to run [`ALTER TABLE ... ADD CONSTRAINT`]({% link {{ page.version.version }}/alter-table.md %}#add-constraint) to add any foreign key relationships.
{{site.data.alerts.end}}

## See also

- [`IMPORT INTO`]({% link {{ page.version.version }}/import-into.md %})
- [Import Performance Best Practices]({% link {{ page.version.version }}/import-performance-best-practices.md %})
- [Migrate from CSV][csv]
- [Migrate from MySQL]({% link molt/migrate-to-cockroachdb.md %}?filters=mysql)
- [Migrate from PostgreSQL]({% link molt/migrate-to-cockroachdb.md %})
- [Back Up and Restore Data]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %})
- [Use the Built-in SQL Client]({% link {{ page.version.version }}/cockroach-sql.md %})
- [`cockroach` Commands Overview]({% link {{ page.version.version }}/cockroach-commands.md %})

{% comment %} Reference Links {% endcomment %}

[csv]: migrate-from-csv.html
[postgres]: migrate-from-postgres.html
[mysql]: migrate-from-mysql.html
[option]: {% link {{ page.version.version }}/import-into.md %}#import-options
[datatypes]: migrate-from-avro.html#data-type-mapping
