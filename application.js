var TEXT_IN_EFFECT = 'vanishIn';
var TEXT_OUT_EFFECT = 'puffOut';
var STORAGE_KEY = 'annual-party';

var slotMachine = null;
var allPlayers = [];
var candidates = [];
var winners = [];
var candidatesCount = 20;
var luckyOne = 0;

var $roulette = null;
var $winner = null;
var $button = null;

function loadState() {
  console.log('Load State...');
  var json = localStorage.getItem(STORAGE_KEY);
  if(json == null) {
    console.log('No local state!');
    return false;
  }

  var data = JSON.parse(json);
  console.log('State: ', data);
  allPlayers = data.allPlayers;
  winners = data.winners;

  generateResult();
  refresh();

  return true;
}
function saveState() {
  var data = {
    allPlayers: allPlayers,
    winners: winners
  };
  console.log('Save state: ', data);
  var json = JSON.stringify(data);
  localStorage.setItem(STORAGE_KEY, json);
}
function reload() {
  if(!loadState()) {
    reloadFromServer();
  }
}
function reloadFromServer() {
  console.log('Load state from server...');
  $.getJSON('./list.json')
  .done(function(list) {
    console.log('Server reponse: ', list);
    allPlayers = list;
    winners = [];
    list.forEach(function(item, index) { item.index = index; });
    saveState();
    generateResult();
    refresh();
  });
}

function resetState() {
  winners = [];
  saveState();
}

function recordWinner(winner) {
  winners.push(winner.index);
  saveState();
}

function isWinner(index) {
    return winners.includes(index);
}

function recordWinner(winner) {
  winners.push(winner);
  saveState();
}

var defaultConfig = {
  active	: 0,
  delay	: 500,
  randomize: function() { return luckyOne; },
  complete: function(result) {
    var winner = candidates[result];
    renderStop(winner);
  }
};

function randomPick(max) {
  return (Math.random() * max) >> 0;
}

function pickCandidates(total, count) {
  var result = [];
  var current = 0;

  while(result.length < count) {
    current = randomPick(total);
    if(!result.includes(current) && !isWinner(current)) {
      result.push(current);
    }
  }

  return result;
}

function generateResult() {
  candidates = pickCandidates(allPlayers.length, candidatesCount)
              .map(function(index) { return allPlayers[index] });

  console.log("candidates: ", candidates);

  luckyOne = randomPick(candidates.length);

  console.log("luckyOne: ", luckyOne, candidates[luckyOne]);
}

function refresh() {
  $roulette.html('').data('plugin_slotMachine', null);
  candidates.forEach(function(item) {
    $('<img>')
    .attr('src', item.photo)
    .appendTo($roulette);
  });
  slotMachine = $roulette.slotMachine(defaultConfig);
}

function start() {
  $button.attr('disabled', 'disabled');
  setTimeout(function() { $button.attr('disabled', null); }, 500);
  generateResult();
  refresh();
  slotMachine.shuffle();
  renderStart();
}

function renderStart() {
  $button.text('停止').addClass('shake-constant shake-rotate');
  $winner.removeClass(TEXT_IN_EFFECT).addClass(TEXT_OUT_EFFECT);
}

function stop() {
  slotMachine.stop();
  renderStopping();
}

function renderStopping() {
  $button.attr('disabled', 'disabled');
}

function renderStop(winner) {
  console.log("Winner: ", winner);
  recordWinner(winner);
  $winner.text(winner.name).removeClass(TEXT_OUT_EFFECT).addClass(TEXT_IN_EFFECT);
  $button.text('开始').attr('disabled', null).removeClass('shake-constant shake-rotate').addClass('shake-little');
}

function toggleButton() {
  if(slotMachine.running) {
    stop();
  } else {
    start();
  }
}

$(function() {
  $roulette = $('.roulette');
  $winner = $('.winner');
  $button = $('.start-button');

  $button.click(toggleButton);
  $(document).keypress(function(e) {
    console.log(e);
    if([13, 32].includes(e.which)) {
      e.preventDefault();
      toggleButton();
    }
  });

  reload();
});
