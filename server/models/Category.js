import mongoose from 'mongoose';


const categorySchema = new mongoose.Schema({
    categoryName: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true,
        unique: true
    }
}, {
    timestamps: true
});

// Pre-save middleware to capitalize category name
categorySchema.pre('save', function(next) {
    if (this.categoryName) {
        this.categoryName = this.categoryName.charAt(0).toUpperCase() + 
                           this.categoryName.slice(1);
    }
    next();
});

const Category = mongoose.model('Category', categorySchema);

export default Category;