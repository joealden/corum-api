# TODO

* Make it so a user can only create of vote in the name of themselves (Look into
  extending this to post, comment etc.)
* Make it so that only the user of a vote can update and delete it
* Convert auth js to async await (Look at example in framework repo)
* Look into JWT expiration
* Look into moving config like vote threshold out into a .env file
* Look into the security issues with returning the user's ID
  * Could someone create a valid token with the user's ID (JWT secret?)
  * Maybe just user the users username for checking if they are logged in on the
    client?
