const { Schema, model } = require('mongoose');

const userSchema = new Schema({
  email: {
    type: String,
    require: true
  },
  name: {
    type: String,
  },
  password: {
    type: String,
    require: true
  },
  cart: {
    items: [
      {
        count: {
          type: Number,
          require: true,
          default: 1
        },
        courseId: {
          type: Schema.Types.ObjectId,
          ref: 'Course',
          require: true
        }
      }
    ]
  }
})

userSchema.methods.addToCart = function(data) {
  const clone = [...this.cart.items];
  const index = clone.findIndex(course => {
    return course.courseId.toString() === data._id.toString();
  })

  if (index >= 0 ) {
    clone[index].count = clone[index].count + 1;
  } else {
    clone.push({
      courseId: data._id,
      count: 1
    })
  }

  this.cart = { items: clone };
  return this.save();
}

userSchema.methods.removeFromCart = function(id) {
  let clone = [...this.cart.items];
  const index = clone.findIndex(course => {
    return course.courseId.toString() === id.toString();
  })

  if (clone[index].count === 1 ) {
    clone = clone.filter(course => course.courseId.toString() !== id.toString())
  } else {
    clone[index].count--;
  }

  this.cart = { items: clone };
  return this.save();
}

userSchema.methods.clearCart = function() {
  this.cart = { items: [] };
  return this.save();
}

module.exports = model('User', userSchema);