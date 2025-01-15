import mongoose from "mongoose"

//testi

mongoose.set('strictQuery', false)

const url = "mongodb+srv://fullstack:kissa@cluster0.egzzy.mongodb.net/noteApp?retryWrites=true&w=majority&appName=Cluster0"

console.log('connecting to', url)
mongoose.connect(url)
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

  const noteSchema = new mongoose.Schema({
    content: {
      type: String,
      minlength: 5,
      required: true
    },
    important: Boolean
  })

noteSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

export default mongoose.model('Note', noteSchema)