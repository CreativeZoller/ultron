(($ => {
    const divC = $(".g-img-computer");
    const divY = $(".g-img-chosen");
    const winHld = $(".wins");
    const losHld = $(".losses");
    const tieHld = $(".ties");
    winHld.text(0);
    losHld.text(0);
    tieHld.text(0);
    $(".roundStatus").text('Click the picture to begin');
    $(".g-choose").click(function() {
        const choosen = $(this).parent().index();
        const userClone = $(".g-choose").eq(choosen).clone();
        const randChoos = Math.floor(Math.random() * 3);
        const cpuClone = $(".g-choose").eq(randChoos).clone();
        const rndRule = $(".roundRule");
        const options = ['Rock', 'Paper', 'Scissors'];
        divC.add(divY).empty();
        $(".roundStatus").queue(function(i) {
			$(this).animate({
				opacity: 1
			}, 100).text(`${options[choosen]} vs ${options[randChoos]}`);
			i()
		});
        divY.animate({
			opacity: 0
		}, 100).delay(100).queue(j => {
			divY.append(userClone).animate({
				opacity: 1
			}, 100);
			j()
		});
        divC.animate({
			opacity: 0
		}, 100).delay(100).queue(j => {
			divC.append(cpuClone).animate({
				opacity: 1
			}, 100);
			j()
		});
        if (choosen === randChoos) {
			rndRule.queue(j => {
				rndRule.text('It is a tie');
				tieHld.html((i, val) => val * 1 + 1);
				j()
			})
		} else if (choosen === 0 && randChoos === 2 || choosen === 1 && randChoos === 0 || choosen === 2 && randChoos === 1) {
			rndRule.queue(j => {
				rndRule.text('You Win!');
				winHld.html((i, val) => val * 1 + 1);
				j()
			})
		} else if (choosen === 0 && randChoos === 1 || choosen === 1 && randChoos === 2 || choosen === 2 && randChoos === 0) {
			rndRule.queue(j => {
				rndRule.text('You Lose');
				losHld.html((i, val) => val * 1 + 1);
				j()
			})
		} else {}
    });
})(jQuery))
