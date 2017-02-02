(function() {
/* DOM */
var imageDOM = document.getElementById('photo');
var caption = document.getElementById('caption');
var input = document.querySelector('input[type=text]');
var upload = document.querySelector('input[type=file]');
var errorText = document.querySelector('.error');
var loader = document.getElementById('loader');

var willScale = false;
var scaleFactor = 1;

/* Page and image setup */
var currentImage = '';

var photos = {
	bubble: {
		caption: 'Soap Bubble',
		url: 'images/bubble.jpg'
	},
	sf: {
		caption: 'SF Bay Bridge',
		url: 'images/sf.jpg'
	},
	bride: {
		caption: 'विवाह',
		url: 'images/bride.jpg'
	},
	latte: {
		caption: 'Caffè latte',
		url: 'images/latte.jpg'
	},
	cats: {
		caption: 'Kitties',
		url: 'images/cats.jpg'
	}
};

if(location.hash === '') { // default
	setImage('cats');
} else {
	var imageName = location.hash.substr(1);
	setImage(imageName);
}

window.addEventListener('hashchange', function(e) {
	var imageName = location.hash.substr(1);
	setImage(imageName);
}, false);

input.addEventListener('keyup', function(e) {
	if (e.keyCode === 13) {
		if(input.value === '') return;
		errorText.textContent = '';
		caption.textContent = 'an image from web';
		loadImageFromWeb(input.value);
  }
}, false);

upload.addEventListener('change', function(e) {
	errorText.textContent = '';
	caption.textContent = 'an image from HD';
	loadImageFromDisk(e);
}, false);

function setImage(imageName) {
	willScale = false;
	currentImage = new Image();
	currentImage.src = photos[imageName].url;
	imageDOM.src = photos[imageName].url;
	caption.textContent = photos[imageName].caption;
}

function imageError(error) {
	console.log(error)
	errorText.innerHTML = 'An invalid URL.<br> Possibly blocked by CORS policy.';
	imageDOM.src = 'images/fail.png'
}

function loadImageFromWeb(imageUrl) {
	currentImage = new Image();
  currentImage.crossOrigin = 'Anonymous';
  currentImage.onerror = imageError;
	currentImage.onload = function() {
		imageDOM.src = imageUrl;
		checkImageDimension();
	}
	currentImage.src = imageUrl;
}

function loadImageFromDisk(event) {
	console.log(event)
  var reader = new FileReader();
  reader.onload = function(e) {
   	currentImage = new Image();
   	imageDOM.src = e.target.result;
   	currentImage.onload = function() {
			checkImageDimension();
		}
   	currentImage.src = e.target.result;
  };       
  reader.readAsDataURL(event.target.files[0]);
}

function checkImageDimension() {
	if(currentImage.width > 1000 || currentImage.height > 1000) {
		willScale = true;
		scaleFactor = 1000 / Math.max(currentImage.width, currentImage.height);
	} else {
		willScale = false;
	}
}

function show(loader) {
	loader.removeAttribute('hidden');
}

function hide(loader) {
	loader.setAttribute('hidden', 'hidden');
}

/* Insta-fy the selected image */

document.getElementById('filterButtons').addEventListener('click', prepFilterEffect, false);

function prepFilterEffect(e) {
	show(loader);

	var filterButton = getFilterButton(e.target);
	if(!filterButton) return;

	var options = (willScale) ? {scale: scaleFactor} : null;

	var promise = new Promise(function(resolve) {
		setTimeout(function() {
			var f = filterous.importImage(currentImage, options)
			.applyInstaFilter(filterButton.id)
	    .renderHtml(imageDOM);
	    resolve(f);
		}, 1);
	});
	
	promise.then(function() {
		hide(loader);
	});

}
function getFilterButton(target) {
	var button;
	if(target.classList.contains('filter')) {
		button = target;
	} else if (target.parentNode.classList.contains('filter')) {
		button = target.parentNode;
	}
	return button;
}

})();