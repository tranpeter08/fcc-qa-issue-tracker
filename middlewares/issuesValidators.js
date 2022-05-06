module.exports = {
  validateRequiredPOSTFields(req, res, next) {
    const requiredFields = ['issue_title', 'issue_text', 'created_by'];

    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.json({ error: 'required field(s) missing' });
      }
    }

    next();
  },

  validateRequiredPUTFields(req, res, next) {
    const { _id } = req.body;

    if (!_id) {
      return res.json({ error: 'missing _id' });
    }

    const keys = Object.keys(req.body);
    let _idIndex = keys.indexOf('_id');

    keys.splice(_idIndex, 1);

    if (keys.length === 0) {
      return res.json({ error: 'no update field(s) sent', _id: _id });
    }

    next();
  },

  validateRequiredDELETEFields(req, res, next) {
    const { _id } = req.body;

    if (!_id) {
      return res.json({ error: 'missing _id' });
    }

    next();
  },
};
