import test from 'node:test';
import assert from 'node:assert/strict';
import { attachApiEnvelope, unwrapApiBody, unwrapResponse, unwrap } from '../src/core/http/envelope.js';
import { api, http } from '../src/core/auth/index.js';

function mockClient() {
    const response = [];
    return {
        interceptors: {
            response: {
                use(ok, err) {
                    response.push({ ok, err });
                },
            },
        },
        response,
    };
}

test('unwrapApiBody extracts success payload', () => {
    assert.deepEqual(
        unwrapApiBody({ success: true, data: { brands: [] }, message: 'OK', meta: {} }),
        { brands: [] },
    );
    assert.equal(unwrapApiBody({ success: true, data: null, message: 'OK' }), null);
});

test('unwrapApiBody keeps error envelope', () => {
    const err = { success: false, error: { code: 'X', message: 'fail' } };
    assert.deepEqual(unwrapApiBody(err), err);
});

test('attachApiEnvelope unwraps axios response.data', () => {
    const client = mockClient();
    attachApiEnvelope(client);
    const { ok } = client.response[0];
    const out = ok({ data: { success: true, data: { id: 1 }, message: 'OK' }, status: 200 });
    assert.deepEqual(out.data, { id: 1 });
});

test('unwrapResponse extracts payload from axios response', () => {
    const res = { status: 200, headers: {}, data: { id: 42, title: 'Test' } };
    assert.deepEqual(unwrapResponse(res), { id: 42, title: 'Test' });
});

test('unwrapResponse unwraps raw pinoox envelope inside axios response', () => {
    const res = { status: 200, headers: {}, data: { success: true, data: { items: [1, 2] }, message: 'OK' } };
    assert.deepEqual(unwrapResponse(res), { items: [1, 2] });
});

test('unwrapResponse unwraps raw envelope directly', () => {
    const envelope = { success: true, data: { user: 'admin' } };
    assert.deepEqual(unwrapResponse(envelope), { user: 'admin' });
});

test('unwrap alias is identical to unwrapResponse', () => {
    assert.equal(unwrap, unwrapResponse);
});

test('api proxy unwraps response data directly', async () => {
    http.get = async () => ({ status: 200, data: { success: true, data: { status: 'active' } } });
    http.post = async () => ({ status: 200, data: { count: 10 } });
    assert.deepEqual(await api.get('/test'), { status: 'active' });
    assert.deepEqual(await api.post('/count'), { count: 10 });
});