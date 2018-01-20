// @ts-check

import { fromEvent } from 'graphcool-lib'
import * as bcryptjs from 'bcryptjs'
import { makeRequest } from '../../utils/common'

const userQuery = `
  query UserQuery($email: String!) {
    User(email: $email) {
      id
      password
      username
    }
  }
`

export default async event => {
  try {
    // Retrieve payload from event
    const { email, password } = event.data

    // Create Graphcool API (based on https://github.com/graphcool/graphql-request)
    const graphcool = fromEvent(event)
    const api = graphcool.api('simple/v1')

    // Check if a user exists with the email entered
    const { User } = await makeRequest(api, userQuery, { email })
    if (!User) {
      return { error: 'Invalid credentials!' }
    }

    // Check if the user entered the correct password for the user
    const passwordIsCorrect = await bcryptjs.compare(password, User.password)
    if (!passwordIsCorrect) {
      return { error: 'Invalid credentials!' }
    }

    // Generate auth token
    const { id, username } = User
    const token = await graphcool.generateAuthToken(id, 'User')

    // Return the payload the user asked for
    return {
      data: {
        id,
        username,
        token
      }
    }
  } catch (error) {
    return { error }
  }
}
