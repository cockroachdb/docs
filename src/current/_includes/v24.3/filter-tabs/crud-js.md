{% assign tab_names_html = "Use <strong>node-postgres</strong>;Use <strong>Sequelize</strong>;Use <strong>Knex.js</strong>;Use <strong>Prisma</strong>;Use <strong>TypeORM</strong>" %}
{% assign html_page_filenames = "build-a-nodejs-app-with-cockroachdb.html;build-a-nodejs-app-with-cockroachdb-sequelize.html;build-a-nodejs-app-with-cockroachdb-knexjs.html;build-a-nodejs-app-with-cockroachdb-prisma.html;build-a-typescript-app-with-cockroachdb.html" %}

{% include filter-tabs.md tab_names=tab_names_html page_filenames=html_page_filenames page_folder=page.version.version %}
