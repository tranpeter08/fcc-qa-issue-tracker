const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
  const PROJECT_NAME = 'test_project';
  const testEndpoint = '/api/issues/' + PROJECT_NAME;

  test('Create an issue with every field: POST request to /api/issues/{project}', (done) => {
    chai
      .request(server)
      .post(testEndpoint)
      .send({
        issue_title: 'test1',
        assigned_to: 'test person2',
        created_by: 'test person1',

        issue_text: 'test test',
        open: true,
        status_text: 'test',
      })
      .end((err, res) => {
        const expectedFields = [
          '_id',
          'issue_title',
          'issue_text',
          'created_on',
          'updated_on',
          'created_by',
          'assigned_to',
          'open',
          'status_text',
        ];

        for (const field of expectedFields) {
          assert.property(res.body, field);
        }

        done();
      });
  });

  test('Create an issue with only required fields: POST request to /api/issues/{project}', (done) => {
    chai
      .request(server)
      .post(testEndpoint)
      .send({
        issue_title: 'test2',
        created_by: 'test person1',
        issue_text: 'test test',
      })
      .end((err, res) => {
        const expectedFields = [
          '_id',
          'issue_title',
          'issue_text',
          'created_on',
          'updated_on',
          'created_by',
          'assigned_to',
          'open',
          'status_text',
        ];

        for (const field of expectedFields) {
          assert.property(res.body, field);
        }

        done();
      });
  });

  test('Create an issue with missing required fields: POST request to /api/issues/{project}', (done) => {
    chai
      .request(server)
      .post(testEndpoint)
      .send({
        issue_titles: 'test2',
        issue_text: 'test',
      })
      .end((err, res) => {
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'required field(s) missing');

        done();
      });
  });

  test('View issues on a project: GET request to /api/issues/{project}', (done) => {
    chai
      .request(server)
      .get(testEndpoint)
      .end((err, res) => {
        assert.isArray(res.body);
        assert.isAtLeast(res.body.length, 1);
        done();
      });
  });

  test('View issues on a project with one filter: GET request to /api/issues/{project}', (done) => {
    const created_by = 'test person1';

    chai
      .request(server)
      .get(testEndpoint)
      .query({ created_by })
      .end((err, res) => {
        assert.isArray(res.body);
        assert.isAtLeast(res.body.length, 1);

        for (const result of res.body) {
          assert.equal(result.created_by, created_by);
        }

        done();
      });
  });

  test('View issues on a project with multiple filters: GET request to /api/issues/{project}', (done) => {
    const created_by = 'test person1';
    const assigned_to = 'test person2';

    chai
      .request(server)
      .get(testEndpoint)
      .query({ created_by, assigned_to })
      .end((err, res) => {
        assert.isArray(res.body);
        assert.isAtLeast(res.body.length, 1);

        for (const result of res.body) {
          assert.equal(result.created_by, created_by);
          assert.equal(result.assigned_to, assigned_to);
        }
      });

    done();
  });

  test('Update one field on an issue: PUT request to /api/issues/{project}', (done) => {
    let _id = null;
    let prevUpdatedDate = null;
    let prevText = null;
    let newText = null;
    const created_by = 'test person1';
    const SUCCESS_MESSAGE = 'successfully updated';

    chai
      .request(server)
      .get(testEndpoint)
      .query({
        created_by,
      })
      .then((res) => {
        const record = res.body[0];

        _id = record._id;
        prevText = record.issue_text;

        const words = prevText.split(' ');

        if (words.length > 2) {
          words.pop();
        } else {
          words.push('test');
        }

        newText = words.join(' ');

        return chai.request(server).put(testEndpoint).send({
          _id,
          issue_text: newText,
        });
      })
      .then((res) => {
        const expectedFields = ['_id', 'result'];

        for (const field of expectedFields) {
          assert.property(res.body, field);
        }

        assert.equal(res.body._id, _id);
        assert.equal(res.body.result, SUCCESS_MESSAGE);

        done();
      })
      .catch((error) => {
        assert.fail(error.message);
      });
  });

  test('Update an issue with missing _id: PUT request to /api/issues/{project}', (done) => {
    chai
      .request(server)
      .put(testEndpoint)
      .send({
        issue_text: 'no _id',
      })
      .then((res) => {
        const expectedFields = ['error'];
        const errorMessage = 'missing _id';

        for (const field of expectedFields) {
          assert.property(res.body, field);
        }

        assert.equal(res.body.error, errorMessage);
        done();
      })
      .catch((error) => {
        assert.fail(error.message);
      });
  });

  test('Update an issue with missing _id: PUT request to /api/issues/{project}', (done) => {
    chai
      .request(server)
      .put(testEndpoint)
      .send({
        issue_text: 'no _id',
      })
      .then((res) => {
        const expectedFields = ['error'];
        const errorMessage = 'missing _id';

        for (const field of expectedFields) {
          assert.property(res.body, field);
        }

        assert.equal(res.body.error, errorMessage);
        done();
      })
      .catch((error) => {
        assert.fail(error.message);
      });
  });

  test('Update an issue with no fields to update: PUT request to /api/issues/{project}', (done) => {
    let _id = null;
    const created_by = 'test person1';
    const ERROR_MESSAGE = 'no update field(s) sent';

    chai
      .request(server)
      .get(testEndpoint)
      .query({
        created_by,
      })
      .then((res) => {
        const record = res.body[0];
        _id = record._id;

        return chai.request(server).put(testEndpoint).send({
          _id,
        });
      })
      .then((res) => {
        const expectedFields = ['_id', 'error'];

        for (const field of expectedFields) {
          assert.property(res.body, field);
        }

        assert.equal(res.body._id, _id);
        assert.equal(res.body.error, ERROR_MESSAGE);
        done();
      })
      .catch((error) => {
        assert.fail(error.message);
      });
  });

  test('Update an issue with an invalid _id: PUT request to /api/issues/{project}', (done) => {
    let _id = 'wrong_id';
    const ERROR_MESSAGE = 'could not update';

    chai
      .request(server)
      .put(testEndpoint)
      .send({
        _id,
        assigned_to: 'wrong person',
      })
      .then((res) => {
        const expectedFields = ['_id', 'error'];

        for (const field of expectedFields) {
          assert.property(res.body, field);
        }

        assert.equal(res.body._id, _id);
        assert.equal(res.body.error, ERROR_MESSAGE);
        done();
      })
      .catch((error) => {
        assert.fail(error.message);
      });
  });

  test('Delete an issue: DELETE request to /api/issues/{project}', (done) => {
    let _id = null;
    const created_by = 'test person1';
    const SUCCESS_MESSAGE = 'successfully deleted';

    chai
      .request(server)
      .get(testEndpoint)
      .query({
        created_by,
      })
      .then((res) => {
        const record = res.body[0];
        _id = record._id;

        return chai.request(server).delete(testEndpoint).send({
          _id,
        });
      })
      .then((res) => {
        const expectedFields = ['_id', 'result'];

        for (const field of expectedFields) {
          assert.property(res.body, field);
        }

        assert.equal(res.body._id, _id);
        assert.equal(res.body.result, SUCCESS_MESSAGE);

        done();
      })
      .catch((error) => {
        assert.fail(error.message);
      });
  });

  test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', (done) => {
    let _id = 'wrong_id';
    const ERROR_MESSAGE = 'could not delete';

    chai
      .request(server)
      .delete(testEndpoint)
      .send({
        _id,
      })
      .then((res) => {
        const expectedFields = ['_id', 'error'];

        for (const field of expectedFields) {
          assert.property(res.body, field);
        }

        assert.equal(res.body._id, _id);
        assert.equal(res.body.error, ERROR_MESSAGE);

        done();
      })
      .catch((error) => {
        assert.fail(error.message);
      });
  });

  test('Delete an issue with missing _id: DELETE request to /api/issues/{project}', (done) => {
    const ERROR_MESSAGE = 'missing _id';

    chai
      .request(server)
      .delete(testEndpoint)
      .then((res) => {
        const expectedFields = ['error'];

        for (const field of expectedFields) {
          assert.property(res.body, field);
        }

        assert.equal(res.body.error, ERROR_MESSAGE);

        done();
      })
      .catch((error) => {
        assert.fail(error.message);
      });
  });
});
