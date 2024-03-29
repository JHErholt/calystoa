export default class Ele { // Denne fil er taget fra et tidligere projekt
  static make(tagName, props, nest) {
    let el = document.createElement(tagName);
    if (props) {
      for (let name in props) {
        if (name.indexOf("on") === 0) {
          el.addEventListener(name.substring(2).toLowerCase(), props[name], false);
        } else if (typeof props[name] === "function") {
          if (name == "function") {
            if (props[name].call() != "") {
              el.setAttribute(props[name].call(), "");
            }
          } else {
            el.setAttribute(name, props[name].call());
          }
        } else {
          el.setAttribute(name, props[name]);
        }
      }
    }
    if (nest == null) {
      return el;
    } else if (nest instanceof Function) {
      return Ele.#nester(el, nest.call());
    } else {
      return Ele.#nester(el, nest);
    }
  }

  static #nester(el, n) {
    if (n instanceof Array) {
      n.forEach((element) => {
        if (n instanceof Array) {
          Ele.#nester(el, element)
        }
        else {
          el.appendChild(element);
        }
      });
    } else if (n instanceof Object) {
      el.appendChild(n);
    }
    else {
      if (typeof n == 'string' && n.toString().includes('\\n')) {
        let lastElement = n.split('\\n')[n.split('\\n').length - 1];
        n.split('\\n').map((element) => {
          el.appendChild(document.createTextNode(element));
          if (element != lastElement) {
            el.appendChild(Ele.make('br', { style: 'content: " "; display: block; margin: 20px 0;' }, ''));
          }
        });
      } else {
        el.appendChild(document.createTextNode(n));
      }
    }
    return el;
  }
}