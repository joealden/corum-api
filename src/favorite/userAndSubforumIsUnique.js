import { fromEvent } from 'graphcool-lib'
import { makeRequest } from '../../utils/common'

/*
  This is a hook function that executes every time before a favorite is created.
  It ensures that only 1 favorite of a subforum by a single user can happen.
*/

const favoriteQuery = `
query FavoriteQuery($userId: ID!, $subforumId: ID!) {
  allFavorites(
    filter: { AND: [{ user: { id: $userId } }, { subforum: { id: $subforumId } }] }
  ) {
    id
  }
}
`

export default async event => {
  // Retrieve payload from event
  const { data } = event
  const { userId, subforumId } = data

  // Create Graphcool API (based on https://github.com/graphcool/graphql-request)
  const graphcool = fromEvent(event)
  const api = graphcool.api('simple/v1')

  try {
    const { allFavorites } = await makeRequest(api, favoriteQuery, {
      userId,
      subforumId
    })

    if (allFavorites.length === 0) {
      return { data }
    } else {
      return { error: 'This user has already favorited this subforum' }
    }
  } catch (error) {
    return { error }
  }
}
