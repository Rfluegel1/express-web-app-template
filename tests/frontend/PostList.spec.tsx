import React from 'react'
import {render, screen, waitFor} from '@testing-library/react'
import PostList from '../../src/frontend/PostList'
import axios from 'axios'

jest.mock('axios', () => ({
    get: jest.fn()
}))

beforeAll(() => {
    const posts = [
        {id: 1, userId: 'User 1', title: 'Post 1', body: 'Body 1'},
        {id: 2, userId: 'User 2', title: 'Post 2', body: 'Body 2'}
    ];
    (axios.get as jest.Mock).mockResolvedValue({data: posts})

})

describe('PostsList component', () => {
    test('renders loading message initially', async () => {
        // when
        render(<PostList/>)

        // then
        await waitFor(() => {
            expect(screen.getByText('Loading...')).toBeInTheDocument()
        })

    })

    test('fetches and displays posts', async () => {
        // when
        render(<PostList/>)

        // then
        await waitFor(() => {
            expect(screen.getByText('Post 1')).toBeInTheDocument()
            expect(screen.getByText('User 1')).toBeInTheDocument()
            expect(screen.getByText('Body 1')).toBeInTheDocument()
            expect(screen.getByText('Post 2')).toBeInTheDocument()
            expect(screen.getByText('User 2')).toBeInTheDocument()
            expect(screen.getByText('Body 2')).toBeInTheDocument()
        })
    })

    test('displays an error if fetching posts fails', async () => {
        let error: Error = new Error('An error occurred');
        (axios.get as jest.Mock).mockRejectedValueOnce(error)
        console.error = jest.fn()

        render(<PostList/>)

        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
            expect(console.error).toHaveBeenCalledWith('An error occurred while fetching the posts:', error)
        })
    })
})
