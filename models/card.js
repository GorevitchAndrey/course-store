const path = require('path');
const fs = require('fs');

const currentPath = path.join(
  path.dirname(require.main.filename),
  'data',
  'card.json'
)

class Card {
  static async add(data) {
    const card = await Card.fetch()
    const index = card.courses.findIndex(course => course.id === data.id);
    const candidate = card.courses[index];

    if (candidate) {
      // already have a course
      candidate.count++
      card.courses[index] = candidate;
    } else {
      // add course
      data.count = 1;
      card.courses.push(data);
    }

    card.price += +data.price;
    return new Promise((resolve, reject) => {
      fs.writeFile(currentPath, JSON.stringify(card), err => {
        if (err) {
          reject(err)
        } else {
          resolve(card)
        }
      })
    })
  } 

  static async fetch() {
    return new Promise((resolve, reject) => {
      fs.readFile(currentPath, 'utf-8', (err, content) => {
        if (err) {
          reject(err)
        } else {
          resolve(JSON.parse(content))
        }
      })
    })
  }

  static async remove(id) {
    const card = await Card.fetch();
    const index = card.courses.findIndex(cours => cours.id === id);
    const currentCourse = card.courses[index];

    if (currentCourse.count === 1) {
      // delete
      card.courses = card.courses.filter(course => course.id !== id);
    } else {
      //change count
      card.courses[index].count--;
    }

    card.price -= currentCourse.price;
    return new Promise((resolve, reject) => {
      fs.writeFile(currentPath, JSON.stringify(card), err => {
        if (err) {
          reject(err)
        } else {
          resolve(card)
        }
      })
    })
  }

  // static updateData(card) {
  //   return new Promise((resolve, reject) => {
  //     fs.writeFile(currentPath, JSON.stringify(card), err => {
  //       if (err) {
  //         reject(err)
  //       } else {
  //         resolve(card)
  //       }
  //     })
  //   })
  // }
}

module.exports = Card