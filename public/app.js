const toCurrency = price => {
  return new Intl.NumberFormat('can', {
    currency: 'can',
    style: 'currency'
  }).format(price)
}

const toDate = date => {
  return new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

document.querySelectorAll('.price').forEach(node => {
  node.textContent = toCurrency(node.textContent)
})

document.querySelectorAll('.date').forEach(node => {
  node.textContent = toDate(node.textContent)
})

const currentCart = document.querySelector('.basket');

if (currentCart) {
  currentCart.addEventListener('click', event => {
    if (event.target.classList.contains('remove-course')) {
      const id = event.target.dataset.id;
      console.log(2,currentCart);
      
      fetch('/cart/remove/' + id, { method: 'delete' })
      .then(res => res.json())
        .then(cart => {
          console.log(cart)
          if (cart.courses.length) {
            const html = cart.courses.map(c => {
              return `
              <tr>
                <td>${c.title}</td>
                <td>${c.count}</td>
                <td>
                  <button class="btn btm-small remove-course" data-id="${c.id}">Delete</button>
                </td>
              </tr>
              `
            }).join('')
            currentCart.querySelector('tbody').innerHTML = html
            currentCart.querySelector('.price').textContent = toCurrency(cart.price)
          } else {
            currentCart.innerHTML = '<p>Cart is empty</p>'
          }
        })
    }
    
  })
} 