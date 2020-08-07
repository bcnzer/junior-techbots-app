describe('Club setup', function() {
  before(() => {
    cy.visit('/logine2eanonymous')
    cy.wait(2000) // Two waits as there are two network requests
    cy.wait(2000)
    cy.visit('/clubsetup')
    cy.saveLocalStorage() // Really important to note that localStorage is NOT saved between tests. This is a problem for currentUser info
  })

  beforeEach(() => {
    // We need to restore the state before each test so we have the currentUser
    cy.restoreLocalStorage();
  });
 
  // // We don't need to do this as we only need the current User but I'm keeping it here as a code sample
  // afterEach(() => {
  //   cy.saveLocalStorage();
  // });

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
  })

  it('Section - Privacy and Data Retention - check them all', function() {
    cy.get('[data-cy=checkAcceptCookies]').parent().click()
    cy.get('[data-cy=checkConfirmPrivacyPolicy]').parent().click()
    cy.get('[data-cy=checkConfirmDataRetencyPolicy]').parent().click()
    cy.get('[data-cy=clubSetupForward5]').click()
    cy.get('[data-cy=step5]').should('have.class', 'v-stepper__step--complete')
  })

  it('Section - Confirmation', function() {
    cy.get('[data-cy=confirmationMsgClubName]').should('have.text', 'My test coding club')
    cy.get('[data-cy=createClub]').click()
  })

})
