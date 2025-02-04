---
title: Visualize CockroachDB Schemas with ChartDB
summary: Learn how to create interactive database diagrams of your CockroachDB schema using ChartDB's web-based visualization tool.
toc: true
docs_area: develop
---

[ChartDB][chartdb] is an open-source database visualization tool that allows you to create interactive diagrams of your CockroachDB schema with a single query. No installation or database passwords are required.

## Before You Begin

You'll need:
- A running CockroachDB cluster
- Access to the CockroachDB SQL shell or another SQL client

## Step 1. Generate the Schema JSON

1. Connect to your CockroachDB database using your preferred SQL client.

2. Run the ChartDB "Smart Query" for your database schema (available at [app.chartdb.io](https://app.chartdb.io) when you select PostgreSQL as your database type).

3. Copy the resulting JSON output.

## Step 2. Create Your Database Diagram

1. Visit [app.chartdb.io](https://app.chartdb.io).

2. Click "Go to app".

3. Select "PostgreSQL" as your database type (CockroachDB is compatible with PostgreSQL's schema format).

4. Paste your JSON schema into the input field.

5. Click "Visualize" to generate your interactive diagram.

## Step 3. Customize Your Diagram

Once your diagram is generated, you can:

- Drag tables to rearrange them
- Show or hide specific columns
- Highlight relationships between tables
- Add notes and annotations
- Customize the visual appearance

## Step 4. Export and Share

ChartDB offers several export options:

- Save as PNG or SVG image
- Export DDL scripts (with AI-powered dialect conversion)
- Share interactive diagrams with your team

{{site.data.alerts.callout_info}}
ChartDB is open-source and can also be self-hosted. For installation instructions, visit the [ChartDB GitHub repository](https://github.com/chartdb/chartdb).
{{site.data.alerts.end}}

## Features

- **No Installation Required**: Access via web browser
- **Secure**: No database passwords needed
- **Interactive**: Real-time editing and customization
- **AI-Powered**: Convert schemas between different SQL dialects
- **Export Options**: Multiple format support including PNG, SVG, and SQL scripts

## Troubleshooting

If you encounter any issues:
- Join the [ChartDB Discord community](https://discord.gg/chartdb) for live support
- File issues on the [GitHub repository](https://github.com/chartdb/chartdb/issues)
- Check the [ChartDB documentation](https://app.chartdb.io/docs) for guides

## See Also

+ [Third-Party Database Tools]({% link {{ page.version.version }}/third-party-database-tools.md %})
+ [Schema Design Overview]({% link {{ page.version.version }}/schema-design-overview.md %})
+ [Learn CockroachDB SQL]({% link {{ page.version.version }}/learn-cockroachdb-sql.md %})

{% comment %} Reference Links {% endcomment %}

[chartdb]: https://chartdb.io
