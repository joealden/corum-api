const fromEvent = require('graphcool-lib').fromEvent
const bcryptjs = require('bcryptjs')

const userQuery = `
query UserQuery($email: String!) {
  User(email: $email){
    id
    password
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

module.exports = event => {
	if (!event.context.graphcool.pat) {
		console.log('Please provide a valid root token!')
		return { error: 'Email Authentication not configured correctly.' }
	}

	// Retrieve payload from event
	const { email, password } = event.data

	// Create Graphcool API (based on https://github.com/graphcool/graphql-request)
	const graphcool = fromEvent(event)
	const api = graphcool.api('simple/v1')

	return getGraphcoolUser(api, email)
		.then(graphcoolUser => {
			if (!graphcoolUser) {
				//returning same generic error so user can't find out what emails are registered.
				return Promise.reject('Invalid Credentials')
			} else {
				return bcryptjs
					.compare(password, graphcoolUser.password)
					.then(passwordCorrect => {
						if (passwordCorrect) {
							return graphcoolUser.id
						} else {
							return Promise.reject('Invalid Credentials')
						}
					})
			}
		})
		.then(graphcoolUserId => {
			return graphcool.generateAuthToken(graphcoolUserId, 'User')
		})
		.then(token => {
			return { data: { token } }
		})
		.catch(error => {
			return { error }
		})
}
