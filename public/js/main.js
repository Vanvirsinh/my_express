const form = document.querySelector('#contact-form');
const nameInput = document.querySelector('#name');
const emailInput = document.querySelector('#email');
const messageInput = document.querySelector('#message');
const submitButton = document.querySelector('#submit-btn');

form.addEventListener('submit', handleSubmit);

function handleSubmit(event) {
    event.preventDefault();
    alert('form submitted!');
}
