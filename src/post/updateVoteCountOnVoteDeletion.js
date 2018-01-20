// @ts-check

import { fromEvent } from 'graphcool-lib'
import {
  VOTE_COUNT_TO_DELETE_POST,
  makeRequest,
  deleteAllVotesOnPost,
  currentPostVoteCount,
  getAllVoteIdsOnPost,
  deleteVote,
  deletePost,
  updatePost
} from '../../utils/common'

/*
  This is a hook function that executes every time after a vote is deleted.
  It updates the voteCount field on the post to reflect the vote deletion.
*/

/*
  Although similar, this query is different from that found in 'utils/common',
  It also queries for the 'vote' field.

  TODO: Extract common part of query into a GraphQL fragment?
*/
const postIdFromVoteQuery = `
query getPostIdFromVote($voteId: ID!) {
  Vote(id: $voteId) {
    post {
      id
    }
    vote
  }
}
`

export default async event => {
  // Retrieve payload from event
  const { data } = event
  const voteId = data.id

  // Create Graphcool API (based on https://github.com/graphcool/graphql-request)
  const graphcool = fromEvent(event)
  const api = graphcool.api('simple/v1')

  try {
    const { Vote } = await makeRequest(api, postIdFromVoteQuery, { voteId })
    const postId = Vote.post.id
    const voteType = Vote.vote

    const { Post } = await makeRequest(api, currentPostVoteCount, { postId })
    const oldVoteCount = Post.voteCount

    let newVoteCount
    if (voteType === 'VOTE_UP') {
      newVoteCount = oldVoteCount - 1
    } else if (voteType === 'VOTE_DOWN') {
      newVoteCount = oldVoteCount + 1
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
