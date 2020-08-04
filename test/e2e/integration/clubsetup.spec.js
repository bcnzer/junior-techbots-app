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
    cy.get('[data-cy=inviteEmail1]').type('invalid@email')
    cy.contains('E-mail must be valid').should('have.text', 'E-mail must be valid')
    cy.get('[data-cy=clubSetupForward4]').click()
    cy.get('[data-cy=step4]').should('have.class', 'v-stepper__step--active')

    cy.get('[data-cy=inviteEmail1]').clear()
    cy.get('[data-cy=clubSetupForward4]').click()
  })

  it('Section - Privacy and Data Retention', function() {
    cy.get('[data-cy=clubSetupForward5]').click()
    cy.contains('Confirmation required you accept use of cookies').should('have.text', 'Confirmation required you accept use of cookies')
    cy.contains('Confirmation required of the Privacy Policy').should('have.text', 'Confirmation required of the Privacy Policy')
    cy.contains('Confirmation required of the Data Retention Policy').should('have.text', 'Confirmation required of the Data Retention Policy')
    cy.get('[data-cy=step5]').should('have.class', 'v-stepper__step--active')

    cy.get('[data-cy=checkAcceptCookies]').click()
    cy.get('[data-cy=checkConfirmPrivacyPolicy]').click()
    cy.get('[data-cy=checkConfirmDataRetencyPolicy]').click()
    cy.get('[data-cy=clubSetupForward5]').click()
    cy.get('[data-cy=step5]').should('have.class', 'v-stepper__step--complete')
  })
})
