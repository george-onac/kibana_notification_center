import { extend } from 'lodash';
import Joi from 'joi';
import moment from 'moment';
import { constants } from '../../lib/constants';
import { parseWithTimestamp } from '../../lib/parse_index_pattern';

export function push(server) {
  const index = server.config().get('notification_center.index');
  const { callWithRequest } = server.plugins.elasticsearch.getCluster('data');

  server.route({
    path: `${constants.API_BASE_URL}/notification`,
    method: ['POST', 'PUT'],
    handler: async (request, h) => {
      return new Promise((resolve) => {
        request.payload = request.payload.value;
        pushNotification(request)
        .then(resp => {
          resolve(h.response(resp));
        })
        .catch(err => {
          resolve(h.response(err).code(500));
        });
      })

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

      if(request.headers.authorization == 'countersight'){
        let dataCluster = server.plugins.elasticsearch.getCluster('admin');
        dataCluster.callWithInternalUser('index', {
          index: parseWithTimestamp(index, moment(timestamp)),
          body: extend(payload, { timestamp })
        })
        .then(resp => {
          resolve(constants.RESPONSE.OK);
        })
        .catch(err => {
          reject(err);
        });
      } else {
        callWithRequest(request, 'index', {
          index: parseWithTimestamp(index, moment(timestamp)),
          body: extend(payload, { timestamp })
        })
        .then(resp => {
          resolve(constants.RESPONSE.OK);
        })
        .catch(err => {
          reject(err);
        });
      }
    })
  }

};
