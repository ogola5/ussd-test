// controllers/analyticsController.js
import Case from '../models/Case.js';

export async function getAnalytics(req, res) {
  try {
    const { from, to } = req.query; // optional ISO dates
    const match = {};
    if (from || to) {
      match.createdAt = {};
      if (from) match.createdAt.$gte = new Date(from);
      if (to) match.createdAt.$lte = new Date(to);
    }

    const [byType, byCounty, byStatus, monthly, gbvBreakdown] = await Promise.all([
      Case.aggregate([{ $match: match }, { $group: { _id: '$type', total: { $sum: 1 } } }, { $sort: { total: -1 } }]),
      Case.aggregate([{ $match: match }, { $group: { _id: '$county', total: { $sum: 1 } } }, { $sort: { total: -1 } }]),
      Case.aggregate([{ $match: match }, { $group: { _id: '$status', total: { $sum: 1 } } }]),
      Case.aggregate([
        { $match: match },
        { $group: { _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } }, total: { $sum: 1 } } },
        { $sort: { '_id.y': 1, '_id.m': 1 } }
      ]),
      Case.aggregate([{ $match: match }, { $group: { _id: '$gbvRelated', total: { $sum: 1 } } }])
    ]);

    res.json({ byType, byCounty, byStatus, monthly, gbvBreakdown });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}
