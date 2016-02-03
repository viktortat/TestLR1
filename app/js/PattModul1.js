/**
 * Паттерн МОДУЛЬ
 * http://forwebdev.ru/javascript/module-pattern/
 */
var tagList = (function() {
    // Приватная переменная, к которой получить доступ можно
    // только внутри этой функции
    var tags = [];

    // «модуль» — это объект.
    // Возвращаемый объект публичен.
    // Снаружи мы можем получить доступ ко всем данным из этого объекта
    return {
        // публичные методы
        getItemsCount: function() {
            return tags.length;
        },

        addItem: function(tag) {
            tags.push(tag);
        }
    }
})();

tagList.addItem('JavaScript');
tagList.addItem('Паттерны проектирования');

console.log(tagList);
console.log(tagList.getItemsCount());
