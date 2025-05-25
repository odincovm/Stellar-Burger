import { SELECTORS } from '../support/selectors';

describe('Проверяем ингредиенты', () => {
  beforeEach(() => {
    cy.fixture('ingredients').as('ingredientsData');
    cy.intercept('GET', '**/api/ingredients', { fixture: 'ingredients' }).as('getIngredients');
    cy.visit('/');
    cy.wait('@getIngredients');
  });

  it('Отображает ингредиенты', () => {
    cy.fixture('ingredients').then(({ data }) => {
      cy.get(SELECTORS.ingredientSection)
        .should('have.length', data.length)
        .first()
        .contains(data[0].name)
        .should('exist');
    });
  });
});

describe('Конструктор бургеров — добавление ингредиентов кликом', () => {
  beforeEach(() => {
    cy.fixture('ingredients').as('ingredientsData');
    cy.intercept('GET', '**/api/ingredients', { fixture: 'ingredients' }).as('getIngredients');
    cy.visit('/');
    cy.wait('@getIngredients');
  });

  it('Добавляет начинку и отображает её в списке конструктора', () => {
    cy.get('@ingredientsData')
      .its('data')
      .then((items) => {
        const filling = items.find((i) => i.type === 'main')!;

        cy.contains(filling.name)
          .closest('li')
          .within(() => cy.contains(SELECTORS.ingredientAddButton).click({ force: true }));

        cy.get(SELECTORS.constructorSection)
          .eq(1)
          .find('ul')
          .first()
          .find('li')
          .should('have.length', 1)
          .first()
          .should('contain.text', filling.name);
      });
  });
});

describe('Работа модальных окон ингредиента', () => {
  beforeEach(() => {
    cy.fixture('ingredients').as('ingredientsData');
    cy.intercept('GET', '**/api/ingredients', { fixture: 'ingredients' }).as('getIngredients');
    cy.visit('/');
    cy.wait('@getIngredients');
  });

  it('Открытие модалки и проверка содержимого', () => {
    cy.get('@ingredientsData')
      .its('data')
      .then((data) => {
        const first = data[0];
        cy.contains(first.name).click({ force: true });
        cy.get(SELECTORS.overlay, { timeout: 5000 }).should('exist');
        cy.get(SELECTORS.modalContent)
          .should('contain.text', first.name)
          .find('img')
          .should('have.attr', 'src', first.image_large);
      });
  });

  it('Закрытие крестиком', () => {
    cy.get('@ingredientsData')
      .its('data')
      .then((data) => {
        const first = data[0];
        cy.contains(first.name).click({ force: true });
        cy.get(SELECTORS.overlay).should('exist');
        cy.get(SELECTORS.modalClose).click({ force: true });
        cy.get(SELECTORS.overlay).should('not.exist');
      });
  });

  it('Закрытие кликом по оверлею', () => {
    cy.get('@ingredientsData')
      .its('data')
      .then((data) => {
        const first = data[0];
        cy.contains(first.name).click({ force: true });
        cy.get(SELECTORS.overlay).should('exist');
        cy.get(SELECTORS.overlay).click({ force: true });
        cy.get(SELECTORS.overlay).should('not.exist');
      });
  });
});

describe('Создание заказа через UI-логин и мок-ответы', () => {
  beforeEach(() => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        success: true,
        accessToken: 'Bearer mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: { email: 'test@example.com', name: 'Test User' }
      }
    }).as('login');

    cy.intercept('GET', '/api/auth/user', {
      statusCode: 200,
      body: {
        success: true,
        user: { email: 'test@example.com', name: 'Test User' }
      }
    }).as('getUser');

    cy.fixture('ingredients').as('ingredientsData');
    cy.intercept('GET', '**/api/ingredients', { fixture: 'ingredients' }).as('getIngredients');

    cy.intercept('POST', '/api/orders', {
      statusCode: 200,
      body: {
        success: true,
        name: 'Test Order',
        order: {
          number: 12345,
          _id: 'orderid123',
          status: 'done',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ingredients: ['id-bun', 'id-main']
        }
      }
    }).as('postOrder');
  });

  it('логинится через форму, собирает бургер, делает заказ и проверяет результат', () => {
    cy.visit('/login');

    cy.get('body').then(($body) => {
      const iframe = $body.find('#webpack-dev-server-client-overlay');
      if (iframe.length) iframe.remove();
    });

    cy.get(SELECTORS.loginEmailInput).type('test@example.com', { force: true });
    cy.get(SELECTORS.loginPasswordInput).type('password123', { force: true });
    cy.get(SELECTORS.loginSubmitButton).click({ force: true });

    cy.wait('@login');

    cy.url().should('eq', `${Cypress.config().baseUrl}/`);

    cy.wait('@getIngredients');
    cy.get('@ingredientsData')
      .its('data')
      .then((data) => {
        const bun = data.find((i) => i.type === 'bun')!;
        const main = data.find((i) => i.type === 'main')!;

        cy.get(SELECTORS.ingredientBun)
          .contains(bun.name)
          .closest('li')
          .within(() => cy.contains(SELECTORS.ingredientAddButton).click({ force: true }));

        cy.get(SELECTORS.ingredientMain)
          .contains(main.name)
          .closest('li')
          .within(() => cy.contains(SELECTORS.ingredientAddButton).click({ force: true }));
      });

    cy.get(SELECTORS.orderButton).click({ force: true });

    cy.wait('@postOrder');

    cy.get(SELECTORS.orderNumber, { timeout: 10000 }).should('contain.text', '12345');
    cy.contains(SELECTORS.orderLabel).should('be.visible');

    cy.get(SELECTORS.modalClose).click({ force: true });
    cy.contains(SELECTORS.orderLabel).should('not.exist');

    cy.get(SELECTORS.constructorBun).should('not.exist');
    cy.get(SELECTORS.constructorIngredient).should('not.exist');
  });
});
