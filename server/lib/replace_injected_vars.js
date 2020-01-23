import { extend } from 'lodash';

export async function replaceInjectedVars(originalInjectedVars, request, server) {
	if(request.auth.isAuthenticated){
		const { callWithRequest } = server.plugins.elasticsearch.getCluster('data');
		return callWithRequest(request, 'info')
		.then(resp => extend(originalInjectedVars, {
			clusterUuid: resp.cluster_uuid
		}));
	} else {
		return originalInjectedVars;
	}
};

