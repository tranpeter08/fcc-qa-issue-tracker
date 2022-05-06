'use strict';

const Issue = require('../models/Issue');
const {
  validateRequiredPOSTFields,
  validateRequiredPUTFields,
  validateRequiredDELETEFields,
} = require('../middlewares/issuesValidators');
const DB_TABLE = 'issue_tracker';

module.exports = function (app) {
  app
    .route('/api/issues/:project')

    .get(async function (req, res) {
      let project = req.params.project;
      const filters = req.query;

      try {
        const db = req.app.get('db');

        // console.log(filters);

        const { data, error } = await db
          .from(DB_TABLE)
          .select(
            '_id,issue_title,issue_text,created_on,updated_on,created_by,assigned_to,open,status_text'
          )
          .match({ ...filters, project });

        if (error) throw error;

        // console.log(data);
        res.json(data);
      } catch (error) {
        res.send('error');
      }
    })

    .post(validateRequiredPOSTFields, async function (req, res) {
      let project = req.params.project;

      const {
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        open,
        status_text,
      } = req.body;

      try {
        const db = req.app.get('db');
        const issue = new Issue(
          project,
          issue_title,
          issue_text,
          created_by,
          assigned_to,
          open,
          status_text
        );

        const { data, error } = await db
          .from(DB_TABLE)
          .insert([issue])
          .select(
            '_id,issue_title,issue_text,created_on,updated_on,created_by,assigned_to,open,status_text'
          );

        if (error) throw error;

        res.json(data[0]);
      } catch (error) {
        console.log(error);
        res.send('error');
      }
    })

    .put(validateRequiredPUTFields, async function (req, res) {
      let project = req.params.project;
      const { _id, ...payload } = req.body;

      try {
        const db = req.app.get('db');
        const { data, error } = await db
          .from(DB_TABLE)
          .update({ ...payload, updated_on: new Date().toUTCString })
          .match({ _id, project });

        if (error) return res.send({ error: 'could not update', _id: _id });

        res.json({ result: 'successfully updated', _id: data[0]._id });
      } catch (error) {
        console.log(error);
        res.send({ error: 'server error' });
      }
    })

    .delete(validateRequiredDELETEFields, async function (req, res) {
      let project = req.params.project;
      const { _id } = req.body;

      try {
        const db = req.app.get('db');
        const { data, error } = await db
          .from(DB_TABLE)
          .delete()
          .match({ _id, project });

        if (error) return res.send({ error: 'could not delete', _id: _id });

        res.json({ result: 'successfully deleted', _id: data[0]._id });
      } catch (error) {
        console.log(error);
        res.send({ error: 'server error' });
      }
    });
};
