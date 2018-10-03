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
  var sql = 'SELECT * FROM ?? WHERE ?? = ?'

  return connection.query(sql, [module.exports.tableName, module.exports.tableId, recordId]).then((results) => {
    if (results && results.length === 1) {
      return (results[0])
    } else {
      return null
    }
  })
}

MySQLTable.prototype.create = (record) => {
  var sql = 'INSERT INTO ?? ('

  var parameters = [module.exports.tableName]

  var keys = []
  var values = []

  for (var key in record) {
    if (key !== module.exports.tableId) {
      keys.push(key)
      values.push(record[key])
    }
  }

  sql += multiple('??', keys.length).join() + ') VALUES (' + multiple('?', values.length).join() + ')'

  parameters = parameters.concat(keys.concat(values))

  return connection.query(sql, parameters).then((result) => {
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

  var sql = 'INSERT INTO ?? ('
  sql += multiple('??', keys.length).join() + ') VALUES ' + valuesString

  var parameters = [module.exports.tableName]
  parameters = parameters.concat(keys.concat(values))

  return connection.query(sql, parameters).then((result) => {
    return result.affectedRows
  })
}

MySQLTable.prototype.update = (record) => {
  var sql = 'UPDATE ?? SET '

  var parameters = [module.exports.tableName]
  var queryItems = []

  for (var key in record) {
    if (key !== module.exports.tableId) {
      queryItems.push('?? = ?')
      parameters.push(key, record[key])
    }
  }

  sql += queryItems.join() + ' WHERE ?? = ?'

  parameters.push(module.exports.tableId)
  parameters.push(record[module.exports.tableId])

  return connection.query(sql, parameters).then((result) => {
    return result.affectedRows
  })
}

MySQLTable.prototype.delete = (recordId) => {
  var sql = 'DELETE FROM ?? WHERE ?? = ?'

  return connection.query(sql, [module.exports.tableName, module.exports.tableId, recordId]).then((result) => {
    return result.affectedRows
  })
}

MySQLTable.prototype.exists = (recordId) => {
  var sql = 'SELECT COUNT(*) count FROM ?? WHERE ?? = ?'

  return connection.query(sql, [module.exports.tableName, module.exports.tableId, recordId]).then((result) => {
    return result[0].count >= 1
  })
}

MySQLTable.prototype.listAll = (limit = 1000, offset = 0) => {
  var sql = 'SELECT * FROM ?? LIMIT ? OFFSET ?'

  return connection.query(sql, [module.exports.tableName, limit, offset]).then((result) => {
    return result
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
