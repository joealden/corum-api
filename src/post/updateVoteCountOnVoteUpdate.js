const { fromEvent } = require('graphcool-lib')

/*
  This is a hook function that executes every time after a vote is updated.
  It updates the voteCount field on the post to reflect the vote update.
*/

const postIdFromVoteQuery = `
query getPostIdFromVote($voteId: ID!) {
  Vote(id: $voteId) {
    post {
      id
    }
  }
}
`

const getPostIdFromVote = (api, voteId) => {
  return api.request(postIdFromVoteQuery, { voteId }).then(queryResult => {
    if (queryResult.error) {
      return Promise.reject(queryResult.error)
    } else {
      return queryResult
    }
  })
}

const currentPostVoteCount = `
query getCurrentPostVoteCount($postId: ID!) {
  Post(id: $postId) {
    voteCount
  }
}
`

const getCurrentPostVoteCount = (api, postId) => {
  return api.request(currentPostVoteCount, { postId }).then(queryResult => {
    if (queryResult.error) {
      return Promise.reject(queryResult.error)
    } else {
      return queryResult
    }
  })
}

const updatePost = `
mutation updatePost($postId: ID!, $newVoteCount: Int!) {
  updatePost(id: $postId, voteCount: $newVoteCount) {
    voteCount
  }
}
`

const updatePostVoteCount = (api, variables) => {
  return api.request(updatePost, variables).then(queryResult => {
    if (queryResult.error) {
      return Promise.reject(queryResult.error)
    } else {
      return queryResult
    }
  })
}

module.exports = event => {
  const { data } = event
  const voteId = data.id
  const voteType = data.vote

  // Create Graphcool API (based on https://github.com/graphcool/graphql-request)
  const graphcool = fromEvent(event)
  const api = graphcool.api('simple/v1')

  let postId

  return getPostIdFromVote(api, voteId)
    .then(({ Vote }) => {
      postId = Vote.post.id
      return getCurrentPostVoteCount(api, postId)
    })
    .then(({ Post }) => {
      const oldVoteCount = Post.voteCount

      let newVoteCount
      if (voteType === 'VOTE_UP') {
        newVoteCount = oldVoteCount + 2
      } else if (voteType === 'VOTE_DOWN') {
        newVoteCount = oldVoteCount - 2
      } else {
        return Promise.reject('voteType is not defined')
      }

      return updatePostVoteCount(api, { postId, newVoteCount }).then(() => ({
        data
      }))
    })
    .catch(error => ({ error }))
}
