import { fromEvent } from 'graphcool-lib'

const VOTE_COUNT_TO_DELETE_POST = -1

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
const currentPostVoteCount = `
query getCurrentPostVoteCount($postId: ID!) {
  Post(id: $postId) {
    voteCount
  }
}
`
const getAllVoteIdsOnPost = `
query getAllVoteIdsOnPost($postId: ID!) {
  allVotes(filter: { post: { id: $postId }}) {
    id
  }
}
`
const deleteVote = `
mutation deletePost($voteId: ID!) {
  deleteVote(id: $voteId) {
    id
  }
}
`
const deletePost = `
mutation deletePost($postId: ID!) {
  deletePost(id: $postId) {
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

const deleteAllVotesOnPost = async (api, postId) => {
  const { allVotes } = await makeRequest(api, getAllVoteIdsOnPost, { postId })
  const voteIdList = allVotes.map(vote => vote.id)

  return await Promise.all(
    voteIdList.map(voteId => {
      return makeRequest(api, deleteVote, { voteId })
    })
  )
}

export default async event => {
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
      newVoteCount = oldVoteCount + 2
    } else if (voteType === 'VOTE_DOWN') {
      newVoteCount = oldVoteCount - 2
    } else {
      return Promise.reject('voteType is not defined')
    }

    if (newVoteCount <= VOTE_COUNT_TO_DELETE_POST) {
      await deleteAllVotesOnPost(api, postId)
      return await makeRequest(api, deletePost, { postId })
    } else {
      return await makeRequest(api, updatePost, { postId, newVoteCount })
    }
  } catch (error) {
    return { error }
  }
}
