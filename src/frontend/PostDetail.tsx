import React, {useEffect, useState} from 'react'
import axios from 'axios'
import {useNavigate, useParams} from 'react-router-dom'

const PostDetail = () => {
    const parameters = useParams()
    const [id, setId] = useState('')
    const [title, setTitle] = useState('')
    const [body, setBody] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        if (parameters?.id) {
            setId(parameters.id)
            axios.get(`http://127.0.0.1:8080/posts/${parameters.id}`)
                .then((response) => {
                    setTitle(response.data.message.title)
                    setBody(response.data.message.body)
                })
        }
    }, [])

    const handleTitle = (event: any) => {
        setTitle(event.target.value)
    }

    const handleBody = (event: any) => {
        setBody(event.target.value)
    }

    const handleSubmit = (event: any) => {
        event.preventDefault()
        axios.post('http://127.0.0.1:8080/posts', {
            title: title,
            body: body
        }, {headers: {'Content-Type': 'application/json'}})
            .then((response) => {
                setId(response.data.message.id)
            })
            .catch((error) => {
                    console.log('title: ', title)
                    console.log('body: ', body)
                    console.log(error)
                }
            )
    }

    const handleBack = () => {
        navigate('/')
    }

    return (
        <div>
            <div>
                <button id={'toListPage'} onClick={handleBack}>{'<--'}</button>
            </div>
            <div>
                <div id={'id'}>ID Label: {id}</div>
            </div>
            <div>
                <label htmlFor="titleField">Title Label:</label>
                <input
                    type="text"
                    id="titleField"
                    value={title}
                    onChange={handleTitle}
                />
            </div>
            <label htmlFor="bodyField">Body Label:</label>
            <input
                type="text"
                id="bodyField"
                value={body}
                onChange={handleBody}
            />
            <button onClick={handleSubmit} id={'submit'}>Submit</button>
        </div>
    )
}

export default PostDetail