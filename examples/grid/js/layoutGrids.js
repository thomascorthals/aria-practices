var aria = aria || {};

/**
 * ARIA Grid Examples
 * @function onload
 * @desc Initialize the grid examples once the page has loaded
 */

window.addEventListener('load', function () {
  var ex1 = document.getElementById('ex1');
  var ex1Grid = new aria.Grid(ex1.querySelector('[role="grid"]'));

  var ex2 = document.getElementById('ex2');
  var ex2Grid = new aria.Grid(ex2.querySelector('[role="grid"]'));

  var ex3 = document.getElementById('ex3');
  var ex3Grid = new aria.Grid(ex3.querySelector('[role="grid"]'));

  var pillList = new PillList(
    ex2Grid,
    document.getElementById('add-recipient-input'),
    document.getElementById('add-recipient-button'),
    document.getElementById('form-action-text')
  );

  var gridNUX = document.getElementById('grid-nux');
  var NUXclose = document.getElementById('close-nux-button');
  var closeNUX = function () {
    var cellToRefocus = document.querySelector('#ex1 [tabindex="0"]');
    gridNUX.className = 'grid-nux hidden';
    try {
      cellToRefocus.focus();
    } catch (error) {

    }
  };
  NUXclose.addEventListener('click', closeNUX);
  NUXclose.addEventListener('keyup', function (event) {
    var key = event.which || event.keyCode;
    if (key === aria.KeyCode.RETURN) {
      closeNUX();
    }
  });
});

function PillList (grid, input, submitButton, formUpdateText) {
  // Hardcoded to work for example 2
  this.pillIDs = {length: 2, 1: true, 2: true};
  this.nextPillID = 3;
  this.grid = grid;
  this.input = input;
  this.submitButton = submitButton;
  this.formUpdateText = formUpdateText;

  this.input.addEventListener('keydown', this.checkSubmitItem.bind(this));
  this.submitButton.addEventListener('click', this.submitItemForm.bind(this));
  this.grid.gridNode.addEventListener('click', this.checkRemovePill.bind(this));
  this.grid.gridNode.addEventListener('keydown', this.checkRemovePill.bind(this));
};

PillList.prototype.checkSubmitItem = function (event) {
  var key = event.which || event.keyCode;

  if (key === aria.KeyCode.RETURN) {
    this.submitItemForm();
  }
};

PillList.prototype.getRecipientsString = function () {
  var recipientCount = this.pillIDs.length;
  if (recipientCount === 1) {
    return '1 recipient total.';
  }
  else {
    return recipientCount + ' recipients total.';
  }
};

PillList.prototype.submitItemForm = function () {
  var newItem = this.input.value;
  this.addPillItem(newItem);
  this.input.value = '';
  this.input.focus();
  this.formUpdateText.innerText = newItem + ' added. ' + this.getRecipientsString();
};

PillList.prototype.addPillItem = function (recipientName) {
  var id = this.nextPillID;

  if (!recipientName) {
    return;
  }

  var newPillItem = document.createElement('div');
  newPillItem.setAttribute('role', 'row');
  newPillItem.setAttribute('data-id', 'id');
  newPillItem.className = 'pill-item';

  newPillItem.innerHTML =
    '<span role="gridcell">'
      + '<a id="r' + id + '" class="pill-name" tabindex="-1" href="#">'
        + recipientName
      + '</a>'
    + '</span>'
    + '<span role="gridcell">'
      + '<span id="rb' + id + '" class="pill-remove" tabindex="-1" role="button"'
        + 'aria-label="Remove" aria-labelledby="rb' + id + ' r' + id + '">'
        + 'X'
      + '</span>'
    + '</span>';

  this.grid.gridNode.append(newPillItem);
  this.grid.setupFocusGrid();

  if (this.grid.grid.length === 1) {
    this.grid.focusedRow = undefined;
    this.grid.focusedCol = undefined;
    this.grid.setFocusPointer(0, 0);
  }

  this.nextPillID++;
  this.pillIDs[id] = true;
  this.pillIDs.length++;
};

PillList.prototype.checkRemovePill = function (event) {
  var pillItem, pillID, pillName;
  var isClickEvent = (event.type === 'click');
  var key = event.which || event.keyCode;

  if (!isClickEvent
      && key !== aria.KeyCode.RETURN
      && key !== aria.KeyCode.SPACE) {
    return;
  }

  if (event.target.className === 'pill-remove') {
    pillItem = event.target.parentNode.parentNode;
    pillID = pillItem.getAttribute('data-id');
    pillName = pillItem.querySelector('.pill-name').innerText;
  }
  else {
    return;
  }

  delete this.pillIDs[pillID];
  this.pillIDs.length--;
  this.formUpdateText.innerText = pillName + ' removed. ' + this.getRecipientsString();

  pillItem.remove();
  this.grid.setupFocusGrid();

  if (this.grid.isValidCell(this.grid.focusedRow, this.grid.focusedCol)) {
    // First, try to focus on the next pill
    this.grid.focusCell(this.grid.focusedRow, this.grid.focusedCol);
  }
  else if (this.grid.isValidCell(--this.grid.focusedRow, this.grid.focusedCol)) {
    // If there is no next pill, try to focus on the previous pill
    this.grid.focusCell(this.grid.focusedRow, this.grid.focusedCol);
  }
};
