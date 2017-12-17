const { fromEvent } = require('graphcool-lib')

/*
  This is a hook function that executes every time after a vote is created.
  It updates the voteCount field on the post to reflect the vote creation.
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
const currentPostVoteCount = `
query getCurrentPostVoteCount($postId: ID!) {
  Post(id: $postId) {
    voteCount
  }
}
`
const updatePost = `
mutation updatePost($postId: ID!, $newVoteCount: Int!) {
  updatePost(id: $postId, voteCount: $newVoteCount) {
    voteCount
  }
}
`

const makeRequest = async (api, query, variables) => {
  const queryResult = await api.request(query, variables)

  if (queryResult.error) {
    return Promise.reject(queryResult.error)
  } else {
    return queryResult
  }
}

module.exports = async event => {
  // Retrieve payload from event
  const { data } = event
  const voteId = data.id
  const voteType = data.vote

  // Create Graphcool API (based on https://github.com/graphcool/graphql-request)
  const graphcool = fromEvent(event)
  const api = graphcool.api('simple/v1')

  try {
    const { Vote } = await makeRequest(api, postIdFromVoteQuery, { voteId })
    const postId = Vote.post.id

    const { Post } = await makeRequest(api, currentPostVoteCount, { postId })
    const oldVoteCount = Post.voteCount

    let newVoteCount
    if (voteType === 'VOTE_UP') {
      newVoteCount = oldVoteCount + 1
    } else if (voteType === 'VOTE_DOWN') {
      newVoteCount = oldVoteCount - 1
    } else {
      return Promise.reject('voteType is not defined')
    }

    return await makeRequest(api, updatePost, { postId, newVoteCount })
  } catch (error) {
    return { error }
  }
}
