# Naming Branches

Branch names should be formated as such:

`[tag]/[component]/[feature]`

## Tags

| Tag | Description |
| --- | --- |
| wip | Preliminary work |
| bug | Bug fixing |
| exp | Experimental/test codes |
| ftr | Features to be implemented |
| test | Testing |


# Database Setup

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

Please follow instruction on MySQL official site:
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
