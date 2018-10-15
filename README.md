# incident_management_system

REST API for incident management system using Node.js and Express.js framework with Mongoose.js for working with MongoDB. For access control this project use OAuth 2.0, with the help of OAuth2orize and Passport.js.

## Running project

You need to have installed Node.js and MongoDB 

### Install dependencies 

To install dependencies enter project folder and run following command:
```
npm install
```

### Creating demo data

To create demo data in your MongoDB execute ```generateData.js``` file 
```
node generateData.js
```

### Run server

To run server execute:
```
node bin/www 
```

### Make Requests

Creating and refreshing access tokens:

For user.

```
http POST http://localhost:5000/api/user/oauth/token grant_type=password client_id=heroku_client client_secret=SomeRandomCharsAndNumbers username=myapi password=abc1234
http POST http://localhost:5000/api/user/oauth/token grant_type=refresh_token client_id=heroku_client client_secret=SomeRandomCharsAndNumbers refresh_token=[TOKEN]
```

For resolvers

```
http POST http://localhost:5000/api/resolver/oauth/token grant_type=password client_id=android client_secret=SomeRandomCharsAndNumbers username=resolver password=abcabc
http POST http://localhost:5000/api/user/oauth/token grant_type=refresh_token client_id=android client_secret=SomeRandomCharsAndNumbers refresh_token=[TOKEN]
```

Creating your ticket data:
```
http POST http://localhost:5000/api/tickets title=NewArticle description='Lorem ipsum dolar sit amet' Authorization:'Bearer PUT_YOUR_TOKEN_HERE'
```

Updating your article data:
```
http PUT http://localhost:5000/api/articles/YOUR_ARTICLE_ID_HERE title=NewArticleUpdated description='Lorem ipsum dolar sit amet' Authorization:'Bearer PUT_YOUR_TOKEN_HERE'
```

Getting your data 
```
http http://localhost:5000/api/users/info Authorization:'Bearer PUT_YOUR_TOKEN_HERE'
http http://localhost:5000/api/tickets Authorization:'Bearer PUT_YOUR_TOKEN_HERE'
```

## Modules used

Some of non standard modules used:
* [express](https://www.npmjs.com/package/mongoose)
* [mongoose](https://www.npmjs.com/package/mongoose)
* [dotenv](https://www.npmjs.com/package/dotenv)
* [async](https://www.npmjs.com/package/async)
* [oauth2orize](https://www.npmjs.com/package/oauth2orize)
* [passport](https://www.npmjs.com/package/passport)

## Tools used

[httpie](https://github.com/jkbr/httpie) - command line HTTP client

### JSHint

For running JSHint  
```
sudo npm install jshint -g
jshint libs/**/*.js generateData.js
```

## Author

This example was created by Siddhartha Bokaria ([@bokariasid](http://twitter.com/bokariasid)).
