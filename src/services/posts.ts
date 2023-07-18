import Post from "../domain/post";

export const post = (userId: String, title: String, message: String) : Post => {
    return new Post(userId, title, message)
}

export default {post}