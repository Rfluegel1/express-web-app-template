import {UUID_REG_EXP} from '../../src/backend/contants'

describe('Post lifecycle', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000/')
    })

    it('clicking create button opens details page', () => {
        cy.get('#createPost').click()
        cy.url().should('include', '/posts')
    })

    it('submitting detail page returns id', () => {
        cy.get('#createPost').click()
        cy.get('#titleField').type('cypress title')
        cy.get('#bodyField').type('cypress body')
        cy.get('#submit').click()
        cy.get('#id')
            .invoke('text')
            .should((text) => {
                let uuid = text.substring('ID Label: '.length)
                expect(uuid).to.match(UUID_REG_EXP)
            })
    })
    // Add more tests as needed...
})