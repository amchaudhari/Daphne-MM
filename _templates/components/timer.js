{	
	// Add the link to instructions
	var timer = document.querySelector(".otree-timer p");
	a = document.createElement("a");
	// a.href = instructions_url;
	a.innerHTML="Scroll Down for Instructions <br>";
	a.style.cssFloat = "right";
	// a.target="_blank";
	// a.rel="noopener noreferrer";
	timer.appendChild(a) 

	p = document.createElement("p");
	p.innerHTML = page_instructions;
   	timer.appendChild(p)

}