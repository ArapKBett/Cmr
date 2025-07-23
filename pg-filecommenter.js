// pg-filecommenter.js
const path = require('path');

/**
 * Extract the filename of the caller (first non-node_modules and non-wrapper file)
 */
function getCallerFile() {
  const origPrepareStackTrace = Error.prepareStackTrace;

  Error.prepareStackTrace = (_, stack) => stack; // return structured stack
  
  const err = new Error();
  Error.captureStackTrace(err, getCallerFile); // exclude getCallerFile frame itself
  
  const stack = err.stack;
  Error.prepareStackTrace = origPrepareStackTrace;

  for (const frame of stack) {
    const filename = frame.getFileName();

    if (
      filename && 
      !filename.includes('node_modules') && 
      !filename.endsWith('pg-filecommenter.js')
    ) {
      return filename;
    }
  }
  return 'unknown';
}

/**
 * Append comment with file path to SQL query text
 * Supports plain text query or QueryConfig object
 */
function addFileCommentToQuery(text, values, file) {
  const comment = `/* file=${file} */`;

  if (typeof text === 'string') {
    if (text.trim().endsWith(';')) {
      // Insert before trailing semicolon
      return [text.trim().slice(0, -1) + ' ' + comment + ';', values];
    }
    return [text + ' ' + comment, values];
  }

  // QueryConfig object case
  if (typeof text === 'object' && text.text) {
    // Avoid duplicating comment if present
    if (!text.text.includes(comment)) {
      text.text = text.text.trim().replace(/;?$/, '') + ' ' + comment + ';';
    }
    return [text, values];
  }

  return [text, values];
}

/**
 * Monkey patch pg.Pool instance to add file path comments in queries
 * @param {import('pg').Pool} pool
 */
function patchPGPool(pool) {
  const origQuery = pool.query;

  pool.query = function patchedQuery(text, values, callback) {
    const file = path.basename(getCallerFile());

    // Detect parameters shift: query(text), query(text, values), query(text, callback)
    if (typeof values === 'function') {
      callback = values;
      values = undefined;
    }

    const [newText, newValues] = addFileCommentToQuery(text, values, file);

    return origQuery.call(this, newText, newValues, callback);
  };
}

module.exports = { patchPGPool };
      
