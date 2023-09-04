import React, {useEffect, useState} from 'react'
import axios from 'axios'
import {useNavigate} from 'react-router-dom'

const PostList = () => {
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        fetchAllPosts()
    }, [])


    const fetchAllPosts = () => {
        axios.get(`${process.env.BASE_URL}/api/posts`)
            .then((response) => {
                setPosts(response.data.message)
                setLoading(false)
            })
            .catch((error) => {
                setError(true)
                console.error('An error occurred while fetching the posts:', error)
                setLoading(false)
            })
    }

    const handleCreate = () => {
        navigate('/posts')
    }

    const handleView = (id: string) => {
        navigate(`/posts/${id}`)
    }

    return (
        <div>
            {error && <div className="error-banner">An error occurred</div>}

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
                        <tr onClick={() => handleView(post.id)} key={post.id}>
                            <td>{post.id}</td>
                            <td>{post.userId}</td>
                            <td>{post.title}</td>
                            <td>{post.body}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>}
            <button onClick={handleCreate} id={'createPost'}>Create Post</button>
        </div>
    )
}
export default PostList