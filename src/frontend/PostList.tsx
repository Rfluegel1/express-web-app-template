import React, {useEffect, useState} from 'react'
import axios from 'axios'

const PostList = () => {
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Fetch all posts from the backend
        axios.get('http://127.0.0.1:8080/posts')
            .then((response) => {
                setPosts(response.data.message)
                setLoading(false)
            })
            .catch((error) => {
                console.error('An error occurred while fetching the posts:', error)
                setLoading(false)
            })
    }, [])


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
        </div>
    )
}
export default PostList