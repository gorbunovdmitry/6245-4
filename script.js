class ProductSelector {
    constructor() {
        this.selectedProducts = new Set();
        this.productButtons = document.querySelectorAll('.product-button');
        this.continueButton = document.getElementById('continueButton');
        this.pageViewSent = false;
        
        this.init();
    }

    init() {
        // Отправляем событие просмотра страницы при первом рендере
        this.sendPageViewEvent();
        
        // Отладочная информация
        console.log('Количество кнопок товаров:', this.productButtons.length);
        console.log('Кнопка продолжения:', this.continueButton);
        
        // Добавляем обработчики событий для кнопок товаров
        this.productButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleProductClick(e));
        });

        // Добавляем обработчик для кнопки продолжения
        if (this.continueButton) {
            this.continueButton.addEventListener('click', () => this.handleContinueClick());
        }

        // Инициализируем состояние кнопки продолжения
        this.updateContinueButton();
    }

    handleProductClick(event) {
        console.log('Клик по кнопке товара');
        const button = event.target;
        const productId = button.dataset.product;
        const currentState = button.dataset.state;
        
        console.log('Product ID:', productId, 'Current state:', currentState);

        if (currentState === 'price') {
            // Переключаем с "ценник" на "выбрано"
            this.selectProduct(button, productId);
        } else if (currentState === 'selected') {
            // Переключаем с "выбрано" на "ценник"
            this.deselectProduct(button, productId);
        }
    }

    selectProduct(button, productId) {
        // Добавляем товар в выбранные
        this.selectedProducts.add(productId);
        
        // Обновляем состояние кнопки
        button.dataset.state = 'selected';
        button.textContent = 'Выбрано';
        
        // Обновляем кнопку продолжения
        this.updateContinueButton();
    }

    deselectProduct(button, productId) {
        // Удаляем товар из выбранных
        this.selectedProducts.delete(productId);
        
        // Обновляем состояние кнопки
        button.dataset.state = 'price';
        button.textContent = button.dataset.price + ' ₽';
        
        // Обновляем кнопку продолжения
        this.updateContinueButton();
    }

    updateContinueButton() {
        if (this.selectedProducts.size === 0) {
            // Дизейбл состояние
            this.continueButton.disabled = true;
            this.continueButton.textContent = 'Выберите хотя бы 1 товар';
        } else {
            // Активное состояние с подсчетом суммы
            this.continueButton.disabled = false;
            const totalPrice = this.calculateTotalPrice();
            this.continueButton.textContent = `Продолжить за ${totalPrice} ₽`;
        }
    }

    calculateTotalPrice() {
        let total = 0;
        
        this.selectedProducts.forEach(productId => {
            const button = document.querySelector(`[data-product="${productId}"]`);
            const price = parseInt(button.dataset.price);
            total += price;
        });
        
        return total;
    }

    handleContinueClick() {
        if (this.selectedProducts.size > 0) {
            const totalPrice = this.calculateTotalPrice();
            
            // Отправляем событие клика на кнопку "Продолжить"
            this.sendContinueClickEvent();
            
            // Сохраняем данные в Google Sheets
            this.saveUserChoice(totalPrice);
            
            // Открываем страницу-заглушку
            window.location.href = 'stub.html';
        }
    }

    sendPageViewEvent() {
        if (!this.pageViewSent) {
            // Google Analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', '6245_page_view_landing_var4');
            }
            
            // Yandex Metrika
            if (typeof ym !== 'undefined') {
                ym(96171108, 'reachGoal', '6245_page_view_landing_var4');
            }
            
            this.pageViewSent = true;
        }
    }

    sendContinueClickEvent() {
        // Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', '6245_click_continue_var4');
        }
        
        // Yandex Metrika
        if (typeof ym !== 'undefined') {
            ym(96171108, 'reachGoal', '6245_continue_var4');
        }
    }

    saveUserChoice(totalPrice) {
        // Подготавливаем данные для отправки
        const data = {
            timestamp: new Date().toISOString(),
            variant: 4,
            bracelet: this.selectedProducts.has('bracelet') ? 1 : 0,
            card: this.selectedProducts.has('card') ? 1 : 0,
            trinket: this.selectedProducts.has('trinket') ? 1 : 0,
            sticker: this.selectedProducts.has('sticker') ? 1 : 0,
            stand: this.selectedProducts.has('stand') ? 1 : 0,
            totalPrice: totalPrice
        };

        // URL Google Apps Script
        const scriptUrl = 'https://script.google.com/macros/s/AKfycbw-e0zHHz4FNxUQCD0fqHwIvLdQtNdT0w4VPy-MVUx8mkIeE4-YC-w0bvwSkUA9TOWp/exec';

        console.log('Отправляем данные:', data);

        // Используем только JSONP (GET) для надежности
        const jsonpUrl = scriptUrl + '?' + new URLSearchParams({
            timestamp: data.timestamp,
            variant: data.variant,
            bracelet: data.bracelet,
            card: data.card,
            trinket: data.trinket,
            sticker: data.sticker,
            stand: data.stand,
            totalPrice: data.totalPrice,
            callback: 'callback'
        });

        console.log('JSONP URL:', jsonpUrl);

        // Создаем функцию обратного вызова
        window.callback = function(response) {
            console.log('Ответ от сервера:', response);
        };

        const script = document.createElement('script');
        script.src = jsonpUrl;
        script.onload = () => {
            console.log('Скрипт загружен');
            document.head.removeChild(script);
        };
        script.onerror = () => {
            console.log('Ошибка загрузки скрипта');
            document.head.removeChild(script);
        };
        document.head.appendChild(script);
    }
}

// Инициализируем приложение после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    new ProductSelector();
});
