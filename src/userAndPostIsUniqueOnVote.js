const { fromEvent } = require('graphcool-lib')

/*
  This is a hook function that executes everytime before a vote is created.
  It ensures that only 1 vote can exist on a post by a single user.
*/

const voteQuery = `
query VoteQuery($postId: ID!, $userId: ID!) {
  allVotes(filter: {
    AND: [{
      post: {
        id: $postId
      }
    }, {
      user: {
        id: $userId
      }
    }]
  }) {
    id
  }
}
`

module.exports = event => {
  // Retrieve payload from event
  const { data } = event
  const { postId, userId } = data

  // Create Graphcool API (based on https://github.com/graphcool/graphql-request)
  const graphcool = fromEvent(event)
  const api = graphcool.api('simple/v1')

  return api
    .request(voteQuery, { postId, userId })
    .then(({ allVotes }) => {
      if (allVotes.length !== 0) {
        return Promise.reject('This user already has a vote on this post')
      } else {
        return { data }
      }
    })
    .catch(error => {
      return { error }
    })
}
