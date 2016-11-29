# ember-redux-route-connect

[![CircleCI](https://circleci.com/gh/dustinfarris/ember-redux-route-connect.svg?style=svg)](https://circleci.com/gh/dustinfarris/ember-redux-route-connect)

Connect your routes to redux state/dispatch with queryParams.


## Installation

[ember-redux](https://github.com/toranb/ember-redux) is required.

```
ember install ember-redux-route-connect
```


## Usage

This works the same way as connected components in ember-redux, but the `stateToComputed` and `dispatchToActions` functions will be provided redux state _and_ the current params for the route.

`params` will be an object containing URL parameters, and any [`queryParams`](http://emberjs.com/api/classes/Ember.Controller.html#property_queryParams) that you've defined in your controller (if any).


### Example

```javascript
import route from 'ember-redux/route';
import connect from 'ember-redux-route-connect';

// Maybe you have a fancy get by id in your reducer?
import { getItemById } from '../reducers';

const model = (dispatch, params) => {
  // Nothing new here, do some async work.. or don't
};

const stateToComputed = (state, params) => {
  return {
    item: getItemById(state, params.item_id)
  }
};

const dispatchToActions = (dispatch, params) => {
  return {
    deleteItem() {
      fetch(`/api/items${params.item_id}`, { method: 'DELETE' }).then(() => {
        dispatch({ type: 'REMOVE_ITEM', params.item_id });
      });
    }
  };
};

const ItemRoute = route({ model })(Route.extend({
}));

export default connect(stateToComputed, dispatchToActions)(ItemRoute);
```

Note: `connect` and `route` do not have to be used together if you don't need one or the other.

Your route's template would look much the same as a connected component's template/layout:

```hbs
{{#unless item}}
<p>
  This item has been deleted :(
</p>
{{else}}
  <h1>{{item.name}}</h1>
  <button {{action "deleteItem"}}>Delete Item</button>
{{/unless}}
```

Check out the dummy app for a little more.
