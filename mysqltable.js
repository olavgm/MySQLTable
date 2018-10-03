var db = require('mysql-promise')()

var connection = {
  query: function (query, parameterValues) {
    return db.query.apply(db, arguments).then((rowsAndInfo) => {
      return rowsAndInfo[0]
    })
  }
}

function MySQLTable (config, tableName, tableId) {
  module.exports.tableName = tableName
  module.exports.tableId = tableId
  db.configure(config)
}

module.exports = MySQLTable

MySQLTable.prototype.read = (recordId) => {
  var sql = 'SELECT * FROM ' + module.exports.tableName + ' WHERE ' + module.exports.tableId + ' = ?'

  return connection.query(sql, recordId).then((results) => {
    if (results && results.length === 1) {
      return (results[0])
    } else {
      return null
    }
  })
}

MySQLTable.prototype.create = (record) => {
  var sql = 'INSERT INTO ' + module.exports.tableName + '('

  var keys = []
  var values = []

  for (var key in record) {
    if (key !== module.exports.tableId) {
      keys.push(key)
      values.push(record[key])
    }
  }

  sql += multiple('??', keys.length).join() + ') VALUES (' + multiple('?', values.length).join() + ')'

  return connection.query(sql, keys.concat(values)).then((result) => {
    return result.insertId
  })
}

MySQLTable.prototype.createMultiple = (records) => {
  var keys = []
  var valuesMatrix = []

  var record = records[0]

  var key, i

  for (key in record) {
    if (key !== module.exports.tableId) {
      keys.push(key)
    }
  }

  var values = []

  for (i = 0; i < records.length; i++) {
    record = records[i]

    for (key in record) {
      if (key !== module.exports.tableId) {
        values.push(record[key])
      }
    }

    valuesMatrix.push(values)
  }

  var valuesString = ''

  for (i = 0; i < valuesMatrix.length; i++) {
    if (valuesString.length > 0) {
      valuesString += ','
    }

    valuesString += '(' + multiple('?', keys.length).join() + ')'
  }

  var sql = 'INSERT INTO ' + module.exports.tableName + '('
  sql += multiple('??', keys.length).join() + ') VALUES ' + valuesString

  return connection.query(sql, keys.concat(values)).then(function (result) {
    return result.affectedRows
  })
}

MySQLTable.prototype.update = (record) => {
  var sql = 'UPDATE ' + module.exports.tableName + ' SET '

  var parameters = []
  var queryItems = []

  for (var key in record) {
    if (key !== module.exports.tableId) {
      queryItems.push('?? = ?')
      parameters.push(key, record[key])
    }
  }

  parameters.push(record[module.exports.tableId])

  sql += queryItems.join() + ' WHERE ' + module.exports.tableId + ' = ?'

  return connection.query(sql, parameters)
}

MySQLTable.prototype.delete = (recordId) => {
  var sql = 'DELETE FROM ' + module.exports.tableName + ' WHERE ' + module.exports.tableId + ' = ?'

  return connection.query(sql, recordId).then((result) => {
    return result.affectedRows
  })
}

MySQLTable.prototype.exists = (recordId) => {
  var sql = 'SELECT COUNT(*) count FROM ' + module.exports.tableName + ' WHERE ' + module.exports.tableId + ' = ?'

  return connection.query(sql, recordId).then((result) => {
    return result[0].count >= 1
  })
}

MySQLTable.prototype.runSql = (sql) => {
  return connection.query(sql).then((result) => {
    return result
  })
}

function multiple (item, times) {
  var result = []

  for (var i = 0; i < times; i++) {
    result.push(item)
  }

  return result
}
