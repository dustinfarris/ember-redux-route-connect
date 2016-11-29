export default (state={}, action={}) => {

  switch(action.type) {

    case 'RECEIVE_ITEM':
      const item = action.data;

      let nextState = Object.assign({}, state);
      nextState[item.id] = item;

      return nextState;

    default:
      return state;
  }
};


export const getById = (state, id) => state[id];
