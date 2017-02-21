(function($) {
	var all = $(".chooseWisely"),
		endTxt = $("span.g-rsp-end"),
		divC = $(".g-img-computer"),
		divY = $(".g-img-chosen"),
		winHld = $(".wins"),
		losHld = $(".losses"),
		tieHld = $(".ties");
  winHld.text(0);
  losHld.text(0);
  tieHld.text(0);
	$(".roundStatus").text('Click the picture to begin');
	$(".g-choose").click(function() {
		var choosen = $(this).parent().index(),
			userClone = $(".g-choose").eq(choosen).clone(),
			randChoos = Math.floor(Math.random() * 3),
			cpuClone = $(".g-choose").eq(randChoos).clone(),
			rndRule = $(".roundRule"),
			options = ['Rock', 'Paper', 'Scissors'];
		divC.add(divY).empty();
		$(".roundStatus").queue(function(i) {
			$(this).animate({
				opacity: 1
			}, 100).text(options[choosen] + " vs " + options[randChoos]);
			i()
		});
		divY.animate({
			opacity: 0
		}, 100).delay(100).queue(function(j) {
			divY.append(userClone).animate({
				opacity: 1
			}, 100);
			j()
		});
		divC.animate({
			opacity: 0
		}, 100).delay(100).queue(function(j) {
			divC.append(cpuClone).animate({
				opacity: 1
			}, 100);
			j()
		});
		if (choosen === randChoos) {
			rndRule.queue(function(j) {
				rndRule.text('It is a tie');
				tieHld.html(function(i, val) {
					return val * 1 + 1
				});
				j()
			})
		} else if (choosen === 0 && randChoos === 2 || choosen === 1 && randChoos === 0 || choosen === 2 && randChoos === 1) {
			rndRule.queue(function(j) {
				rndRule.text('You Win!');
				winHld.html(function(i, val) {
					return val * 1 + 1
				});
				j()
			})
		} else if (choosen === 0 && randChoos === 1 || choosen === 1 && randChoos === 2 || choosen === 2 && randChoos === 0) {
			rndRule.queue(function(j) {
				rndRule.text('You Lose');
				losHld.html(function(i, val) {
					return val * 1 + 1
				});
				j()
			})
		} else {}
	});
}(jQuery))
