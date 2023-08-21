describe('Listing Page', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000/')
    })

    it('create button opens details page', () => {
        cy.get('#createPost').click()
        cy.url().should('include', '/posts')
    })
    // Add more tests as needed...
})