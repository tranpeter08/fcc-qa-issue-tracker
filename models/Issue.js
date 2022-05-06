module.exports = class Issue {
  constructor(
    project,
    issue_title,
    issue_text,
    created_by,
    assigned_to = '',
    open = true,
    status_text = ''
  ) {
    this.project = project;
    this.issue_title = issue_title;
    this.issue_text = issue_text;
    this.created_by = created_by;
    this.assigned_to = assigned_to;
    this.status_text = status_text;
  }
};
