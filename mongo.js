const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('give password as argument')
    process.exit(1)
}

const password = process.argv[2]
console.log(password, 'password')
const url =
    `mongodb+srv://lllzzzxxx666:SiFQt9AVO5j3Bq9c@lzx-cluster0.eemineq.mongodb.net/noteApp?retryWrites=true&w=majority`

// 设置 Mongoose 的 'strictQuery' 为 false。这个设置与查询严格性相关，当设置为 false 时，会对不符合模式的查询字段转换和剔除。
mongoose.set('strictQuery', false)

// 使用 Mongoose 连接到 MongoDB 数据库。
mongoose.connect(url)

// 创建一个的模式，定义了文档的数据结构, 包含两个字段：content 和 important。
const noteSchema = new mongoose.Schema({
    content: String,
    important: Boolean,
})

// 根据定义的模式创建一个模型，这个模型用来实例化和保存 notes 到数据库。这个模型将会成为所有数据库操作的基础
const Note = mongoose.model('Note', noteSchema)

// 查询
Note.find({
    important: false
}).then(result => {
    result.forEach(note => {
        console.log(note)
    })
    mongoose.connection.close()
})

// 创建一个新的 Note 实例。
// const note = new Note({
//     content: 'heo world',
//     important: false,
// })

// // 将新创建的 note 保存到数据库中。成功后，输出信息并关闭数据库连接。
// note.save().then(result => {
//     console.log('note saved!')
//     mongoose.connection.close()
// })

// 总结来说，你可以将这个过程想象为制造产品的流程：Schema 是产品设计图，Model 是根据设计图创建的产品模具，实例化就是用模具制造出一个具体的产品，
// 而 save 方法就是将这个产品包装并送到市场上（即保存到数据库）。如果没有执行 save，那么这个产品就永远不会离开工厂，也就是不会被保存到数据库中。