import React from 'react'
import {act, render, screen} from '@testing-library/react'
import PostList from '../../src/frontend/PostList'
import axios from 'axios'

jest.mock('axios', () => ({
    get: jest.fn()
}))


describe('PostsList component', () => {
    test('renders loading message initially', () => {
        //given
        (axios.get as jest.Mock).mockResolvedValueOnce({data: {}})

        // when
        act(() => {
            render(<PostList/>)
        })

        // then
        expect(screen.getByText('Loading...')).toBeInTheDocument()

    })
})
