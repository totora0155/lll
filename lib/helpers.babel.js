import crypto from 'crypto';
import _ from 'lodash';
import actions from './actions';
import store from './store';

export function getToken(key) {
  const cachedToken = _.get(store.getState().token, key);
  if (cachedToken) {
    return cachedToken;
  }
  const token = crypto.randomBytes(5).toString('hex');
  store.dispatch(actions.cacheToken(token, key));
  return token;
}
