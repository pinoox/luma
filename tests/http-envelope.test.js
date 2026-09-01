import test from 'node:test';
import assert from 'node:assert/strict';
import { attachApiEnvelope, unwrapApiBody } from '../src/core/http/envelope.js';

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
