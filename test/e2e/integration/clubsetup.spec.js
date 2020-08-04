describe('Club setup', function() {
  before(() => {
    cy.visit('/logine2e')
    cy.pause()
    cy.visit('/clubsetup')
  })

  it('Check the logged in display info', function() {
    cy.get('[data-cy=userDisplayName]').should('have.text', 'LocalTester Chartrand')
    cy.get('[data-cy=userEmail]').should('have.text', 'mytestemail@gmail.com')
    cy.get('[data-cy=clubSetupForward1]').click()
  })

  it('Section - Club Info', function() {
    cy.get('[data-cy=clubInfoName]').type(' ').clear()
    cy.contains('Club name is required').should('have.text', 'Club name is required')

    cy.get('[data-cy=clubInfoName]').type('My test coding club')
    cy.get('[data-cy=clubSetupForward2]').click()
  })

  it('Section - Add a Group', function() {
    cy.get('[data-cy=addGroupName]').type(' ').clear()
    cy.contains('Group name is required').should('have.text', 'Group name is required')

    cy.get('[data-cy=addGroupName]').type('Years 5-8')
    cy.get('[data-cy=clubSetupForward3]').click()
  })

  it('Section - Optional - Invite members of your team', function() {
    // TODO
    cy.get('[data-cy=addGroupName]').type(' ').clear()
    cy.contains('Group name is required').should('have.text', 'Group name is required')

    cy.get('[data-cy=addGroupName]').type('Years 5-8')
    cy.get('[data-cy=clubSetupForward3]').click()
  })
})
