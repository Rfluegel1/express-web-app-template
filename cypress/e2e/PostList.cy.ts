describe('Listing Page', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000/')
    })

    it('should display a list of items', () => {
        cy.get('#postRows').find('tr').should('have.length', 0)
    })
    // Add more tests as needed...
})