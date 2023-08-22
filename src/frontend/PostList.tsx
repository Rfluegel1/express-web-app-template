import React, {useEffect, useState} from 'react'
import axios from 'axios'
import {useNavigate} from 'react-router-dom'

const PostList = () => {
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        fetchAllPosts()
    }, [])


    const fetchAllPosts = () => {
        axios.get('http://127.0.0.1:8080/posts')
            .then((response) => {
                setPosts(response.data.message)
                setLoading(false)
            })
            .catch((error) => {
                console.error('An error occurred while fetching the posts:', error)
                setLoading(false)
            })
    }

    const handleRedirect = () => {
        navigate('/posts')
    }

    return (
        <div>
            {loading
                ? <div>Loading...</div>
                : <table>
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>User ID</th>
                        <th>Title</th>
                        <th>Content</th>
                    </tr>
                    </thead>
                    <tbody id={'postRows'}>
                    {posts.map((post: any) => (
                        <tr key={post.id}>
                            <td>{post.id}</td>
                            <td>{post.userId}</td>
                            <td>{post.title}</td>
                            <td>{post.body}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>}
            <button onClick={handleRedirect} id={'createPost'}>Create Post</button>
        </div>
    )
}
export default PostList