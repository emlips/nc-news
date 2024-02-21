# Northcoders News API

## Overview

This project uses `Node.js` and `PostgreSQL` to build a backend database and associated API. The app receives requests from the client at various endpoints, and responds with the required data from the news database.

Link to hosted version: https://nc-news-1d1v.onrender.com 

>**_NOTE:_** The minimum versions of **Node.js** and **Postgres** needed to run the project:
>* `Node.js:` v21.1.0
>* `Postgres (PostgreSQL):` 14.9
>
><br>

### Navigation:
1. [Getting started](#1-getting-started)
2. [Installing the dependencies](#2-installing-the-dependencies)
3. [Connecting to the required databases locally](#3-connecting-to-the-required-databases-locally)
4. [Seeding the local databases](#4-seeding-the-local-databases)
5. [Running the tests](#5-running-the-tests)

## 1. Getting started

Clone the repository:

```
$ git clone https://github.com/emlips/nc-news.git
```

Navigate to the repository:

```
$ cd nc-news
```

## 2. Installing the dependencies:

Use the `npm init` command to create a `package.json` file for the application:
```
$ npm init
```

Use the following commands to install the required dependencies for the application:

* To install [husky:](https://www.npmjs.com/package/husky)
```
$ npm install husky
```
* To install [dotenv:](https://www.npmjs.com/package/dotenv)
```
$ npm install dotenv --save
```
* To install [express:](https://www.npmjs.com/package/express)
```
$ npm install express
```
* To install [node-postgress:](https://www.npmjs.com/package/pg)
```
$ npm install pg
```
* To install [node-pg-format:](https://www.npmjs.com/package/pg-format)
```
$ npm install pg-format
```
* To install [jest:](https://www.npmjs.com/package/jest)
```
$ npm i -D jest
```
* To install [jest-sorted:](https://www.npmjs.com/package/jest-sorted)
```
$ npm i -D jest-sorted
```
* To install [supertest](https://www.npmjs.com/package/supertest)
```
$ npm i -D supertest
```

## 3. Connecting to the required databases locally:

Create a file `.env.test`

```
PGDATABASE=nc_news_test
```

Create a file `.env.development`

```
PGDATABASE=nc_news
```

## 4. Seeding the local databases:

Run the following scripts to setup and seed the databases locally:

* To **create** the databases:

```
$ npm run setup-dbs
```

* To **seed** the databases:

```
$ npm run seed
```

## 5. Running the tests:

Run all test suites using the following script:

```
$ npm run test
```

