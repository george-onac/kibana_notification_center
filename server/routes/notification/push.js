import { extend } from 'lodash';
import Joi from 'joi';
import moment from 'moment';
import { constants } from '../../lib/constants';
import { parseWithTimestamp } from '../../lib/parse_index_pattern';

export function push(server) {
  const index = server.config().get('notification_center.index');
  const type = 'notification';
  const { callWithRequest } = server.plugins.elasticsearch.getCluster('data');

  server.route({
    path: `${constants.API_BASE_URL}/notification`,
    method: ['POST', 'PUT'],
    handler(request, reply) {
      pushNotification(request)
      .then(resp => {
        reply(resp);
      })
      .catch(err => {
        reply(err);
      });
    },
    config: {
      validate: {
        payload: Joi.object({
          type: Joi.string().only('error', 'warning', 'info').default('info'),
          content: Joi.string().required()
        })
      }
    }
  });

  server.expose('pushNotification', (request) => pushNotification(request));
  function pushNotification(request) {
    return new Promise((resolve,reject) => {
      const { payload } = request;
      const timestamp = Date.now();
      callWithRequest(request, 'index', {
        index: parseWithTimestamp(index, moment(timestamp)),
        type,
        body: extend(payload, { timestamp })
      })
      .then(resp => {
        resolve(constants.RESPONSE.OK);
      })
      .catch(err => {
        reject(err);
      });
    })
  }

};
