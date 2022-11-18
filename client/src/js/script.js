import Ele from './utils/ele.js';

// Open profile info when clicked on profile picture
if (document.querySelector('#profileImage')) {
  document.querySelector('#profileImage').addEventListener('click', () => {
    document.querySelector('#profileInfo').classList.toggle('hidden');
  });
}

let dangerArr = document.querySelectorAll('.danger');
dangerArr.forEach(danger => {
  danger.addEventListener('click', () => {
    if (!confirm('Are you sure?')) {
      event.preventDefault();
    }
  });
});


// Animation element
let observeSpan = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animated-span--done');
      observeSpan.unobserve(entry.target);
    }
  });
});

let observeParent = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      let delay = 0;
      entry.target.classList.forEach((item) => { item.match(/\d/) ? delay = item : null });
      setTimeout(() => {
        entry.target.classList.add('animated-underline--done');
      }, delay * 0.2 * 1000);
      observeParent.unobserve(entry.target);
    }
  });
});

let observeContainer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('animated-container--done');
      }, 0.2 * 1000);
      observeParent.unobserve(entry.target);
    }
  });
});

let animateArr = document.querySelectorAll('.animate');
animateArr.forEach(element => {
  buildAnimatedElement(element);
});

function buildAnimatedElement(element) {
  let elementContent = element.textContent;

  if (element.classList.contains('text')) {
    if (element.classList.contains('underline')) {
      element.classList.add('animated-underline');
    }

    element.textContent = '';
    return createSentence(element, elementContent);
  }
  if (element.classList.contains('container')) {
    let direcetion = '';
    if (element.classList.contains('rightwards')) {
      direcetion = 'rightwards';
    } else if (element.classList.contains('leftwards')) {
      direcetion = 'leftwards';
    }
    element.classList.add(`animated-container--${direcetion}`);

    if (element.classList.contains('onscroll')) {
      observeContainer.observe(element);
    } else {
      setTimeout(() => {
        element.classList.add('animated-container--done');
      }, 0.2 * 1000);
    }
  }


}

function createSentence(element, text) {
  text.split(' ').map((word, index) => {
    addWord(word, index, element);
  });
  if (element.classList.contains('underline')) {
    element.classList.add(`${text.split(' ').length}`);
    if (element.classList.contains('onscroll')) {
      observeParent.observe(element);
    } else {
      setTimeout(() => {
        element.classList.add('animated-underline--done');
      }, text.split(' ').length * 0.2 * 1000);
    }
  }
}

function addWord(text, index, parent) {
  let isOnscroll = parent.classList.contains('onscroll');
  let direcetion = '';
  if (parent.classList.contains('rightwards')) {
    direcetion = 'rightwards';
  } else if (parent.classList.contains('leftwards')) {
    direcetion = 'leftwards';
  } else if (parent.classList.contains('upwards')) {
    direcetion = 'upwards';
  } else if (parent.classList.contains('downwards')) {
    direcetion = 'downwards';
  }
  let word = createWord(text, index, isOnscroll, direcetion);

  parent.appendChild(word);
}

function createWord(text, index, isOnscroll, direcetion) {
  let word = document.createElement('span');
  word.classList.add(`animated-span--${direcetion}`);
  if (isOnscroll) {
    observeSpan.observe(word);
  } else {
    setTimeout(() => {
      word.classList.add('animated-span--done');
    }, 1);
  }
  word.textContent = text;
  word.style.transitionDelay = `${(index + 1) * 0.2}s`;

  return word;
}