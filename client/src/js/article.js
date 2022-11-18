import Ele from './utils/ele.js';

const HIDDEN_INPUT = document.querySelector('[type="hidden"][name=content]');

containerSidebar();
textareaHandler();
addContentHandler();

document.querySelectorAll('textarea').forEach(textarea => {
  saveTextareaValue(textarea);
});

function containerSidebar() {
  let containers = document.querySelectorAll('.container--editor');
  containers.forEach((container, i) => {
    container.addEventListener('click', e => {
      let containerNum = undefined;
      let columnNum = undefined;
      let contentNum = undefined;

      if (e.target.closest('.container')) {
        containerNum = e.target.closest('.container').dataset.container;
      }
      if (e.target.closest('.column')) {
        columnNum = e.target.closest('.column').dataset.column;
      }
      if (e.target.closest('.content')) {
        contentNum = e.target.closest('.content').dataset.content;
      }

      if (!containerNum || !columnNum) {
        return;
      }

      // Check if the container is already selected
      if (document.querySelector(`.container-details[data-container="${containerNum}"][data-column="${columnNum}"][data-content="${contentNum}"]`)) {
        return;
      } else if (document.querySelector('.container-details')) {
        document.querySelectorAll('.container-details').forEach(containerDetail => {
          if (containerDetail.dataset.container != containerNum || containerDetail.dataset.column != columnNum || containerDetail.dataset.content != contentNum) {
            containerDetail.style.right = '-20%';
            setTimeout(() => {
              containerDetail.remove();
            }, 300)
          }
        });
      }

      // Create the container details
      let sidebar = Ele.make('aside', { class: `container-details`, 'data-container': containerNum, 'data-column': columnNum, 'data-content': contentNum, style: 'right: -20%;' }, [
        Ele.make('span', { class: "container-details__close", onclick: () => { document.querySelector('.container-details').style.right = '-20%'; setTimeout(() => { document.querySelector('.container-details').remove(); }, 300) } }, 'X'),
      ]);
      // Create the container options
      let containerOptions = Ele.make('div', { class: 'container__options' }, [
        Ele.make('h2', { class: 'container-details__title' }, `Container ${Number(containerNum) + 1}`),
      ]);
      // Create options
      containerOptions.appendChild(createOptions('Width of container', ['half', 'full'], 'containerWidth', 'radio'));
      containerOptions.appendChild(createOptions('Space inside the container', ['none', 'small', 'medium', 'large'], 'containerPadding', 'radio'));

      containerOptions.appendChild(Ele.make('button', { class: 'button button--danger', onclick: () => { deleteContainer(container) } }, 'Delete container'));

      sidebar.appendChild(containerOptions);

      // Create the column options
      let columnOptions = Ele.make('div', { class: 'column__options' }, [
        Ele.make('h2', { class: 'container-details__title' }, `Column ${Number(columnNum) + 1}`),
      ]);
      // Create options
      columnOptions.appendChild(createOptions('Align items in the column', ['start', 'center', 'end'], 'columnAlign', 'radio'));
      sidebar.appendChild(columnOptions);

      // Create the content options
      if (contentNum) {
        let column = document.querySelector(`.container[data-container="${containerNum}"] .column[data-column="${columnNum}"]`);
        let content = column.querySelector(`.content[data-content="${contentNum}"]`);

        var contentClasses = ['underline', 'bold', 'italic'];
        let contentOptions = Ele.make('div', { class: 'content__options' }, [
          Ele.make('h2', { class: 'container-details__title' }, `Content ${Number(contentNum) + 1}`),
        ]);
        // Create options
        contentOptions.appendChild(createOptions('Tag', ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'], 'contentTag', 'radio'));
        contentOptions.appendChild(createOptions('Styling', contentClasses, 'contentClass', 'checkbox'));

        contentOptions.appendChild(Ele.make('button', { class: 'button button--danger', onclick: () => { deleteContent(content) } }, 'Delete content'));


        sidebar.appendChild(contentOptions);
      }

      // Prepend the sidebar
      document.querySelector('#page').prepend(sidebar);

      // Give options the functionality
      functionalizeOptions(container, 'container', ['half', 'full'], 'width');
      functionalizeOptions(container, 'container', ['none', 'small', 'medium', 'large'], 'padding');

      let column = container.querySelector(`.column[data-column="${columnNum}"]`);

      functionalizeOptions(column, 'column', ['start', 'center', 'end'], 'align');

      if (contentNum) {
        let content = column.querySelector(`.content[data-content="${contentNum}"]`);

        document.querySelectorAll('[name="contentTag"]').forEach(radio => {
          let label = document.querySelector(`[for="${radio.id}"]`);
          if (content.classList.contains(radio.value)) {
            radio.checked = true;
            label.classList.add('selected');
          }
          radio.addEventListener('change', e => {
            ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].forEach(tag => {
              let label = document.querySelector(`[for="contentTag${tag}"]`);
              label.classList.remove('selected');
              content.classList.remove(tag.toLowerCase());
            });
            content.classList.add(radio.value);
            label.classList.add('selected');
            updateHiddenInputContentTag(content)
          });
        });

        // Give the options the functionality (special for options with multiple values)
        document.querySelectorAll('[name="contentClass"]').forEach(checkbox => {
          let label = document.querySelector(`[for="${checkbox.id}"]`);
          if (content.classList.contains(checkbox.value)) {
            checkbox.checked = true;
            label.classList.add('selected');
          }
          checkbox.addEventListener('change', e => {
            content.classList.toggle(e.target.value);
            label.classList.toggle('selected');
            updateHiddenInputContentClass(content)
          });
        });
      }


      function createOptions(title, options, type, inputType) {
        let optionsWrapper = Ele.make('div', { class: 'container-details__option' }, [
          Ele.make('h3', {}, title),

        ]);
        let optionsContainer = Ele.make('div', { class: 'options' }, '');
        options.forEach(option => {
          let capitalizedOption = option.charAt(0).toUpperCase() + option.slice(1);
          optionsContainer.append(Ele.make('label', { class: 'label', id: `${type}${capitalizedOption}__label`, for: `${type}${capitalizedOption}` }, capitalizedOption));
          optionsContainer.append(Ele.make('input', { class: 'hidden', id: `${type}${capitalizedOption}`, type: inputType, name: `${type}`, value: option }));
        });
        optionsWrapper.append(optionsContainer);
        return optionsWrapper;
      }


      function functionalizeOptions(element, elementClass, options, type,) {
        let capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
        let optionsContainer = document.querySelectorAll(`input[name=${elementClass}${capitalizedType}]`);
        optionsContainer.forEach(option => {
          if (element.classList.contains(`${elementClass}__${type}--${option.value}`)) {
            option.checked = true;
            document.querySelector(`#${elementClass}${capitalizedType}${option.value[0].toUpperCase() + option.value.slice(1)}__label`).classList.add('selected');
          }
          option.addEventListener('change', e => {
            options.forEach(optionName => {
              let label = document.querySelector(`[for=${elementClass}${capitalizedType}${optionName.charAt(0).toUpperCase() + optionName.slice(1)}]`);
              label.classList.remove('selected');
              element.classList.remove(`${elementClass}__${type}--${optionName}`);
            });
            document.querySelector(`#${e.target.id}__label`).classList.add('selected');
            element.classList.add(`${elementClass}__${type}--${e.target.value}`);
            if (elementClass === 'container') {
              updateHiddenInputContainerClass(element);
            } else if (elementClass === 'column') {
              updateHiddenInputColumnClass(element);
            } else if (elementClass === 'content') {
              updateHiddenInputContentClass(element);
            }
          });
        });
      }

      function deleteContainer(container) {
        let containerNum = container.dataset.container;

        let containers = JSON.parse(HIDDEN_INPUT.value);
        delete containers[containerNum];

        container.remove();
        document.querySelector('.container-details').style.right = '-20%';
        setTimeout(() => {
          document.querySelector('.container-details').remove();
        }, 300);

        let i = 0;
        Object.entries(containers).forEach(([key, value]) => {
          document.querySelector(`.container[data-container="${key}"]`).dataset.container = i

          delete containers[key];
          containers[i] = value;
          i++;
        });

        HIDDEN_INPUT.value = JSON.stringify(containers);
      }

      function deleteContent(content) {
        let containerNum = content.closest('.container').dataset.container;
        let columnNum = content.closest('.column').dataset.column;
        let contentNum = content.dataset.content;

        let containers = JSON.parse(HIDDEN_INPUT.value);
        delete containers[containerNum].columns[columnNum].content[contentNum];

        content.remove();
        document.querySelector('.container-details').style.right = '-20%';
        setTimeout(() => {
          document.querySelector('.container-details').remove();
        }, 300);

        let i = 0;
        Object.entries(containers[containerNum].columns[columnNum].content).forEach(([key, value]) => {
          let containerElement = document.querySelector(`.container[data-container='${containerNum}']`);
          console.log(containerElement);
          let columnElement = containerElement.querySelector(`.column[data-column='${columnNum}']`);
          console.log(columnElement);
          columnElement.querySelector(`.content[data-content='${key}']`).dataset.content = i
          console.log(columnElement.querySelector(`.content[data-content='${key}']`).dataset.content = i)

          delete containers[containerNum].columns[columnNum].content[key];
          containers[containerNum].columns[columnNum].content[i] = value;
          i++;
        });

        HIDDEN_INPUT.value = JSON.stringify(containers);

      }




      function updateHiddenInputContainerClass(container) {
        let containerNum = Number(container.dataset.container);
        let containerClass = container.classList.value.replace('container--editor', '').trim();

        let content = JSON.parse(HIDDEN_INPUT.value);
        content[containerNum].class = containerClass;

        HIDDEN_INPUT.value = JSON.stringify(content);
      };

      function updateHiddenInputColumnClass(column) {
        let containerNum = Number(column.closest('.container').dataset.container);
        let columnNum = Number(column.dataset.column);

        let content = JSON.parse(HIDDEN_INPUT.value);
        content[containerNum].columns[columnNum].class = column.classList.value;

        HIDDEN_INPUT.value = JSON.stringify(content);
      };
      function updateHiddenInputContentClass(content) {
        let containerNum = Number(content.closest('.container').dataset.container);
        let columnNum = Number(content.closest('.column').dataset.column);
        let contentNum = Number(content.dataset.content);

        let hiddenContent = JSON.parse(HIDDEN_INPUT.value);
        hiddenContent[containerNum].columns[columnNum].content[contentNum].class = content.classList.value;

        HIDDEN_INPUT.value = JSON.stringify(hiddenContent);
      };
      function updateHiddenInputContentTag(content) {
        let containerNum = Number(content.closest('.container').dataset.container);
        let columnNum = Number(content.closest('.column').dataset.column);
        let contentNum = Number(content.dataset.content);

        let hiddenContent = JSON.parse(HIDDEN_INPUT.value);
        let tag = [...content.classList].find(className => ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(className));
        hiddenContent[containerNum].columns[columnNum].content[contentNum].tag = tag;

        HIDDEN_INPUT.value = JSON.stringify(hiddenContent);
      };

      setTimeout(() => {
        document.querySelector('.container-details').style.right = '0';
      }, 100);
    });
  });
};

document.querySelector('#addContainer').addEventListener('click', e => {
  let createContainer = Ele.make('div', { class: 'container container--editor container__width--half container__padding--large container--new', 'data-container': document.querySelectorAll('.container').length }, [
    Ele.make('div', { class: 'option' }, [
      Ele.make('h3', { class: 'option__title' }, 'How many columns?'),
      Ele.make('div', { class: 'option__options' }, [
        Ele.make('button', {
          class: 'button', onclick: e => {
            let container = document.querySelector(`.container[data-container="${e.target.dataset.container}"]`);
            container.innerHTML = '';
            container.classList.remove('container--new');
            container.appendChild(Ele.make('div', { class: 'column column__align--center', 'data-container': container.dataset.container, 'data-column': 0 }, [
              Ele.make('div', { class: 'add-new-content' }, Ele.make('button', { class: 'button' }, Ele.make('i', { class: 'fas fa-plus' }, '')))
            ]));

            addContentHandler();
            addContainer(container);

          }, 'data-container': document.querySelectorAll('.container').length
        }, '1'),
        Ele.make('button', {
          class: 'button', onclick: e => {
            let container = document.querySelector(`.container[data-container="${e.target.dataset.container}"]`);
            container.innerHTML = '';
            container.classList.remove('container--new');
            for (let i = 0; i < 2; i++) {
              container.appendChild(Ele.make('div', { class: 'column column__align--center', 'data-container': container.dataset.container, 'data-column': i }, [
                Ele.make('div', { class: 'add-new-content' }, Ele.make('button', { class: 'button' }, Ele.make('i', { class: 'fas fa-plus' }, '')))
              ]));
            }
            addContentHandler();
            addContainer(container);
          }, 'data-container': document.querySelectorAll('.container').length
        }, '2'),
      ]),
    ]),
  ]);

  document.querySelector('#page main').insertBefore(createContainer, document.querySelector('.add-new-container'));
  containerSidebar();
});


function addContentHandler() {
  document.querySelectorAll('.add-new-content .button').forEach(button => {
    button.addEventListener('click', e => {
      let containerNum = e.target.closest('.container').dataset.container;
      let columnNum = e.target.closest('.column').dataset.column;

      let parent = '';
      let arrOfColumns = document.querySelectorAll(`.column[data-column="${columnNum}"]`);
      arrOfColumns.forEach(column => {
        if (column.closest('.container').dataset.container === containerNum) {
          parent = column;
        }
      });

      if (parent.querySelector('.content--new')) {
        return;
      }

      let lastElement = parent.lastElementChild;

      let createContent = Ele.make('div', { class: 'content content--new', 'data-content': parent.querySelectorAll('.content').length }, [
        Ele.make('div', { class: 'option' }, [
          Ele.make('h3', { class: 'option__title' }, 'What type of content?'),
          Ele.make('div', { class: 'option__options' }, [
            Ele.make('button', {
              class: 'button', onclick: e => {
                let content = parent.querySelector(`.content--new[data-content="${e.target.closest('.content').dataset.content}"]`);
                content.innerHTML = '';
                content.remove();
                console.log(parent)
                parent.insertBefore(Ele.make('textarea', { class: 'p content content__textarea', type: 'text', 'data-content': parent.querySelectorAll('.content').length }, ''), lastElement);

                textareaHandler();

              }
            }, 'Text'),
            // Ele.make('button', { class: 'button', for: 'contentImage', onclick: e => {
            //   let getContainer = document.querySelector(`.content[data-container="${containerNum}"][data-column="${columnNum}"]`);
            //   getContainer.innerHTML = '';
            //   getContainer.classList.remove('content--new');
            //   getContainer.appendChild(Ele.make('div', { class: 'content__image' }, Ele.make('input', { class: 'content__input', type: 'file', accept: 'image/*' }, '')));
            // }, 'data-container': containerNum, 'data-column': columnNum }, 'Image'),
          ]),
        ]),
      ]);

      parent.insertBefore(createContent, lastElement);


    });
  });
}

function textareaHandler() {
  document.querySelectorAll('textarea').forEach(textarea => {
    calcHeight(textarea);
    textarea.addEventListener('input', e => {
      calcHeight(textarea);
      saveTextareaValue(e.target);
    });
  });
}


function addContainer(container) {
  let containerNum = Number(container.dataset.container);

  let content = JSON.parse(HIDDEN_INPUT.value);

  let containerObj = { class: 'container container__width--half container__padding--large', columns: {} }

  let columns = container.querySelectorAll('.column');
  columns.forEach(column => {
    let columnNum = Number(column.dataset.column);
    containerObj.columns[columnNum] = { class: 'column column__align--center', content: {} };
  });

  content[containerNum] = containerObj;
  HIDDEN_INPUT.value = JSON.stringify(content);
}

function saveTextareaValue(target) {
  let containerNum = Number(target.closest('.container').dataset.container);
  let columnNum = Number(target.closest('.column').dataset.column);
  let targetNum = Number(target.closest('.content').dataset.content);

  let content = JSON.parse(HIDDEN_INPUT.value);

  if (content[containerNum].columns[columnNum].content[targetNum]) {
    content[containerNum].columns[columnNum].content[targetNum].text = target.value;
  } else {
    content[containerNum].columns[columnNum].content[targetNum] = { text: target.value, class: '', tag: 'p' };
  }

  HIDDEN_INPUT.value = JSON.stringify(content);
}



// Textarea Height
function calcHeight(textarea) {
  let style = textarea.currentStyle || window.getComputedStyle(textarea);

  let numberOfLineBreaks = (textarea.value.match(/\n/g) || []).length;
  // min-height + lines x line-height + padding + border
  let newHeight = 20 + numberOfLineBreaks * 20 + (parseInt(style.paddingTop) * 2) + (parseInt(style.borderTop * 2));
  return newHeight;
}
