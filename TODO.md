# TODO

Add an array that contains type `Vote` called `voteRecord` that contains both upvotes and downvotes.
- enum `VOTE_ENUM` { `DOWN` | `UP` } |
- type `Vote` { `user: User!`, `vote: VOTE_ENUM!` }
- `voteRecord: [Vote]`

- Implement voting functionality (Possibly through (a) custom resolver(s))
  - createUpvote
    - Can only create one per post per user, cannot create when downvote exists on post for user
  - deleteUpvote
    - Can only delete if upvote has already been created
  - createDownvote
    - Can only create one per post per user, cannot create when upvote exists on post for user
  - deleteDownvote
    - Can only delete if downvote has already been created