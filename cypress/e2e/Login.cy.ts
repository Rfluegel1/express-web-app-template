import 'cypress-real-events/support'

describe('Login page', () => {
    it('renders as expected', () => {
        cy.loginDefaultUser()
    })
})