function tomorrow(): string {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

describe('reminder flow', () => {
  it('creates, views, edits, disables, and deletes a reminder', () => {
    cy.intercept('GET', '**/api/v1/reminders').as('loadReminders')
    cy.visit('/')
    cy.wait('@loadReminders').its('response.statusCode').should('eq', 200)

    cy.contains('a', '+ Create Reminder').click()
    cy.get('[data-cy="reminder-title"]').type('Daily Standup')
    cy.get('[data-cy="reminder-details"]').type(
      'Join the development team standup meeting.',
    )
    cy.get('[data-cy="reminder-date"]').type(tomorrow())
    cy.get('[data-cy="reminder-time"]').type('09:00')
    cy.get('[data-cy="reminder-schedule"]').select('Every Weekday')

    cy.intercept('POST', '**/api/v1/reminders').as('createReminder')
    cy.get('[data-cy="reminder-submit"]').click()
    cy.wait('@createReminder').its('response.statusCode').should('eq', 201)
    cy.url().should('match', /\/reminders\/[0-9a-f-]+$/)
    cy.contains('h1', 'Daily Standup').should('be.visible')
    cy.contains('Every Weekday').should('be.visible')

    cy.get('[data-cy="edit-reminder"]').click()
    cy.get('[data-cy="reminder-title"]').clear().type('Team Standup')
    cy.intercept('PUT', '**/api/v1/reminders/*').as('updateReminder')
    cy.get('[data-cy="reminder-submit"]').click()
    cy.wait('@updateReminder').its('response.statusCode').should('eq', 200)
    cy.contains('h1', 'Team Standup').should('be.visible')

    cy.intercept('PATCH', '**/api/v1/reminders/*/status').as('disableReminder')
    cy.get('[data-cy="toggle-reminder"]').click()
    cy.wait('@disableReminder').its('response.statusCode').should('eq', 200)
    cy.contains('dd', 'Disabled').should('be.visible')

    cy.intercept('DELETE', '**/api/v1/reminders/*').as('deleteReminder')
    cy.on('window:confirm', () => true)
    cy.get('[data-cy="delete-reminder"]').click()
    cy.wait('@deleteReminder').its('response.statusCode').should('eq', 204)
    cy.url().should('include', '/reminders')
    cy.contains('Your reminder list is empty').should('be.visible')
  })
})
