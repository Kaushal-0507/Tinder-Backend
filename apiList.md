## All the required for the Tinder App:

## authRouter

POST - /signUp
POST - /login
POST - /logout

## profileRouter

GET - /profile/view
PATCH - /profile/edit
PATCH - /profile/password

## connectionRequestRouter

POST - /request/sent/interested/:userId
POST - /request/sent/ignore/:userId
POST - /request/review/accepted/:requestId
POST - /request/review/rejected/:requestId

## userRouter

GET - /user/connections
GET - /user/requests
GET - /user/feed => All the other users profile on the landing page
