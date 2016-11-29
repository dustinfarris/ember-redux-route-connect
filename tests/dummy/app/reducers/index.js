import items, * as fromItems from './items';


export default {
  items
};


export const getItemById = (state, id) =>
  fromItems.getById(state.items, id);
