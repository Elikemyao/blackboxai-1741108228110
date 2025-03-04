const Job = require('../models/Job');

// @desc    Get all jobs with filtering, sorting, and pagination
// @route   GET /api/jobs
// @access  Public
exports.getAllJobs = async (req, res, next) => {
    try {
        const { 
            keyword,
            location,
            jobType,
            page = 1,
            limit = 10,
            sort = '-postedDate'
        } = req.query;

        // Build query
        const query = {};

        // Search by keyword in title, description, or company
        if (keyword) {
            query.$or = [
                { title: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } },
                { company: { $regex: keyword, $options: 'i' } }
            ];
        }

        // Filter by location
        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        // Filter by job type
        if (jobType) {
            query.jobType = jobType;
        }

        // Only show active jobs
        query.status = 'active';

        // Execute query with pagination
        const jobs = await Job.find(query)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('postedBy', 'name company');

        // Get total documents
        const total = await Job.countDocuments(query);

        res.status(200).json({
            success: true,
            data: jobs,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public
exports.getJobById = async (req, res, next) => {
    try {
        const job = await Job.findById(req.params.id)
            .populate('postedBy', 'name company');

        if (!job) {
            return res.status(404).json({
                success: false,
                error: 'Job not found'
            });
        }

        res.status(200).json({
            success: true,
            data: job
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new job
// @route   POST /api/jobs
// @access  Private (Employers only)
exports.createJob = async (req, res, next) => {
    try {
        // Add user to req.body
        req.body.postedBy = req.user.id;

        const job = await Job.create(req.body);

        res.status(201).json({
            success: true,
            data: job
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private (Job poster only)
exports.updateJob = async (req, res, next) => {
    try {
        let job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({
                success: false,
                error: 'Job not found'
            });
        }

        // Make sure user is job owner
        if (job.postedBy.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized to update this job'
            });
        }

        job = await Job.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: job
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private (Job poster only)
exports.deleteJob = async (req, res, next) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({
                success: false,
                error: 'Job not found'
            });
        }

        // Make sure user is job owner
        if (job.postedBy.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized to delete this job'
            });
        }

        await job.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get jobs statistics
// @route   GET /api/jobs/stats
// @access  Public
exports.getJobStats = async (req, res, next) => {
    try {
        const stats = await Job.aggregate([
            {
                $group: {
                    _id: '$jobType',
                    count: { $sum: 1 }
                }
            }
        ]);

        const totalJobs = await Job.countDocuments({ status: 'active' });
        const totalCompanies = await Job.distinct('company').length;

        res.status(200).json({
            success: true,
            data: {
                stats,
                totalJobs,
                totalCompanies
            }
        });
    } catch (error) {
        next(error);
    }
};
