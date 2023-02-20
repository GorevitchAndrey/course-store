const toCurrency = price => {
  return new Intl.NumberFormat('ru-RU', {
    currency: 'rub',
    style: 'currency'
  }).format(price)
}

document.querySelectorAll('.price').forEach(node => {
  node.textContent = toCurrency(node.textContent)
})

const currentCard = document.querySelector('.basket');

if (currentCard) {
  currentCard.addEventListener('click', event => {
    console.log(currentCard);
    console.log('----');
    if (event.target.classList.contains('remove-course')) {
      const id = event.target.dataset.id;
      console.log(2,currentCard);
      
      fetch('/card/remove/' + id, { method: 'delete' })
      .then(res => res.json())
        .then(card => {
          console.log(card)
          if (card.courses.length) {
            const html = card.courses.map(c => {
              return `
              <tr>
                <td>${c.title}</td>
                <td>${c.count}</td>
                <td>
                  <button class="btn btm-small remove-course" data-id="${c.id}">Удалить</button>
                </td>
              </tr>
              `
            }).join('')
            currentCard.querySelector('tbody').innerHTML = html
            currentCard.querySelector('.price').textContent = toCurrency(card.price)
          } else {
            currentCard.innerHTML = '<p>Корзина пуста</p>'
          }
        })
    }
    
  })
} 