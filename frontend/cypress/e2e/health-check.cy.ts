describe('API health check', () => {
  it('shows that the FastAPI backend is connected', () => {
    cy.intercept('GET', 'http://localhost:8000/api/health', {
      statusCode: 200,
      body: {
        status: 'ok',
        service: 'ai-review-assistant-api',
      },
    }).as('healthCheck')

    cy.visit('/')
    cy.wait('@healthCheck')

    cy.get('[data-cy="api-status-message"]').should('contain', 'Backend connected')
    cy.get('[data-cy="api-status"]').should(
      'contain',
      'ai-review-assistant-api returned “ok”.',
    )
  })

  it('lets the user retry after the backend is unavailable', () => {
    cy.intercept('GET', 'http://localhost:8000/api/health', {
      statusCode: 503,
      body: { detail: 'Service unavailable' },
    }).as('failedHealthCheck')

    cy.visit('/')
    cy.wait('@failedHealthCheck')

    cy.get('[data-cy="api-status-message"]').should('contain', 'Backend unavailable')
    cy.get('[data-cy="check-api"]').should('be.enabled').click()
    cy.wait('@failedHealthCheck')
  })
})
