const mainMenu = [
    { number: 1, text: 'Place An Order' },
    { number: 99, text: 'Checkout Order' },
    { number: 98, text: 'Check Order History' },
    { number: 97, text: 'Check Current Order' },
    { number: 0, text: 'Cancel Order' }
];

const foodMenu = [
    { number: 1, food: 'Oha soup with semo', price: 1800 },
    { number: 2, food: 'Fried Rice with chicken', price: 1500 },
    { number: 3, food: 'Ofensala with beaf and fufu', price: 3000 },
    { number: 4, food: 'Ogbono and wheat', price: 1800 },
    { number: 5, food: 'Egusi and semo', price: 1200 }
];

module.exports = {
    mainMenu,
    foodMenu
};
