import { fromEvent } from 'graphcool-lib'

/*
  This is a hook function that executes every time before a vote is created.
  It ensures that only 1 vote can exist on a post by a single user.
*/

/*
  This query fetches the single vote that belongs to the user.
  This works because there should only ever exist a single vote that
  has the same postId and userId, due to this very hook function.

  TODO: Very similar to 'corum/apollo/queries/userVote.gql',
  maybe use fragments to reduce duplication / import
*/
const voteQuery = `
query VoteQuery($postId: ID!, $userId: ID!) {
  allVotes(
    filter: { AND: [{ post: { id: $postId } }, { user: { id: $userId } }] }
  ) {
    id
  }
}
`

export default async event => {
  // Retrieve payload from event
  const { data } = event
  const { postId, userId } = data

  // Create Graphcool API (based on https://github.com/graphcool/graphql-request)
  const graphcool = fromEvent(event)
  const api = graphcool.api('simple/v1')

  try {
    const queryResult = await api.request(voteQuery, { postId, userId })

    if (queryResult.error) {
      return { error: 'Something went wrong on our end, sorry!' }
    }

    const { allVotes } = queryResult
    if (allVotes.length === 0) {
      return { data }
    } else {
      return { error: 'This user already has a vote on this post' }
    }
  } catch (error) {
    return { error }
  }
}
