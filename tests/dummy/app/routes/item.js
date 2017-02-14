import Ember from 'ember';
import fetch from 'ember-network/fetch';
import route from 'ember-redux/route';
import connect from 'ember-redux-route-connect';

import { getItemById } from '../reducers';


const { Route } = Ember;


/**
 * `model()` will receive the dispatch function and params provided to the
 * route.  This is a good place to do async network stuff and then dispatch
 * results to redux.
 */
const model = (dispatch, params) => {

  fetch(`/api/items/${params.item_id}`, 'GET').then(response => {
    response.json().then(data => {
      dispatch({ type: 'RECEIVE_ITEM', data });
    });
  });

  return 'unrelated model stuff';

};


/**
 * `stateToComputed()` works the same way as it does for components, but again
 * receives a `params` argument.
 */
const stateToComputed = (state, params) => {

  Ember.Logger.debug(params);

  return {
    model: params.item_id,
    item: getItemById(state, params.item_id),
    computedQueryParam: params.testQuery
  };

};


/**
 * `dispatchToActions()`, again, acts the same as it would for a Component, but
 * receives a `params` argument.
 */
const dispatchToActions = (dispatch, params) => {

  return {
    edit(name) {
      fetch(`/api/items/${params.item_id}`, { method: 'PUT', body: JSON.stringify({ name })}).then(response => {
        response.json().then(data => {
          dispatch({ type: 'RECEIVE_ITEM', data });
        });
      });
    }
  };

};


const ItemRoute = route({ model })(Route.extend({
}));


export default connect(stateToComputed, dispatchToActions)(ItemRoute);
