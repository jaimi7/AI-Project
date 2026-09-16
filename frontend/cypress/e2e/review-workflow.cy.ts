describe('AI review workflow', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
  })

  it('generates, approves, and saves a review in history', () => {
    cy.intercept('POST', '**/api/reviews/generate', {
      statusCode: 200,
      body: {
        review: 'The food was delicious and the staff were genuinely friendly. Service was a little slow, but our family still had a good experience.',
        provider: 'test',
      },
    }).as('generateReview')

    cy.visit('/')
    cy.get('[data-cy="place-name"]').type('Spice Garden')
    cy.get('[data-cy="experience-notes"]').type(
      'Delicious food and friendly staff, although service was a little slow.',
    )
    cy.get('[data-cy="generate-review"]').click()
    cy.wait('@generateReview')

    cy.get('[data-cy="review-output"]').should('contain.value', 'food was delicious')
    cy.get('[data-cy="approve-review"]').click()
    cy.contains('button', 'History').click()
    cy.get('[data-cy="review-history"]').should('contain', 'Spice Garden')
    cy.get('[data-cy="review-history"]').should('contain', 'approved')
  })

  it('requires genuine experience details before generation', () => {
    cy.visit('/')
    cy.get('[data-cy="place-name"]').type('Example Cafe')
    cy.get('[data-cy="generate-review"]').click()
    cy.get('[data-cy="error-message"]').should(
      'contain',
      'Add honest experience notes or at least one keyword',
    )
  })
})
