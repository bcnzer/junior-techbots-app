describe('Club setup', function() {
  before(() => {
    // cy.visit('/teacher')
  })

  beforeEach(() => {
    // We need to restore the state before each test so we have the currentUser
    // cy.restoreLocalStorage();
  });

  it('Username and password check', function() {
    const username = Cypress.env('username')
    cy.log(username)
    const password = Cypress.env('password')
    cy.log(password)
  })
})
