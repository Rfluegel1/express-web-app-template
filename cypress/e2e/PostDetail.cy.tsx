import {v4} from 'uuid'

describe('PostDetail Integration Tests', () => {

    it('should handle network errors when fetching post', () => {
        //given
        let id = v4()
        cy.intercept({
            method: 'GET',
            url: '**/api/posts',
        }, {
            statusCode: 200,
            body: {message: [{id: id}]}
        }).as('getPosts')
        cy.intercept({
            method: 'GET',
            url: `**/api/posts/${id}`,
        }, {
            statusCode: 500,
            body: {error: 'Network Error'}
        }).as('getPost')

        // when
        cy.visit(`${Cypress.env('BASE_URL')}/`)
        cy.contains(id).scrollIntoView()
        cy.contains(id).click()
        cy.wait('@getPost')

        // then
        cy.get('body').should('contain', 'An error occurred')
    })
})
