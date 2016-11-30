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
 */
export default (stateToComputed=() => ({}), dispatchToActions=() => ({})) => {

  return Route => {

    return Route.extend({

      redux: service(),

      getCurrentParams(controller) {
        return Object.assign({},
          this.paramsFor(this.routeName), controller.getProperties(controller.queryParams)
        );
      },

      setupController(controller) {
        const redux = this.get('redux');
        const params = this.getCurrentParams(controller);
        const props = stateToComputed(redux.getState(), params);

        Object.keys(props).forEach(name => {
          defineProperty(controller, name, computed(() =>
            stateToComputed(redux.getState(), this.getCurrentParams(controller))[name]
          ).property().readOnly());
        });

        if (!isEmpty(Object.keys(props))) {
          this.unsubscribe = redux.subscribe(() => {
            run(() => this.handleChange(controller));
          });
          Object.keys(params).forEach(param => {
            if (controller.queryParams.includes(param)) {
              controller.addObserver(param, () => {
                run(() => this.handleChange(controller));
              });
            }
          });
        }

        controller.actions = Object.assign({},
          controller.actions, dispatchToActions(redux.dispatch.bind(redux), params)
        );

        this._super(...arguments);
      },

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
