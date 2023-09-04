import React, {useEffect, useState} from 'react'
import axios from 'axios'
import {useNavigate, useParams} from 'react-router-dom'

const PostDetail = () => {
    const parameters = useParams()
    const [id, setId] = useState('')
    const [title, setTitle] = useState('')
    const [body, setBody] = useState('')
    const [error, setError] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        if (parameters?.id) {
            setId(parameters.id)
            axios.get(`${process.env.BASE_URL}/api/posts/${parameters.id}`)
                .then((response) => {
                    setTitle(response.data.message.title)
                    setBody(response.data.message.body)
                }).catch((error) => {
                setError(true)
                console.error('An error occurred while fetching the post:', error)
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
        if (id) {
            axios.put(`${process.env.BASE_URL}/api/posts/${id}`, {
                title: title,
                body: body
            }, {headers: {'Content-Type': 'application/json'}})
                .then((response) => {
                    setTitle(response.data.message.title)
                    setBody(response.data.message.body)
                })
                .catch((error) => {
                    setError(true)
                    console.error('An error occurred while fetching the post:', error)
                })
        } else {
            axios.post(`${process.env.BASE_URL}/api/posts`, {
                title: title,
                body: body
            }, {headers: {'Content-Type': 'application/json'}})
                .then((response) => {
                    setId(response.data.message.id)
                })
                .catch((error) => {
                        setError(true)
                        console.error('An error occurred while fetching the post:', error)
                    }
                )
        }
    }

    const handleBack = () => {
        navigate('/')
    }

    const handleDelete = () => {
        axios.delete(`${process.env.BASE_URL}/api/posts/${id}`)
            .then(() => {
                navigate('/')
            })
            .catch((error) => {
                setError(true)
                console.error('An error occurred while fetching the post:', error)
            })
    }

    return (
        <div>
            {error && <div className="error-banner">An error occurred</div>}
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
            <div>
                <button onClick={handleSubmit} id={'submit'}>{id ? 'Update' : 'Submit'}</button>
            </div>
            {id
                ? <div>
                    <button onClick={handleDelete} id={'delete'}>Delete</button>
                </div>
                : ''
            }
        </div>
    )
}

export default PostDetail