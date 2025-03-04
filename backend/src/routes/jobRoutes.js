const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getAllJobs,
    getJobById,
    createJob,
    updateJob,
    deleteJob,
    getJobStats
} = require('../controllers/jobController');

// Public routes
router.get('/', getAllJobs);
router.get('/stats', getJobStats);
router.get('/:id', getJobById);

// Protected routes (require authentication)
router.use(protect); // Apply authentication middleware to all routes below
router.post('/', createJob);
router.put('/:id', updateJob);
router.delete('/:id', deleteJob);

module.exports = router;
