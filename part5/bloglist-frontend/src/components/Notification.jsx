const Notification = ({ message }) => {
  if (message === null) return null

  const style = {
    border: '1px solid',
    padding: 10,
    marginBottom: 10,
  }

  return (
    <div style={style}>
      {message}
    </div>
  )
}

export default Notification