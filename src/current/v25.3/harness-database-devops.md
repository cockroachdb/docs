---
title: Use CockroachDB with Harness Database DevOps
summary: Learn how to manage CockroachDB schema changes with Harness Database DevOps.
toc: true
docs_area: develop
---
This page shows how to use Harness [Database DevOps](https://developer.harness.io/) to manage schema changes in CockroachDB using a Git-driven workflow. 
You will create a schema changelog, configure a JDBC connector, and run a Harness pipeline that applies schema changes to your CockroachDB cluster.

## Before you begin
1. **CockroachDB cluster running** (with SQL port 26257 accessible).  
2. **Harness account** with the Database DevOps module enabled.  
3. **Harness Delegate installed** in your Kubernetes cluster.  
4. **JDBC connector configured** in Harness pointing to CockroachDB.  
5. Git repository with your database changelog files (`changelog.yml`).  

For more details, refer:  
- [Install a Harness Delegate](https://developer.harness.io/docs/platform/delegates/install-delegates/)  
- [CockroachDB Connection Parameters](https://www.cockroachlabs.com/docs/stable/connect-to-the-database.html)  

## Step 1. Create a `changelog.yml`

Define your database schema changes in a Liquibase-compatible changelog file. Save this in your Git repo (e.g., `db/changelog.yml`):

```yml
databaseChangeLog:
  - changeSet:
      id: 1
      author: john-doe
      comment: Create items table
      changes:
        - createTable:
            tableName: items
            columns:
              - column:
                  name: id
                  type: SERIAL
                  autoIncrement: true
                  constraints:
                    primaryKey: true
                    nullable: false
              - column:
                  name: name
                  type: VARCHAR(255)
                  constraints:
                    nullable: false
              - column:
                  name: description
                  type: TEXT
                  constraints:
                    nullable: true
  - changeSet:
      id: 2
      author: john-doe
      comment: Add index on name column for better query performance
      changes:
        - createIndex:
            indexName: idx_items_name
            tableName: items
            columns:
              - column:
                  name: name
```
This changelog defines:
- A new items table.
- An index on the name column.
Now, commit your `changelog.yml` to Git Repository.

## Step 2. Configure a Harness JDBC Connector
1. In Harness, go to **Connectors** → **New Connector** → **Database Connector**.
2. Choose JDBC Connector.
3. Enter the JDBC connection string. For example:
   <img width="1662" height="825" alt="JDBC Details" src="https://github.com/user-attachments/assets/df736c8e-f3c0-4995-acb7-5570f9bf7d76" />
   With TLS (recommended):
    ```bash
    jdbc:postgresql://<cockroachdb-host>:26257/<databaseName>?sslmode=verify-full&sslrootcert=/certs/ca.crt&sslcert=/certs/client.crt&sslkey=/certs/client.key
    ```
   Without TLS (dev/test only):
    ```bash
    jdbc:postgresql://<cockroachdb-host>:26257/<databaseName>
    ```
4. Test and save the connector.
<img width="1655" height="803" alt="Connection Test" src="https://github.com/user-attachments/assets/20b89537-30a8-4cf8-988f-105a397c8296" />

## Step 3. Setup the Harness Delegate
Install a Harness Delegate in your Kubernetes cluster to enable communication between Harness, CockroachDB and Git.
1. Install the delegate in your cluster.
2. Verify the delegate is running:
```
kubectl get pods -n harness-delegate
```
4. Ensure your pipeline YAML references the delegate:
```yml
delegateSelectors:
  - cockroachdb-delegate
```

## Step 4. Create the Harness Pipeline

In Harness, go to the Database DevOps module and select your project.
1. Navigate to **Pipelines** → **Create a Pipeline**.
2. Add a **Custom Stage** and enable **containerized execution**, unde the "Add Step Group".
3. In the stage, add the Apply Database Schema step. Configure it by selecting your CockroachDB schema and the corresponding instance created earlier.
<img width="1720" height="869" alt="DBDevOps Apply Schema" src="https://github.com/user-attachments/assets/9c46dc11-243c-47ee-9aa0-00036c1c7d93" />

For a detailed, end-to-end onboarding walkthrough (including setting up changelogs, schemas, connectors, and instances), refer to the [Harness Database DevOps Setup Guide](https://developer.harness.io/docs/database-devops/use-database-devops/get-started/onboarding-guide/).

## Step 5. Run the Pipeline
1. Trigger the pipeline in Harness.
2. The logs will show Liquibase applying your schema changes to CockroachDB.
```bash
UPDATE SUMMARY
Run:                          2
Previously run:               0
Filtered out:                 0
-------------------------------
Total change sets:            2

Liquibase: Update has been successful. Rows affected: 2
Liquibase command 'update' was executed successfully.
```
The pipeline UI will display the executed changeSets with IDs, authors, and timestamps.
<img width="1614" height="741" alt="Harness Database DevOps Pipeline Execution" src="https://github.com/user-attachments/assets/fbd22b90-17c7-4a41-9cf4-9a9f5cc816a6" />

## See also
- [Harness Database DevOps Documentation](https://developer.harness.io/docs/database-devops/)
- [Client connection parameters]({% link {{ page.version.version }}/connection-parameters.md %})
- [Third-Party Database Tools]({% link {{ page.version.version }}/third-party-database-tools.md %})
