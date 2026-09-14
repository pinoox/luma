/**
 * Unwrap Pinoox API JSON envelopes:
 * { success: true, data, message, meta } → data
 * Error bodies { success: false, error } are returned unchanged.
 */
export function unwrapApiBody(body) {
    if (body == null || typeof body !== 'object') {
        return body;
    }

    if (body.success === false || body.error) {
        return body;
    }

    if (body.success === true && 'data' in body) {
        return body.data;
    }

    return body;
}

/**
 * Axios response interceptor — after this, `response.data` is the payload.
 */
export function attachApiEnvelope(client) {
    if (!client?.interceptors?.response) {
        return client;
    }
    if (client.__lumaApiEnvelope) {
        return client;
    }
    client.__lumaApiEnvelope = true;

    client.interceptors.response.use(
        (response) => {
            if (response?.data != null) {
                response.data = unwrapApiBody(response.data);
            }
            return response;
        },
        (error) => {
            const data = error?.response?.data;
            if (data != null && typeof data === 'object') {
                error.response.data = unwrapApiBody(data);
            }
            return Promise.reject(error);
        },
    );

    return client;
}

/**
 * Extract data payload from a Pinoox API response:
 * - Axios response object: unwrap response.data
 * - Pinoox envelope { success: true, data }: return data
 * - Raw data / already unwrapped: return as is
 */
export function unwrapResponse(response) {
    if (response == null) {
        return response;
    }

    if (
        typeof response === "object" &&
        "data" in response &&
        ("status" in response || "headers" in response || "config" in response)
    ) {
        return unwrapApiBody(response.data);
    }

    return unwrapApiBody(response);
}

export const unwrap = unwrapResponse;
