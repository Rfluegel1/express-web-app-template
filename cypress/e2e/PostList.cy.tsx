describe('PostList Integration Tests', () => {

    it('should handle network errors when fetching posts', () => {
        //given
        cy.intercept({
            method: 'GET',
            url: '**/api/posts',
        }, {
            statusCode: 500,
            body: {error: 'Network Error'}
        }).as('getPosts')

        // when
        cy.visit(`${Cypress.env('BASE_URL')}/`)
        cy.wait('@getPosts')

        // then
        cy.get('body').should('contain', 'An error occurred')
    })
})
