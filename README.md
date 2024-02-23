# Northcoders News API

## Overview

This project uses `Node.js` and `PostgreSQL` to build a backend database and associated API. The app receives requests from the client at various endpoints, and responds with the required data from the news database.

Link to hosted version: https://nc-news-1d1v.onrender.com 

>**_NOTE:_** The minimum versions of **Node.js** and **Postgres** needed to run the project:
>* `Node.js:` v21.1.0
>* `Postgres (PostgreSQL):` 14.9
>

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

Use the `npm install` command to install the dependencies in the `package.json` file:
```
$ npm install
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

