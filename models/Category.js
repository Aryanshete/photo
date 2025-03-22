const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Generate slug before saving
categorySchema.pre('save', function(next) {
    if (!this.isModified('name')) return next();
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    next();
});

module.exports = mongoose.model('Category', categorySchema);
