export default event => {
  const { data } = event
  data.voteCount = 0
  return { data }
}
