[![Build
Status](https://travis-ci.org/nus-mtp/attack-on-tutor.svg?branch=master)](https://travis-ci.org/nus-mtp/attack-on-tutor)
[![Test
Coverage](https://codeclimate.com/github/nus-mtp/attack-on-tutor/badges/coverage.svg)](https://codeclimate.com/github/nus-mtp/attack-on-tutor/coverage)
[![Code
Climate](https://codeclimate.com/github/nus-mtp/attack-on-tutor/badges/gpa.svg)](https://codeclimate.com/github/nus-mtp/attack-on-tutor)

# Setup

NOTE: Developer mode does not exist at this stage of the project, so multiple student accounts are required to fully test features in the lobby.


## Installation

1. Clone the repository
2. In the root directory, ```npm install```
3. Set up the database (instructions below)
4. To run the app, ```node app.js``` or ```npm start```
5. Visit localhost:8081 in your browser to access the application


## Database Setup

### 1. Install MySQL
Ubuntu

```
$bash sudo apt-get install mysql-server
```
OSX
```
$bash brew install mysql
$bash mysql.server start
```
Windows

Follow instructions on MySQL official site:
https://dev.mysql.com/downloads/windows/


### 2. Setup database account

Create a new user for accessing the database. Run the following 3 commands:

```
CREATE USER 'sample_username'@'localhost' IDENTIFIED BY 'sample_password';
```

Grant user privilege:

```
GRANT ALL PRIVILEGES ON * . * TO 'sample_username'@'localhost';
```

Update database privilege:

```
FLUSH PRIVILEGES;
```

The `sample_username` and `sample_password` are used in the config.json for accessing the database.


### 3. Create database

Create a database with name `sample_database_name`.
```
CREATE DATABASE sample_database_name
```


### 4. Add database configuration to `config.json`

Add the following things to config.json.

``` json
config.json
------------------

{
  ...

  "db-host": "127.0.0.1",
  "db-dialect": "mysql",
  "db-name": "sample_database_name",
  "db-username": "sample_username",
  "db-password": "sample_password",
}

```

### 5. Migrate and set up database using the [Sequelize CLI](https://github.com/sequelize/cli)

Global install
```
npm install -g sequelize-cli
sequelize db:migrate
```

Local install to node_modules folder
```
npm install --save sequelize-cli
.\node_modules\.bin\sequelize db:migrate
```

# Development

## Naming Branches

Branch names should be formatted as such:

`[tag]/[component]/[feature]`

### Tags

| Tag | Description |
| --- | --- |
| wip | Preliminary work |
| bug | Bug fixing |
| exp | Experimental/test codes |
| ftr | Features to be implemented |
| test | Testing |
