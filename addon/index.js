import Ember from 'ember';

const {
  computed,
  defineProperty,
  inject: { service },
  isEmpty,
  run
} = Ember;

/**
 * Connect a Route to stateToComputed and dispatchToActions.
 *
 * This is the nearly the same implementation as ember-redux/components/connect,
 * except we pass `params` to stateToComputed and dispatchToActions.
 *
 * @function connect
 * @param function stateToComputed a function that takes state and params and
 *   returns a props object
 * @param function dispatchToActions a function that takes dispatch function
 *   and params
 */
export default (stateToComputed=() => ({}), dispatchToActions=() => ({})) => {

  return Route => {

    return Route.extend({

      redux: service(),

      /**
       * Merge the URL params and the queryParams
       *
       * @method getCurrentParams
       * @param controller the Controller associated with this route
       * @return Object object containing all relevant params
       */
      getCurrentParams(controller) {
        return Object.assign({},
          this.paramsFor(this.routeName), controller.getProperties(controller.queryParams)
        );
      },

      /**
       * Set up the initial props and add callbacks to handle future updates.
       *
       * @method setupController
       * @param Ember.Controller controller
       */
      setupController(controller) {
        const redux = this.get('redux');
        const params = this.getCurrentParams(controller);
        const props = stateToComputed(redux.getState(), params);

        // Add new props to the controller
        Object.keys(props).forEach(name => {
          defineProperty(controller, name, computed(() =>
            stateToComputed(redux.getState(), this.getCurrentParams(controller))[name]
          ).property().readOnly());
        });

        if (!isEmpty(Object.keys(props))) {
          // Subscribe to redux state updates
          this.unsubscribe = redux.subscribe(() => {
            run(() => this.handleChange(controller));
          });
          // Subscribe to param updates
          Object.keys(params).forEach(param => {
            if (controller.queryParams.includes(param)) {
              controller.addObserver(param, () => {
                run(() => this.handleChange(controller));
              });
            }
          });
        }

        // Add new actions to the controller
        controller.actions = Object.assign({},
          controller.actions, dispatchToActions(redux.dispatch.bind(redux), params)
        );

        this._super(...arguments);
      },

      /**
       * Generate new properties and notify if there are any changes.
       *
       * @method handleChange
       * @param Ember.Controller controller
       */
      handleChange(controller) {
        const redux = this.get('redux');
        const params = Object.assign({},
          this.paramsFor(this.routeName), controller.getProperties(controller.queryParams)
        );
        const props = stateToComputed(redux.getState(), params);

        Object.keys(props).forEach(name => {
          if (controller.get(name) !== props[name]) {
            controller.notifyPropertyChange(name);
          }
        });
      },

      /**
       * Unsubscribe from redux state changes
       *
       * @method deactivate
       */
      deactivate() {
        this._super(...arguments);
        if (this.unsubscribe) {
          this.unsubscribe();
          this.unsubscribe = null;
        }
      }
    });
  };
};
