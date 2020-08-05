describe('Club setup', function() {
  before(() => {
    cy.visit('/logine2e')
    cy.wait(1000) // Two waits as there are two network requests
    cy.wait(1000)
    cy.visit('/clubsetup')
  })

  it('Check the logged in display info', function() {
    cy.get('[data-cy=userDisplayName]').should('have.text', 'LocalTester Chartrand')
    cy.get('[data-cy=userEmail]').should('have.text', 'mytestemail@gmail.com')
    cy.get('[data-cy=clubSetupForward1]').click()
  })
})
