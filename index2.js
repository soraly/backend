require('dotenv').config();
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const Person = require('./models/persons')

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


app.get('/', (request, response) => {
    // 由于参数是一个字符串，Express 自动将 Content-Type 头的值设置为 text/html。响应的状态代码默认为 200
    response.send('<h2>heo,world</h2>')
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(res => {
        response.json(res)
    })
})


// post 创建 persons
app.post('/api/persons', (request, response, next) => {
    const body = request.body;

    if (!body.name || !body.number) {
        return response.status(400).json({ error: 'name or number is missing!' });
    }

    Person.findOne({ name: body.name })
        .then(foundPerson => {
            if (foundPerson) {
                // 如果姓名已存在，提示前端使用 PUT 请求进行更新
                response.status(400).json({ error: 'name already exists, please update the number using PUT' });
            } else {
                // 如果姓名不存在，创建新条目
                const person = new Person({
                    name: body.name,
                    number: body.number,
                });
                person.save()
                    .then(savedPerson => {
                        response.json(savedPerson);
                    })
                    .catch(error => next(error));
            }
        })
        .catch(error => next(error));
});


// put 编辑 persons
app.put('/api/persons/:id', (request, response, next) => {

    const body = request.body

    if (!body.name) {
        return response.status(400).json({
            error: 'name missing'
        })
    }

    const person = {
        "name": body.name,
        "number": body.number,
    }
    Person.findByIdAndUpdate(request.params.id, person, {
        new: true,
        runValidators: true, context: 'query'
    }).then(res => {
        console.log('add success', res);
        response.json(res)
    }).catch((error) => {
        next(error)
    })

})

// 获取单个
app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(String(request.params.id)).then(res => {
        console.log(res, 'res')
        if (res) {
            response.json(res)
        } else {
            response.status(404).end()
        }
    }).catch(error => {
        console.log('erro123')
        next(error)
    })
})

// 删除
app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(200).send(({ msg: 'delete success' }))
        })
        .catch(error => next(error))
    // Person.deleteOne({ _id: request.params.id })
    //     .then(result => {
    //         if (result.deletedCount === 0) {
    //             // No document found with that ID
    //             return response.status(404).json({ message: "Not found" });
    //         }
    //         // Document was deleted
    //         response.json({ message: "delete success" });
    //     })
    //     .catch(error => {
    //         // Handle the error case
    //         response.status(500).json({ error: "Error deleting the document" });
    //     });
})

// 要放在路由后面，当匹配不到前面路由时会进入这儿
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

// Express 通过检查函数参数的数量来确定一个中间件是否是错误处理中间件。如果一个中间件函数有四个参数，Express 会认为它是一个错误处理中间件。
const errorLogger = (error, request, response, next) => {
    // console.log(error, request, response, 666)
    // 打印错误信息和堆栈跟踪
    console.log('Error message:', error.message);
    console.log('Error stack:', error.stack);

    // 打印请求的关键信息
    // console.log('Request URL:', request.url);
    // console.log('Request method:', request.method);
    // console.log('Request headers:', request.headers);

    if (request.body) { // 如果请求体不为空，则打印它
        console.log('Request body:', request.body);
    }

    if (error.name === 'CastError') {
        response.status(400).json({ error: 'malformatted id 参数格式不对' }); // Bad Request
    } else if (error.name === 'ValidationError') {
        response.status(400).json({ error: error.message }); // Bad Request
    } else {
        response.status(500).json({ error: 'service error' }); // Internal Server Error
    }
    next(error)
}

app.use(errorLogger)

const PORT = process.env.PORT2

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})