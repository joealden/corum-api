# TODO

Add an array that contains type `Vote` called `voteRecord` that contains both
upvotes and downvotes.

* enum `VOTE_ENUM` { `DOWN` | `UP` } |
* type `Vote` { `user: User!`, `vote: VOTE_ENUM!` }
* `voteRecord: [Vote]`

* Implement voting functionality (Possibly through (a) custom resolver(s))

  * upvotePost
    * Can only create one per post per user, cannot create when downvote exists
      on post for user
  * downvotePost
    * Can only create one per post per user, cannot create when upvote exists on
      post for user

* Look into JWT expiration
