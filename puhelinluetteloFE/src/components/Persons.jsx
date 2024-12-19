import Name from './Name'

const Persons = ({ persons, removeName }) => {
  console.log(persons)
  return (
    <ul>
      {persons.map(name => 
        <Name key={name.id} name={name} removeName={() => removeName(name.id)} />
      )}
    </ul>
  )
}

export default Persons