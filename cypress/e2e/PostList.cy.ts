import {UUID_REG_EXP} from '../../src/backend/contants'

describe('Post lifecycle', () => {
    let uuid

    beforeEach(() => {
        cy.visit('http://localhost:3000/')
    })

    it('clicking create button opens details page', () => {
        // when
        cy.get('#createPost').click()
        // then
        cy.url().should('include', '/posts')
    })

    it('submitting detail page returns id', () => {
        // given
        cy.get('#createPost').click()
        cy.get('#titleField').type('cypress title')
        cy.get('#bodyField').type('cypress body')
        // when
        cy.get('#submit').click()
        // then
        cy.get('#id')
            .invoke('text')
            .should((text) => {
                uuid = text.substring('ID Label: '.length)
                expect(uuid).to.match(UUID_REG_EXP)
            })
    })

    it('selecting back arrow returns to listing page', () => {
        //given
        cy.get('#createPost').click()
        // when
        cy.get('#toListPage').click()
        // then
        cy.url().should('not.include', '/posts')
    })

    it('selecting created post opens its detail page', () => {
        // when
        cy.contains(uuid).scrollIntoView()
        cy.contains(uuid).click()
        // then
        cy.url().should('include', `/posts/${uuid}`)
        cy.get('#id').should('contain', `ID Label: ${uuid}`)
        cy.get('#titleField').should('have.value', 'cypress title')
        cy.get('#bodyField').should('have.value', 'cypress body')
    })
    // Add more tests as needed...
})