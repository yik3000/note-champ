## Note organizer with OCR and Full Text Search
:beer: [Learn More](https://hacktoberfest.digitalocean.com/#resources)


=======================



Table of Contents
-----------------

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [List of Packages](#list-of-packages)

Features
--------
- Flash notifications
- MVC Project Structure
- Node.js clusters support
- Sass stylesheets (auto-compiled via middleware)
- Bootstrap 3 + Extra Themes
- Contact Form (powered by Mailgun, Sendgrid or Mandrill)
- CSRF protection

Prerequisites
-------------

- [MongoDB](https://www.mongodb.org/downloads)
- [Node.js 6.0+](http://nodejs.org)
- Elastic Search 
- Tesseract 

Getting Started
---------------

The easiest way to get started is to clone the repository:

```bash
# Get the latest snapshot
git clone --depth=1 https://github.com/yik3000/note-champ.git myproject

# Change directory
cd myproject

# Install NPM dependencies
npm install

node app.js
```



List of Packages
----------------

| Package                         | Description                                                           |
| ------------------------------- | --------------------------------------------------------------------- |
| async                           | Utility library that provides asynchronous control flow.              |
| bcrypt-nodejs                   | Library for hashing and salting user passwords.                       |
| cheerio                         | Scrape web pages using jQuery-style syntax.                           |
| clockwork                       | Clockwork SMS API library.                                            |
| connect-mongo                   | MongoDB session store for Express.                                    |
| dotenv                          | Loads environment variables from .env file.                                                |
| express                         | Node.js web framework.                                                |
| body-parser                     | Express 4 middleware.                                                 |
| express-session                 | Express 4 middleware.                                                 |
| morgan                          | Express 4 middleware.                                                 |
| compression                     | Express 4 middleware.                                                 |
| errorhandler                    | Express 4 middleware.                                                 |
| serve-favicon                   | Express 4 middleware offering favicon serving and caching.            |
| express-flash                   | Provides flash messages for Express.                                  |
| express-status-monitor          | Reports real-time server metrics for Express.                                  |
| express-validator               | Easy form validation for Express.                                     |
| pug (jade)                      | Template engine for Express.                                          |
| lob                             | Lob API library                                                       |
| lusca                           | CSRF middleware.                                                      |
| mongoose                        | MongoDB ODM.                                                          |
| node-sass-middleware            | Sass middleware compiler.                                                 |
| nodemailer                      | Node.js library for sending emails.                                   |
| passport                        | Simple and elegant authentication library for node.js                 |
| passport-local                  | Sign-in with Username and Password plugin.                            |
| request                         | Simplified HTTP request library.                                      |
| stripe                          | Offical Stripe API library.                                           |
| lodash                          | Handy JavaScript utlities library.                                    |
| validator                       | Used in conjunction with express-validator in **controllers/api.js**. |
| mocha                           | Test framework.                                                       |
| chai                            | BDD/TDD assertion library.                                            |
| supertest                       | HTTP assertion library.                                               |

Contributing
------------
