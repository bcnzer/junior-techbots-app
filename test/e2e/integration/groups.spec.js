describe('Club setup', function() {
  before(() => {
    cy.visit('/logine2eanonymous')

    // localStorage.setItem('loginUsername', Cypress.env('username'))
    // localStorage.setItem('loginPassword', Cypress.env('password'))
    // cy.visit('/logine2eemail')
    // cy.wait(4000) // wait for login request to finish
    // cy.visit('/')
    // cy.wait(6000) // wait for a bunch of network requests and redirects to finish
    // cy.saveLocalStorage()

    // Go off and load at least two lessons which we'll use for scheduling
    cy.visit('/')
    cy.saveLocalStorage()
    
  })

  beforeEach(() => {
    // We need to restore the state before each test so we have the currentUser
    cy.restoreLocalStorage();
  });

  it('Check default Groups page', function() {
    // We finally landed in the teachers/groups page
    cy.get('[data-cy=clubName]').should('have.text', 'My e2e test coding club')
    cy.get('[data-cy=groupName]', {timeout: 2000}).should('contains.text', 'Years 5-8')
    cy.get('[data-cy=noLessonText]').should('contains.text', 'Go ahead and schedule some lessons 😊')
    // cy.get('[data-cy=scheduleLessonButton]').click()
    // cy.url({timeout: 3000}).should('include', '/schedule/add')
  })

  // it('Try scheduling a group', function() {
  //   // Let's create a new group
  //   cy.get('[data-cy=titleScheduleLesson]').should('contains.text', 'Schedule a Lesson')
  //   // cy.get('[data-cy=selectLessonButton]').click()
  // })
})
