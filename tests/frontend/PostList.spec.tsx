import React from 'react'
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import PostList from '../../src/frontend/PostList'
import axios from 'axios'

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'), // This line will copy all the exports from the actual module
    useNavigate: () => mockNavigate,
}))

jest.mock('axios', () => ({
    get: jest.fn()
}))

beforeAll(() => {
    const posts = [
        {id: 1, userId: 'User 1', title: 'Post 1', body: 'Body 1'},
        {id: 2, userId: 'User 2', title: 'Post 2', body: 'Body 2'}
    ];
    (axios.get as jest.Mock).mockResolvedValue({data: {message: posts}})
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
            expect(axios.get).toHaveBeenCalledWith('http://127.0.0.1:8080/posts')
            expect(screen.getByText('Post 1')).toBeInTheDocument()
            expect(screen.getByText('User 1')).toBeInTheDocument()
            expect(screen.getByText('Body 1')).toBeInTheDocument()
            expect(screen.getByText('Post 2')).toBeInTheDocument()
            expect(screen.getByText('User 2')).toBeInTheDocument()
            expect(screen.getByText('Body 2')).toBeInTheDocument()
        })
    })

    test('displays an error if fetching posts fails', async () => {
        // given
        const error: Error = new Error('An error occurred');
        (axios.get as jest.Mock).mockRejectedValueOnce(error)
        console.error = jest.fn()

        // when
        render(<PostList/>)

        // then
        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
            expect(console.error).toHaveBeenCalledWith('An error occurred while fetching the posts:', error)
        })
    })
    test('create post button redirects to details page', async () => {
        // given
        render(<PostList/>)
        const button = await screen.findByText('Create Post')

        // when
        fireEvent.click(button)

        // then
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/posts')
        })
    })
    test('clicked rows redirect to specific detail page', async () => {
        // given
        render(<PostList/>)
        const row = await screen.findByText('1')

        // when
        fireEvent.click(row)

        // then
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/posts/1')
        })
    })
})
