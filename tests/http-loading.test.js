import test from 'node:test';
import assert from 'node:assert/strict';
import {
    attachHttpLoading,
    beginLocalLoading,
    configureHttpLoading,
    endLocalLoading,
    resetHttpLoading,
    shouldTrackRequest,
    useHttpLoading,
} from '../src/core/http/loading.js';

const flush = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));

function mockClient() {
    const request = [];
    const response = [];
    return {
        interceptors: {
            request: {
                use(ok, err) {
                    request.push({ ok, err });
                },
            },
            response: {
                use(ok, err) {
                    response.push({ ok, err });
                },
            },
        },
        request,
        response,
    };
}

test.afterEach(() => {
    resetHttpLoading();
});

test('shouldTrackRequest skips excluded urls and skipLoading', () => {
    configureHttpLoading({
        enabled: true,
        exclude: ['/pricing/fx/quotes', /\/auth\/me$/],
    });

    assert.equal(shouldTrackRequest({ url: '/products' }), true);
    assert.equal(shouldTrackRequest({ url: '/pricing/fx/quotes' }), false);
    assert.equal(shouldTrackRequest({ url: '/api/v1/auth/me' }), false);
    assert.equal(shouldTrackRequest({ url: '/products', skipLoading: true }), false);
});

test('interceptor shows after delay and hides when the last request ends', async () => {
    configureHttpLoading({ delay: 20 });
    const { visible, pending } = useHttpLoading();
    const client = mockClient();
    attachHttpLoading(client);

    const started = client.request[0].ok({ url: '/products' });
    assert.equal(started.__lumaTracked, true);
    assert.equal(pending.value, 1);
    assert.equal(visible.value, false);

    await flush(30);
    assert.equal(visible.value, true);

    await client.response[0].ok({ config: started });
    assert.equal(pending.value, 0);
    assert.equal(visible.value, false);
});

test('fast requests never flash the overlay', async () => {
    configureHttpLoading({ delay: 40 });
    const { visible } = useHttpLoading();
    const client = mockClient();
    attachHttpLoading(client);

    const started = client.request[0].ok({ url: '/products' });
    await client.response[0].ok({ config: started });
    await flush(50);
    assert.equal(visible.value, false);
});

test('attachHttpLoading is idempotent', () => {
    const client = mockClient();
    attachHttpLoading(client);
    attachHttpLoading(client);
    assert.equal(client.request.length, 1);
    assert.equal(client.response.length, 1);
});

test('a local loading surface suppresses the overlay', async () => {
    configureHttpLoading({ delay: 20 });
    const { visible, local } = useHttpLoading();
    const client = mockClient();
    attachHttpLoading(client);

    beginLocalLoading();
    assert.equal(local.value, 1);

    const started = client.request[0].ok({ url: '/products' });
    await flush(30);
    assert.equal(visible.value, false);

    await client.response[0].ok({ config: started });
    endLocalLoading();
    assert.equal(local.value, 0);
    assert.equal(visible.value, false);
});

test('overlay can appear after the local surface ends while HTTP is still pending', async () => {
    configureHttpLoading({ delay: 20 });
    const { visible } = useHttpLoading();
    const client = mockClient();
    attachHttpLoading(client);

    beginLocalLoading();
    const started = client.request[0].ok({ url: '/products' });
    endLocalLoading();
    assert.equal(visible.value, false);

    await flush(30);
    assert.equal(visible.value, true);

    await client.response[0].ok({ config: started });
    assert.equal(visible.value, false);
});
