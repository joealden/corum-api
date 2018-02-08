// @ts-check

import { fromEvent } from 'graphcool-lib'
import * as bcryptjs from 'bcryptjs'
import * as validator from 'validator'
import { makeRequest } from '../../utils/common'

// TODO: Remove the password field as it isn't needed?
const userQuery = `
  query UserQuery($email: String!, $username: String!) {
    allUsers(filter: { OR: [{ email: $email }, { username: $username }] }) {
      id
      password
      email
      username
    }
  }
`

const createUserMutation = `
  mutation CreateUserMutation(
    $username: String!
    $email: String!
    $passwordHash: String!
  ) {
    createUser(username: $username, email: $email, password: $passwordHash) {
      id
    }
  }
`

export default async event => {
  // Retrieve payload from event
  const { username, email, password } = event.data

  // Create Graphcool API (based on https://github.com/graphcool/graphql-request)
  const graphcool = fromEvent(event)
  const api = graphcool.api('simple/v1')

  const SALT_ROUNDS = 10

  try {
    // Check is email is valid
    if (validator.isEmail(email) === false) {
      return { error: 'The email address entered is not valid' }
    }

    // Fetch all users that match the users input (if any)
    const { allUsers } = await makeRequest(api, userQuery, { email, username })

    // If no users exists with the same details, create the user
    if (allUsers.length === 0) {
      // Generate the password hash that will be stored in the DB
      const passwordHash = await bcryptjs.hash(password, SALT_ROUNDS)

      // Create the user
      const { createUser } = await makeRequest(api, createUserMutation, {
        email,
        username,
        passwordHash
      })

      // Generate auth token
      const { id } = createUser
      const token = await graphcool.generateAuthToken(id, 'User')

      // Return the payload the user asked for
      return {
        data: {
          id,
          token
        }
      }
    }

    // If any users do exist, throw the correct informative error
    if (
      allUsers.length === 2 ||
      (allUsers[0].email === email && allUsers[0].username === username)
    ) {
      return { error: 'The email address and username are in use' }
    } else if (allUsers[0].email === email) {
      return { error: 'The email address is in use' }
    } else if (allUsers[0].username === username) {
      return { error: 'The username is in use' }
    } else {
      return { error: 'An unknown error occured' }
    }
  } catch (error) {
    return { error }
  }
}
