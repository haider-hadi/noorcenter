import { supabase } from './supabase.js'; // Ensure this is imported

function readCart() { return JSON.parse(localStorage.getItem('cart') || '[]'); }
function calculateTotal(cart) { return cart.reduce((s, i) => s + (i.price * i.qty), 0); }

const cart = readCart();
const sumEl = document.getElementById('summary');
const orderMsg = document.getElementById('orderMsg');

// Display Summary
if (sumEl) {
    sumEl.innerHTML = cart.map(i => `<div>${i.name} × ${i.qty} — PKR ${(i.price * i.qty).toLocaleString()}</div>`).join('') +
        `<hr><strong>Total: PKR ${calculateTotal(cart).toLocaleString()}</strong>`;
}

document.getElementById('checkoutForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    orderMsg.textContent = 'Processing order...';
    
    const fd = new FormData(e.target);
    const orderData = {
        customer_name: fd.get('name'),
        phone: fd.get('phone'),
        address: fd.get('address'),
        total: calculateTotal(cart),
        status: 'pending' // Matches your SQL check constraint
    };

    if (cart.length === 0) {
        orderMsg.textContent = 'Your cart is empty!';
        return;
    }

    // ACTUALLY INSERT INTO SUPABASE
    const { error } = await supabase
        .from('orders')
        .insert([orderData]);

    if (error) {
        orderMsg.style.color = 'red';
        orderMsg.textContent = 'Order Failed: ' + error.message;
    } else {
        orderMsg.style.color = 'green';
        orderMsg.textContent = 'Order placed successfully! Redirecting...';
        localStorage.removeItem('cart');
        setTimeout(() => { window.location.href = 'index.html'; }, 2000);
    }
});