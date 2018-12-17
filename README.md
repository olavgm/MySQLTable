# MySQLTable
**MySQLTable** is CRUD layer for MySQL. It is a cleaned up version of [data-promise](https://github.com/olavgm/data-promise). It uses promises, so it can be used with async/await.

## Installation

### npm

```
npm install @olavgm/mysqltable
```

## Usage

Let's say you have a table `users` on your MySQL database with a `userId` autogenerated key. Import the module, create a data object for the table you want to have the CRUD layer, and call any of the available methods on the data object.

```
// Import the module
var MySQLTable = require('mysqlpromise')

// MySQL connection details
var mysql = {
	host: 'mysqlhost.example.com',
	user: 'database_user',
	password: 'database_password',
	database: 'database_name',
	port: 3306
}

// Create a data object for the specific table
var usersTable = new MySQLTable(mysql, 'users', 'userId')

// Let's create a new record on the users table!
// Create the object that we will insert in the database (the table contains a field "name")
var user = {
	name: 'Lucía'
}

// Just call the method .create on the data object
usersTable.create(user).then((userId) => {
	// user created
	console.log(userId)
})
.catch((error) => {
	// error creating user
	console.log(error)
})

// Let's list all the records on the table (CRUDL?? :D)
usersTable.listAll().then((results) => {
	console.log(results)
})
.catch((error) => {
	// error retrieving the list
	console.log(error)
})

// Let's read one record on the list, filtering by Id (assume the userId is 1077)
usersTable.read(1077).then((results) => {
	console.log(results)
})
.catch((error) => {
	// error retrieving one record
	console.log(error)
})
```

## Available methods
- create
- createMultiple (pass an array of elements to create all at once)
- read
- update
- delete
- exists (returns `true` if there is a row with the specified Id)
- listAll
- runSql
