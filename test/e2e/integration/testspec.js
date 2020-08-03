describe('My first test', function() {
  it('Finds an element', function() {
    // cy.visit('https://example.cypress.io')
    // cy.pause()
    // cy.contains('type').click()
    // cy.url().should('include', '/commands')
    // cy.get('.action-email').type('fake@email.com').should('have.value', 'fake@email.com')
    cy.visit('http://localhost:3000/loginanonymous')
  })
})
