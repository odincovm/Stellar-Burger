describe('Проверяем ингредиенты', () => {
  beforeEach(() => {
    cy.fixture('ingredients').as('ingredientsData');
    cy.intercept('GET', '**/api/ingredients', { fixture: 'ingredients' }).as(
      'getIngredients'
    );
    cy.visit('/');
    cy.wait('@getIngredients');
  });

  it('Отображает ингредиенты', () => {
    cy.fixture('ingredients').then(({ data }) => {
      // находим все теги <li> внутри секции с ингредиентами
      cy.get('section')
        .find('ul')
        .find('li', { timeout: 10000 })
        .should('have.length', data.length);

      // проверяем, что первый <li> содержит имя первого ингредиента
      cy.get('section ul li').first().contains(data[0].name).should('exist');
    });
  });
});

describe('Конструктор бургеров — добавление ингредиентов кликом', () => {
  beforeEach(() => {
    cy.fixture('ingredients').as('ingredientsData');
    cy.intercept('GET', '**/api/ingredients', { fixture: 'ingredients' }).as(
      'getIngredients'
    );
    cy.visit('/');
    cy.wait('@getIngredients');
  });

  it('Добавляет начинку и отображает её в списке конструктора', () => {
    cy.get('@ingredientsData')
      .its('data')
      .then((items) => {
        const filling = items.find((i) => i.type === 'main')!;

        // Нажимаем «Добавить» в карточке нужной начинки
        cy.contains(filling.name)
          .closest('li')
          .within(() => cy.contains('Добавить').click({ force: true }));

        // Берём второй section (0 — ингредиенты, 1 — конструктор)
        cy.get('section')
          .eq(1)
          // внутри него первый ul — список добавленных начинок
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
    cy.intercept('GET', '**/api/ingredients', { fixture: 'ingredients' }).as(
      'getIngredients'
    );
    cy.visit('/');
    cy.wait('@getIngredients');
  });

  it('Открытие модалки и проверка содержимого', () => {
    cy.get('@ingredientsData')
      .its('data')
      .then((data) => {
        const first = data[0];

        // Открываем модалку
        cy.contains(first.name).click({ force: true });

        // Проверяем, что оверлей присутствует в DOM (без visible)
        cy.get('[data-testid="overlay"]', { timeout: 5000 }).should('exist');

        // Проверяем содержимое модалки
        cy.get('[data-testid="modal-content"]')
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

        // 1. Открываем модалку
        cy.contains(first.name).click({ force: true });

        // 2. Ждём появления оверлея
        cy.get('[data-testid="overlay"]', { timeout: 5000 }).should('exist');

        // 3. Кликаем по кнопке закрытия
        cy.get('[data-testid="modal-close"]').click({ force: true });

        // 4. Проверяем, что оверлей исчез
        cy.get('[data-testid="overlay"]', { timeout: 5000 }).should(
          'not.exist'
        );
      });
  });

  it('Закрытие кликом по оверлею', () => {
    cy.get('@ingredientsData')
      .its('data')
      .then((data) => {
        const first = data[0];

        // Открываем
        cy.contains(first.name).click({ force: true });
        cy.get('[data-testid="overlay"]').should('exist');

        // Кликаем по оверлею (игнорируем перекрытия)
        cy.get('[data-testid="overlay"]').click({ force: true });

        // Оверлей должен исчезнуть
        cy.get('[data-testid="overlay"]').should('not.exist');
      });
  });
});

describe('Создание заказа через UI-логин и мок-ответы', () => {
  beforeEach(() => {
    // 1) Мокируем API логина
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        success: true,
        accessToken: 'Bearer mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: { email: 'test@example.com', name: 'Test User' }
      }
    }).as('login');

    // 2) Мокируем fetchUser (если он вызывается после логина в App)
    cy.intercept('GET', '/api/auth/user', {
      statusCode: 200,
      body: {
        success: true,
        user: { email: 'test@example.com', name: 'Test User' }
      }
    }).as('getUser');

    // 3) Мок ингредиентов
    cy.fixture('ingredients').as('ingredientsData');
    cy.intercept('GET', '**/api/ingredients', { fixture: 'ingredients' }).as(
      'getIngredients'
    );

    // 4) Мок создания заказа
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
    // ————— ЛОГИН —————
    cy.visit('/login');

    // Удаляем мешающий iframe от webpack-dev-server, если он есть
    cy.get('body').then(($body) => {
      const iframe = $body.find('#webpack-dev-server-client-overlay');
      if (iframe.length) iframe.remove();
    });

    cy.get('input[name="email"]').type('test@example.com', { force: true });
    cy.get('input[name="password"]').type('password123', { force: true });
    cy.get('button[type="submit"]').click({ force: true });

    // Ждём, что отработает POST /auth/login
    cy.wait('@login');
    cy.get('iframe#webpack-dev-server-client-overlay').then(($el) => {
      if ($el.length) $el.remove();
    });

    // Убедимся, что нас редиректнуло на главную
    cy.url().should('eq', `${Cypress.config().baseUrl}/`);

    // ————— СОБИРАЕМ БУРГЕР —————
    cy.wait('@getIngredients');
    cy.get('@ingredientsData')
      .its('data')
      .then((data) => {
        const bun = data.find((i) => i.type === 'bun')!;
        const main = data.find((i) => i.type === 'main')!;

        // Добавляем булку
        cy.get('[data-testid="ingredient-bun"]')
          .contains(bun.name)
          .closest('li')
          .within(() => cy.contains('Добавить').click({ force: true }));

        // Добавляем начинку
        cy.get('[data-testid="ingredient-main"]')
          .contains(main.name)
          .closest('li')
          .within(() => cy.contains('Добавить').click({ force: true }));
      });

    // ————— ОФОРМЛЕНИЕ ЗАКАЗА —————
    cy.get('[data-testid="order-button"]').click({ force: true });

    // Ждём POST /api/orders
    cy.wait('@postOrder');

    // ждём до 10 секунд, пока появится заголовок — номер заказа в виде цифр
    cy.get('h2.text_type_digits-large', { timeout: 10000 }).should(
      'contain.text',
      '12345'
    );

    // дополнительно проверим уникальный текст «идентификатор заказа»
    cy.contains('идентификатор заказа').should('be.visible');

    // теперь закрываем модалку крестиком

    cy.get('[data-testid="modal-close"]', { timeout: 5000 }).click({
      force: true
    });

    // убеждаемся, что модалка ушла (по исчезновению текста)
    cy.contains('идентификатор заказа').should('not.exist');

    // и что конструктор пуст
    cy.get('[data-testid="constructor-bun"]').should('not.exist');
    cy.get('[data-testid="constructor-ingredient"]').should('not.exist');
  });
});
