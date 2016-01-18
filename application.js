$(function() {
  var $roulette = $('.roulette');
  var slotMachine = null;
  var $winner = $('.winner');
  var $button = $('.start-button');
  var TEXT_IN_EFFECT = 'vanishIn';
  var TEXT_OUT_EFFECT = 'puffOut';


  var allPlayers = [];
  var candidates = [];
  var winners = [];
  var candidatesCount = 20;
  var luckyOne = 0;

  var defaultConfig = {
		active	: 0,
		delay	: 500,
    randomize: function() { return luckyOne; },
    complete: function(result) {
      var winner = candidates[result];
      renderStop(winner);
    }
  };

  function reload() {
    $.getJSON('./list.json')
    .done(function(list) {
      allPlayers = list;
      list.forEach(function(item, index) { item.index = index; });
      generateResult();
      refresh();
    });
  }

  function randomPick(max) {
    return (Math.random() * max) >> 0;
  }

  function pickCandidates(total, count, blackList) {
    var result = [];
    var current = 0;

    while(result.length < count) {
      current = randomPick(total);
      if(!result.includes(current) && !blackList.includes(current)) {
        result.push(current);
      }
    }

    return result;
  }

  function generateResult() {
    candidates = pickCandidates(allPlayers.length, candidatesCount, winners)
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
    rednerStart();
  }

  function rednerStart() {
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
    winners.push(winner.index);
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
