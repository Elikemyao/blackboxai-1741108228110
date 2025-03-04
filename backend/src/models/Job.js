const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Job title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Job description is required']
    },
    company: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true
    },
    location: {
        type: String,
        required: [true, 'Job location is required'],
        trim: true
    },
    jobType: {
        type: String,
        required: [true, 'Job type is required'],
        enum: ['Full Time', 'Part Time', 'Freelance', 'Internship', 'Temporary'],
        default: 'Full Time'
    },
    salary: {
        type: String,
        required: [true, 'Salary range is required'],
        trim: true
    },
    requirements: [{
        type: String,
        trim: true
    }],
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'closed', 'draft'],
        default: 'active'
    },
    postedDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Add text index for search functionality
jobSchema.index({ 
    title: 'text', 
    description: 'text', 
    company: 'text', 
    location: 'text' 
});

module.exports = mongoose.model('Job', jobSchema);
