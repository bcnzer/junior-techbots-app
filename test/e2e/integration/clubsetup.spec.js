describe('Club setup', function() {
  before(() => {
    // This will ensure we're logged in
    cy.visit('/logine2e')
    cy.pause()
    cy.visit('/clubsetup')
  })

  it('Check the logged in display info', function() {
    cy.get('[data-cy=userDisplayName]').should('have.text', 'LocalTester Chartrand')
    cy.get('[data-cy=userEmail]').should('have.text', 'mytestemail@gmail.com')
    // cy.contains('type').click()
    cy.get('[data-cy=clubSetupForward1]').click()
  })

  it('Second page', function() {
    cy.log('second page oh yeah')
  })
})
