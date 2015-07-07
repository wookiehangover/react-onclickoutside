/**
 * A mixin for handling (effectively) onClickOutside for React components.
 * Note that we're not intercepting any events in this approach, and we're
 * not using double events for capturing and discarding in layers or wrappers.
 *
 * The idea is that components define function
 *
 *   handleClickOutside: function() { ... }
 *
 * If no such function is defined, an error will be thrown, as this means
 * either it still needs to be written, or the component should not be using
 * this mixing since it will not exhibit onClickOutside behaviour.
 *
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory);
  } else if (typeof exports === 'object') {
    // Node. Note that this does not work with strict
    // CommonJS, but only CommonJS-like environments
    // that support module.exports
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    root.OnClickOutside = factory();
  }
}(this, function () {
  "use strict";

  var IGNORE_CLASS = "ignore-react-onclickoutside";

  return {

    __outsideClickHandler: function(evt) {
      var localNode = this.getDOMNode();
      var source = evt.target;
      var found = false;
      // If source=local then this event came from "somewhere"
      // inside and should be ignored. We could handle this with
      // a layered approach, too, but that requires going back to
      // thinking in terms of Dom node nesting, running counter
      // to React's "you shouldn't care about the DOM" philosophy.
      while(source.parentNode) {
        found = (source === localNode || source.classList.contains(IGNORE_CLASS));
        if(found) {
          return;
        }
        source = source.parentNode;
      }
      this.handleClickOutside(evt);
    },

    componentDidMount: function() {
      if (!this.handleClickOutside) {
        throw new Error("Component lacks a handleClickOutside(event) function for processing outside click events.");
      }

      // If there is a truthy disableOnClickOutside property for this
      // component, don't immediately start listening for outside events.
      if (!this.props.disableOnClickOutside) {
        this.enableOnClickOutside();
      }
    },

    componentWillUnmount: function() {
      this.disableOnClickOutside();
    },

    /**
     * Can be called to explicitly enable event listening
     * for clicks and touches outside of this element.
     */
    enableOnClickOutside: function() {
      document.addEventListener("mousedown", this.__outsideClickHandler);
      document.addEventListener("touchstart", this.__outsideClickHandler);
    },

    /**
     * Can be called to explicitly disable event listening
     * for clicks and touches outside of this element.
     */
    disableOnClickOutside: function(fn) {
      document.removeEventListener("mousedown", this.__outsideClickHandler);
      document.removeEventListener("touchstart", this.__outsideClickHandler);
    }
  };

}));
