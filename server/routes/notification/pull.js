import { defaults, set, get } from 'lodash';
import Joi from 'joi';
import moment from 'moment';
import { constants } from '../../lib/constants';
import { parseWithWildcard } from '../../lib/parse_index_pattern';

export function pull(server) {
  const index = parseWithWildcard(server.config().get('notification_center.index'));
  const { callWithRequest } = server.plugins.elasticsearch.getCluster('data');
  const { maxSize } = server.config().get('notification_center.api.pull');

  server.route({
    path: `${constants.API_BASE_URL}/notification`,
    method: 'GET',
    handler: async(request, h) => {
      const { size, from, to } = request.query.value;
      return new Promise((resolve) => {
        callWithRequest(request, 'search', {
          index,
          size,
          ignoreUnavailable: true,
          body: (() => {
            const rangeQueries = [];

            if (from) {
              rangeQueries.push(set({}, 'range.timestamp.gt', moment(from).valueOf()));
            }

            if (to) {
              rangeQueries.push(set({}, 'range.timestamp.lt', moment(to).valueOf()));
            }
            return rangeQueries.length ? set({}, 'query.bool.must', rangeQueries) : undefined;
          })()
        })
        .then(resp => {
          resolve(h.response(get(resp, 'hits.hits', []).map(hit => hit._source)));
        })
        .catch(h);
      });
    },
    config: {
      validate: {
        query: Joi.object({
          size: Joi.number().min(1).max(maxSize).default(maxSize),
          from: Joi.date().optional(),
          to: Joi.date().optional()
        }).default()
      }
    }
  });
};
