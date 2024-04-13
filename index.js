const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()

// 使express显示静态内容
app.use(express.static('build'))

app.use(cors())
// app.use(morgan('combined'));

// express.json() 中间件会自动解析请求体中的 JSON 字符串，将其转换为 js 对象。之后这个对象就会被设置到 request.body 属性上，
//这样在后续的请求处理中，你就可以直接访问这些数据了。

//如果没有这个中间件，你将无法直接从 request.body 中读取 JSON 格式的输入数据，因为默认情况下，Express 不会解析请求体中的内容
app.use(express.json())

const requestLogger = (request, response, next) => {
    next()
}
app.use(requestLogger)

let notes = [
    {
        id: 1,
        content: "HTML is easy",
        date: "2022-05-30T17:30:31.098Z",
        important: true
    },
    {
        id: 2,
        content: "Browser can execute only Javascript",
        date: "2022-05-30T18:39:34.091Z",
        important: false
    },
    {
        id: 3,
        content: "GET and POST are the most important methods of HTTP protocol",
        date: "2022-05-30T19:20:14.298Z",
        important: true
    }
]

let persons = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]

const generateId = () => {
    const maxId = notes.length > 0
        ? Math.max(...notes.map(n => n.id))
        : 0
    return maxId + 1
}

app.get('/', (request, response) => {
    // 由于参数是一个字符串，Express 自动将 Content-Type 头的值设置为 text/html。响应的状态代码默认为 200
    response.send('<h2>heo,world</h2>')
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

// get
app.get('/api/notes/:id', (request, response) => {
    const id = Number(request.params.id);
    const note = notes.find(item => item.id === id);
    if (note) {
        response.json(note);
    } else {
        response.status(404).end()
    }
})

// post 创建 
app.post('/api/notes', (request, response) => {
    const body = request.body

    if (!body.content) {
        return response.status(400).json({
            error: 'content missing'
        })
    }

    const note = {
        content: body.content,
        important: body.important || false,
        date: new Date(),
        id: generateId(),
    }

    notes = notes.concat(note)

    response.json(note)
})

// post 创建 persons
app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.name) {
        return response.status(400).json({
            error: 'name missing'
        })
    }

    const person = {
        "name": body.name,
        "number": body.number,
        id: generateId(),
    }

    // 此处是用来更新数据库数据的，新增后列表增加一项
    persons = persons.concat(person)

    response.json(person)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    const person = persons.find(item => item.id === id);
    console.log(person, 'person')
    if (person) {
        response.json(person)
    } else {
        response.send(`<div>没有id是${id}的人</div>`)
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    persons = persons.filter(item => item.id !== id);

    response.json({ "name": "delete success", })
})


// delete
app.delete('/api/notes/:id', (request, response) => {
    const id = Number(request.params.id);
    notes = notes.filter(item => item.id !== id)
    response.status(204).end()
})

app.get('/api/notes', (request, response) => {
    response.json(notes)
})

// 要放在路由后面，当匹配不到前面路由时会进入这儿
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = 3002

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})