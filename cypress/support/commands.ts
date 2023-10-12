import 'cypress-xpath'

/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
Cypress.Commands.add('loginDefaultUser', () => {
    let continueButton = '/html/body/div/main/section/div/div[2]/div/form/div[3]/button'

    cy.visit(`${Cypress.env('BASE_URL')}/login`)

    cy.get('#username').type('cypressdefault@gmail.com')
    cy.get('#password').type(Cypress.env('AUTH0_PASSWORD'), {log: false})
    cy.xpath(continueButton).click()

    cy.getCookies().then((cookies) => {
        const targetCookie = cookies.find(cookie => cookie.name === 'auth0')
        expect(targetCookie, 'Target cookie should exist').to.exist
    })
    cy.url().should('equal', `${Cypress.env('BASE_URL')}/`)
})
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }