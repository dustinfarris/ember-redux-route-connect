import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | connected routes', {
  beforeEach() {
    server.get('/api/items/123', { id: 123, name: 'Item number one two three' });
  }
});

test('computed properties', assert => {
  visit('/item/123?testQuery=ABCDEFG');

  andThen(() => {
    assert.equal(currentURL(), '/item/123?testQuery=ABCDEFG', 'url should contain query');
    assert.equal(find('.item-name').text(), 'Item number one two three', 'redux state change should be rendered');
    assert.equal(find('.computed-query-param').text(), 'ABCDEFG', 'computed query params should be rendered');
    assert.equal(find('.model').text(), '123', 'computed model should pull from statesToCompute');
  });
});

test('actions', assert => {
  const done = assert.async();
  assert.expect(1);

  server.put('/api/items/123', (_schema, { requestBody }) => {
    assert.deepEqual(JSON.parse(requestBody), { name: 'Huzzah!' }, 'actions should fire');
    done();
  });

  visit('/item/123');

  fillIn('.item-name-edit', 'Huzzah!');
  click('.item-name-edit-submit');
});

test('changing query params', assert => {
  visit('/item/123?testQuery=ABCDEFG');

  fillIn('.query-param-edit', 'TUVWXYG');

  andThen(() => {
    assert.equal(currentURL(), '/item/123?testQuery=TUVWXYG', 'should be able to update query param');
    assert.equal(find('.computed-query-param').text(), 'TUVWXYG', 'updating query param should trigger rerender');
  });
});

test('adding query params when there were none', assert => {
  visit('/item/123');

  fillIn('.query-param-edit', 'TUVWXYG');

  andThen(() => {
    assert.equal(currentURL(), '/item/123?testQuery=TUVWXYG', 'should be able to add a query param');
    assert.equal(find('.computed-query-param').text(), 'TUVWXYG', 'adding query param should trigger rerender');
  });
});
