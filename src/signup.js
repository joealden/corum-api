const fromEvent = require('graphcool-lib').fromEvent
const bcryptjs = require('bcryptjs')
const validator = require('validator')

const userQuery = `
query UserQuery($email: String!, $username: String!) {
  allUsers(filter: {
    OR: [{
      email: $email
    }, {
      username: $username
    }]
  }) {
    id
    password
    email
    username
  }
}`

const createUserMutation = `
mutation CreateUserMutation($username: String!, $email: String!, $passwordHash: String!) {
  createUser(
    username: $username
    email: $email,
    password: $passwordHash
  ) {
    id
  }
}`

const getGraphcoolUsers = (api, email, username) => {
  return api.request(userQuery, { email, username }).then(userQueryResult => {
    if (userQueryResult.error) {
      return Promise.reject(userQueryResult.error)
    } else {
      return userQueryResult.allUsers
    }
  })
}

const createGraphcoolUser = (api, username, email, passwordHash) => {
  return api
    .request(createUserMutation, { username, email, passwordHash })
    .then(userMutationResult => {
      return userMutationResult.createUser.id
    })
}

module.exports = function(event) {
  if (!event.context.graphcool.pat) {
    console.log('Please provide a valid root token!')
    return { error: 'Email Signup not configured correctly.' }
  }

  // Retrieve payload from event
  const { username, email, password } = event.data

  // Create Graphcool API (based on https://github.com/graphcool/graphql-request)
  const graphcool = fromEvent(event)
  const api = graphcool.api('simple/v1')

  const SALT_ROUNDS = 10

  if (validator.isEmail(email)) {
    return getGraphcoolUsers(api, email, username)
      .then(graphcoolUsers => {
        if (graphcoolUsers.length === 0) {
          return bcryptjs
            .hash(password, SALT_ROUNDS)
            .then(hash => createGraphcoolUser(api, username, email, hash))
        } else if (
          graphcoolUsers.length === 2 ||
          (graphcoolUsers[0].email === email &&
            graphcoolUsers[0].username === username)
        ) {
          return Promise.reject('The email address and username are in use')
        } else if (graphcoolUsers[0].email === email) {
          return Promise.reject('The email address is in use')
        } else if (graphcoolUsers[0].username === username) {
          return Promise.reject('The username is in use')
        } else {
          return Promise.reject('An unknown error occured')
        }
      })
      .then(id => {
        return graphcool.generateAuthToken(id, 'User').then(token => {
          return { data: { id, token } }
        })
      })
      .catch(error => {
        return { error }
      })
  } else {
    return { error: 'The email address entered is not valid' }
  }
}
