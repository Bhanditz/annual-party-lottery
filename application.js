$(function() {
  var $roulette = $('.roulette');
  var $slotMachine = null;
  var $winner = $('.winner');

  var allPlayers = [];
  var candidates = [];
  var winners = [];
  var candidatesCount = 20;
  var luckyOne = 0;

  var defaultConfig = {
		active	: 0,
		delay	: 500,
    randomize: function() { return luckyOne; }
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
    $slotMachine = $roulette.slotMachine(defaultConfig)
  }

  $('.start').click(function() {
    generateResult();
    refresh();
    $slotMachine.shuffle(5, function(result) {
      var winner = candidates[result];
      console.log("Winner: ", winner);
      winners.push(winner.index);
      $winner.text(winner.name);
    });
  });

  reload();
});
