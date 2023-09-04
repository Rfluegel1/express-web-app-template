import React from 'react'
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import PostDetail from '../../src/frontend/PostDetail'
import axios from 'axios'
import {v4 as uuidv4} from 'uuid'
import {useParams} from 'react-router-dom'


jest.mock('axios', () => ({
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
}))

const mockUseNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockUseNavigate,
    useParams: jest.fn()
}))

describe('PostDetail component', () => {
    test('renders id, title, and body text fields on load', async () => {
        // when
        const {container, queryByText} = render(<PostDetail/>)

        // then
        await waitFor(() => {
            expect(screen.getByText('ID Label:')).toBeInTheDocument()
            expect(screen.getByLabelText('Title Label:')).toBeInTheDocument()
            expect(screen.getByLabelText('Body Label:')).toBeInTheDocument()
            const inputs = container.querySelectorAll('input')
            expect(inputs.length).toEqual(2)
            expect(inputs[0]).toHaveAttribute('id', 'titleField')
            expect(inputs[1]).toHaveAttribute('id', 'bodyField')
            expect(screen.getByText('Submit')).toBeInTheDocument()
            expect(queryByText('Delete')).toBeNull()
            expect(container.querySelector('.error-banner')).not.toBeInTheDocument()
        })
    })

    test('populates fields when typed into', async () => {
        // given
        render(<PostDetail/>)

        // when
        let titleField = screen.getByLabelText('Title Label:')
        let bodyField = screen.getByLabelText('Body Label:')
        fireEvent.change(titleField, {target: {value: 'jest title'}})
        fireEvent.change(bodyField, {target: {value: 'jest body'}})

        // then
        await waitFor(() => {
            expect(titleField).toHaveAttribute('value', 'jest title')
            expect(bodyField).toHaveAttribute('value', 'jest body')
        })
    })

    test('submits form to backend and populated id', async () => {
        // given
        const id: string = uuidv4();
        (axios.post as jest.Mock).mockResolvedValue({data: {message: {id: id}}})
        render(<PostDetail/>)
        let titleField = screen.getByLabelText('Title Label:')
        let bodyField = screen.getByLabelText('Body Label:')
        fireEvent.change(titleField, {target: {value: 'jest title'}})
        fireEvent.change(bodyField, {target: {value: 'jest body'}})

        // when
        fireEvent.click(screen.getByText('Submit'))

        // then
        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith('http://127.0.0.1:8080/api/posts', {
                title: 'jest title',
                body: 'jest body'
            }, {headers: {'Content-Type': 'application/json'}})
            expect(screen.getByText(`ID Label: ${id}`)).toBeInTheDocument()
        })
    })

    test('displays an error if creating post fails', async () => {
        // given
        const error: Error = new Error('500');
        (axios.post as jest.Mock).mockRejectedValueOnce(error)
        console.error = jest.fn()

        // when
        render(<PostDetail/>)
        fireEvent.click(screen.getByText('Submit'))

        // then
        await waitFor(() => {
            expect(screen.getByText('An error occurred')).toBeInTheDocument()
            expect(console.error).toHaveBeenCalledWith('An error occurred while fetching the post:', error)
        })
    })

    test('back arrow takes you to list page', async () => {
        // given
        render(<PostDetail/>)

        // when
        fireEvent.click(screen.getByText('<--'))

        // then
        await waitFor(() => {
            expect(mockUseNavigate).toHaveBeenCalledWith('/')
        })
    })
    test('useParams id is populated on screen and calls backend', async () => {
        //given
        (useParams as jest.Mock).mockReturnValue({id: '123'});
        (axios.get as jest.Mock).mockResolvedValue({data: {message: {title: 'the title', body: 'the body'}}})

        // when
        render(<PostDetail/>)

        // then
        await waitFor(() => {
            screen.getByText('ID Label: 123')
            screen.getByDisplayValue('the title')
            screen.getByDisplayValue('the body')
        })
    })

    test('displays an error if fetching post fails', async () => {
        // given
        const error: Error = new Error('500');
        (axios.get as jest.Mock).mockRejectedValueOnce(error)
        console.error = jest.fn()

        // when
        render(<PostDetail/>)

        // then
        await waitFor(() => {
            expect(screen.getByText('An error occurred')).toBeInTheDocument()
            expect(console.error).toHaveBeenCalledWith('An error occurred while fetching the post:', error)
        })
    })

    test('updates when update is clicked and id is already populated', async () => {
        // given
        (useParams as jest.Mock).mockReturnValue({id: '123'});
        (axios.get as jest.Mock).mockResolvedValue({data: {message: {title: 'the title', body: 'the body'}}});
        (axios.put as jest.Mock).mockResolvedValue({data: {message: {title: '', body: ''}}})
        render(<PostDetail/>)

        // when
        fireEvent.click(screen.getByText('Update'))

        // then
        await waitFor(() => {
            expect(axios.put).toHaveBeenCalledWith('http://127.0.0.1:8080/api/posts/123', {
                title: '',
                body: ''
            }, {headers: {'Content-Type': 'application/json'}})
        })
    })

    test('displays an error if updating post fails', async () => {
        // given
        (useParams as jest.Mock).mockReturnValue({id: '123'});
        (axios.get as jest.Mock).mockResolvedValue({data: {message: {title: 'the title', body: 'the body'}}})
        const error: Error = new Error('500');
        (axios.put as jest.Mock).mockRejectedValueOnce(error)
        console.error = jest.fn()

        // when
        render(<PostDetail/>)
        fireEvent.click(screen.getByText('Update'))

        // then
        await waitFor(() => {
            expect(screen.getByText('An error occurred')).toBeInTheDocument()
            expect(console.error).toHaveBeenCalledWith('An error occurred while fetching the post:', error)
        })
    })

    test('deletes when delete button is clicked and navigates to listing page', async () => {
        // given
        (useParams as jest.Mock).mockReturnValue({id: '123'});
        (axios.get as jest.Mock).mockResolvedValue({data: {message: {title: 'the title', body: 'the body'}}});
        (axios.delete as jest.Mock).mockResolvedValue({})
        render(<PostDetail/>)

        // when
        fireEvent.click(screen.getByText('Delete'))

        // then
        await waitFor(() => {
            expect(axios.delete).toHaveBeenCalledWith('http://127.0.0.1:8080/api/posts/123')
            expect(mockUseNavigate).toHaveBeenCalledWith('/')
        })
    })

    test('displays an error if deleting post fails', async () => {
        // given
        (useParams as jest.Mock).mockReturnValue({id: '123'});
        (axios.get as jest.Mock).mockResolvedValue({data: {message: {title: 'the title', body: 'the body'}}})
        const error: Error = new Error('500');
        (axios.delete as jest.Mock).mockRejectedValueOnce(error)
        console.error = jest.fn()

        // when
        render(<PostDetail/>)
        fireEvent.click(screen.getByText('Delete'))

        // then
        await waitFor(() => {
            expect(screen.getByText('An error occurred')).toBeInTheDocument()
            expect(console.error).toHaveBeenCalledWith('An error occurred while fetching the post:', error)
        })
    })
})
