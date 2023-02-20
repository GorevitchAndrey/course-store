const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

class Course {
  constructor(title, price, img) {
    this.title = title;
    this.price = price;
    this.img = img;
    this.id = uuidv4();
  }

  toJson() {
    return {
      title: this.title,
      price: this.price,
      img: this.img,
      id: this.id,
    }
  }

  static async update(data) {
    let courses = await Course.getAll();
    const courseIndex = courses.findIndex(course => course.id === data.id);
    courses[courseIndex] = data;
    Course.saveFile(courses);
  }

  async save() {
    const courses = await Course.getAll()
    courses.push(this.toJson())
    Course.saveFile(courses);
  }

  static saveFile(courses) {
    return new Promise((resolve, reject) => {
      fs.writeFile(
        path.join(__dirname, '..', 'data', 'courses.json'),
        JSON.stringify(courses),
        (err) => {
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        }
      )
    })
  }

  static getAll() {
    return new Promise((resolve, reject) => {
      fs.readFile(
        path.join(__dirname, '..', 'data', 'courses.json'),
        'utf-8',
        (err, data) => {
          if (err) {
            reject(err)
          } else {
            resolve(JSON.parse(data))
          }
        }
      )
    })
  }

  static  async getById(id) {
    let courses = await Course.getAll();
    return courses.find(course => course.id === id)
  }
}

module.exports = Course;