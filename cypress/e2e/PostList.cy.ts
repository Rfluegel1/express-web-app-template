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

    it('editing title and body when there is an id updates fields', () => {
        // given
        cy.contains(uuid).scrollIntoView()
        cy.contains(uuid).click()
        cy.get('#titleField').clear().type('updated cypress title')
        cy.get('#bodyField').clear().type('updated cypress body')
        cy.get('#submit').click()

        // when
        cy.reload()

        // then
        cy.get('#id').should('contain', `ID Label: ${uuid}`)
        cy.get('#titleField').should('have.value', 'updated cypress title')
        cy.get('#bodyField').should('have.value', 'updated cypress body')
    })

    it('clicking delete button navigates to listing page and post is not present', () => {
        //given
        cy.contains(uuid).scrollIntoView()
        cy.contains(uuid).click()

        // when
        cy.get('#delete').click()

        // then
        cy.url().should('not.include', '/posts')
        cy.get('table').within(() => {
            cy.contains(uuid).should('not.exist')
        })
    })
})