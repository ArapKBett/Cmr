Create these three files in your Node.js project.

Install `pg` if not installed:

`npm install pg`

Adjust connection parameters in `db.js` to your PostgreSQL setup.

Run the example script to test:

`node example-query.js`

To verify the comment is sent, you can enable Postgres logging or intercept queries in your database to see something like:

`SELECT NOW() /* file=example-query.js */;`

The trick is `getCallerFile()` which uses `Error.captureStackTrace` and structured stack frames to find the first relevant caller file.

The patch intercepts all queries through the Pool’s `.query()` method and adds `/* file=callerFile.js */` as a SQL comment.

The file path here is just the basename `(filename.js)`, but you can include the full path by removing `path.basename` in `patchPGPool`.
