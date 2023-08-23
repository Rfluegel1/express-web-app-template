import React from 'react'
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import PostDetail from '../../src/frontend/PostDetail'
import axios from 'axios'
import {v4 as uuidv4} from 'uuid'


jest.mock('axios', () => ({
    post: jest.fn()
}))
describe('PostDetail component', () => {
    test('renders id, title, and body text fields on load', async () => {
        // when
        const {container} = render(<PostDetail/>)

        // then
        await waitFor(() => {
            expect(screen.getByText('ID Label: undefined')).toBeInTheDocument()
            expect(screen.getByLabelText('Title Label:')).toBeInTheDocument()
            expect(screen.getByLabelText('Body Label:')).toBeInTheDocument()
            const inputs = container.querySelectorAll('input')
            expect(inputs.length).toEqual(2)
            expect(inputs[0]).toHaveAttribute('id', 'titleField')
            expect(inputs[1]).toHaveAttribute('id', 'bodyField')
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
            expect(axios.post).toHaveBeenCalledWith('http://127.0.0.1:8080/posts', {
                title: 'jest title',
                body: 'jest body'
            }, {headers: {'Content-Type': 'application/json'}})
            expect(screen.getByText(`ID Label: ${id}`)).toBeInTheDocument()
        })
    })
})
