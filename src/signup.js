const fromEvent = require('graphcool-lib').fromEvent
const bcryptjs = require('bcryptjs')
const validator = require('validator')

const userQuery = `
query UserQuery($email: String!) {
  User(email: $email){
    id
    password
  }
}`

const createUserMutation = `
mutation CreateUserMutation($email: String!, $passwordHash: String!) {
  createUser(
    email: $email,
    password: $passwordHash
  ) {
    id
  }
}`

const getGraphcoolUser = (api, email) => {
	return api.request(userQuery, { email }).then(userQueryResult => {
		if (userQueryResult.error) {
			return Promise.reject(userQueryResult.error)
		} else {
			return userQueryResult.User
		}
	})
}

const createGraphcoolUser = (api, email, passwordHash) => {
	return api
		.request(createUserMutation, { email, passwordHash })
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
	const { email, password } = event.data

	// Create Graphcool API (based on https://github.com/graphcool/graphql-request)
	const graphcool = fromEvent(event)
	const api = graphcool.api('simple/v1')

	const SALT_ROUNDS = 10

	if (validator.isEmail(email)) {
		return (
			getGraphcoolUser(api, email)
				.then(graphcoolUser => {
					if (!graphcoolUser) {
						return bcryptjs
							.hash(password, SALT_ROUNDS)
							.then(hash => createGraphcoolUser(api, email, hash))
					} else {
						return Promise.reject('This email address is already in use')
					}
				})
				.then(graphcoolUserId => {
					return graphcool
						.generateAuthToken(graphcoolUserId, 'User')
						.then(token => {
							return { data: { id: graphcoolUserId, token } }
						})
				})
				// TODO: Investigate if this is dangerous (If it will log something to the user it shouldn't)
				.catch(error => {
					return { error }
				})
		)
	} else {
		return { error: 'The address entered is not a valid email' }
	}
}
