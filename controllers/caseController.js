import Case from '../models/Case.js';

// ------------------ Create a Case ------------------
export async function createCase(req, res) {
  try {
    const { title, description, type, county, location, partiesInvolved, gbvRelated } = req.body;

    const doc = await Case.create({
      // Remove user reference for now
      // user: req.user?.id || null,
      title,
      description,
      type,
      county,
      location,
      partiesInvolved,
      gbvRelated: !!gbvRelated,
      statusHistory: [{ status: 'submitted', note: 'Submitted by user', by: null }],
    });

    res.status(201).json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// ------------------ Get All Cases ------------------
export async function getMyCases(req, res) {
  try {
    // Return all cases for now (no user filter)
    const docs = await Case.find().sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// ------------------ Get Case by ID ------------------
export async function getCaseById(req, res) {
  try {
    const doc = await Case.findById(req.params.id).populate('user', 'name email');
    if (!doc) return res.status(404).json({ message: 'Not found' });

    // Skip user/admin restriction for now
    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// ------------------ Admin / List Cases ------------------
export async function listCases(req, res) {
  try {
    const { county, type, status, q, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (county) filter.county = county;
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (q) filter.$text = { $search: q };

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Case.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Case.countDocuments(filter),
    ]);

    res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// ------------------ Update Case Status ------------------
export async function updateCaseStatus(req, res) {
  try {
    const { status, note } = req.body;
    const doc = await Case.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });

    doc.status = status || doc.status;
    // Use null for `by` field since no authentication
    doc.statusHistory.push({ status: doc.status, note, by: null });

    await doc.save();
    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}
