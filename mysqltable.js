class MySQLTable {
  constructor (config, tableName, tableId) {
    this.tableName = tableName
    this.tableId = tableId

    var db = require('mysql-promise')()
    db.configure(config)

    this.connection = {
      query: function (query, parameterValues) {
        return db.query.apply(db, arguments).then((rowsAndInfo) => {
          return rowsAndInfo[0]
        })
      }
    }
  }

  read (recordId) {
    var sql = 'SELECT * FROM ?? WHERE ?? = ?'

    return this.connection.query(sql, [this.tableName, this.tableId, recordId]).then((results) => {
      if (results && results.length === 1) {
        return (results[0])
      } else {
        return null
      }
    })
  }

  create (record) {
    var sql = 'INSERT INTO ?? ('

    var parameters = [this.tableName]

    var keys = []
    var values = []

    for (var key in record) {
      if (key !== this.tableId) {
        keys.push(key)
        values.push(record[key])
      }
    }

    sql += multiple('??', keys.length).join() + ') VALUES (' + multiple('?', values.length).join() + ')'

    parameters = parameters.concat(keys.concat(values))

    return this.connection.query(sql, parameters).then((result) => {
      return result.insertId
    })
  }

  createMultiple (records) {
    var keys = []
    var valuesMatrix = []

    var record = records[0]

    var key, i

    for (key in record) {
      if (key !== this.tableId) {
        keys.push(key)
      }
    }

    var values = []

    for (i = 0; i < records.length; i++) {
      record = records[i]

      for (key in record) {
        if (key !== this.tableId) {
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

    var parameters = [this.tableName]
    parameters = parameters.concat(keys.concat(values))

    return this.connection.query(sql, parameters).then((result) => {
      return result.affectedRows
    })
  }

  update (record) {
    var sql = 'UPDATE ?? SET '

    var parameters = [this.tableName]
    var queryItems = []

    for (var key in record) {
      if (key !== this.tableId) {
        queryItems.push('?? = ?')
        parameters.push(key, record[key])
      }
    }

    sql += queryItems.join() + ' WHERE ?? = ?'

    parameters.push(this.tableId)
    parameters.push(record[this.tableId])

    return this.connection.query(sql, parameters).then((result) => {
      return result.affectedRows
    })
  }

  delete (recordId) {
    var sql = 'DELETE FROM ?? WHERE ?? = ?'

    return this.connection.query(sql, [this.tableName, this.tableId, recordId]).then((result) => {
      return result.affectedRows
    })
  }

  exists (recordId) {
    var sql = 'SELECT COUNT(*) count FROM ?? WHERE ?? = ?'

    return this.connection.query(sql, [this.tableName, this.tableId, recordId]).then((result) => {
      return result[0].count >= 1
    })
  }

  listAll (limit = 1000, offset = 0) {
    var sql = 'SELECT * FROM ?? LIMIT ? OFFSET ?'

    return this.connection.query(sql, [this.tableName, limit, offset]).then((result) => {
      return result
    })
  }

  runSql (sql, parameters = []) {
    return this.connection.query(sql, parameters).then((result) => {
      return result
    })
  }
}

module.exports = MySQLTable

function multiple (item, times) {
  var result = []

  for (var i = 0; i < times; i++) {
    result.push(item)
  }

  return result
}
