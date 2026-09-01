import test from 'node:test';
import assert from 'node:assert/strict';
import {
    normalizeAppBase,
    toBrowserPath,
    toRouterPath,
    isAuthPath,
    resolveGuestExit,
    resolveHistoryBase,
    readBootBase,
} from '../src/router/base.js';

test('normalizeAppBase treats / and trailing slashes as root or area', () => {
    assert.equal(normalizeAppBase('/'), '/');
    assert.equal(normalizeAppBase('/panel/'), '/panel');
    assert.equal(normalizeAppBase('panel'), '/panel');
    assert.equal(normalizeAppBase(''), null);
    assert.equal(normalizeAppBase(undefined), null);
});

test('resolveHistoryBase uses explicit / as root and never infers /auth', () => {
    globalThis.__PINOOX__ = { url: { BASE: '/' } };
    assert.equal(resolveHistoryBase(), '/');
    assert.equal(readBootBase(), '/');

    globalThis.__PINOOX__ = { url: { BASE: '/panel/' } };
    assert.equal(resolveHistoryBase(), '/panel');

    globalThis.__PINOOX__ = {};
    assert.equal(resolveHistoryBase(), '/');
});

test('toBrowserPath / toRouterPath do not double the panel base', () => {
    const base = '/panel';
    assert.equal(toBrowserPath('/auth/login', base), '/panel/auth/login');
    assert.equal(toBrowserPath('/panel/auth/login', base), '/panel/auth/login');
    assert.equal(toRouterPath('/panel/auth/login', base), '/auth/login');
    assert.equal(toRouterPath('/auth/login', base), '/auth/login');
    assert.equal(toRouterPath('/panel/dashboard', base), '/dashboard');
    assert.equal(toRouterPath('/dashboard', '/'), '/dashboard');
});

test('isAuthPath matches login with or without BASE', () => {
    const panel = { base: '/panel', loginUrl: '/panel/auth/login' };
    assert.equal(isAuthPath('/panel/auth/login', panel), true);
    assert.equal(isAuthPath('/auth/login', panel), true);
    assert.equal(isAuthPath('/panel/auth', panel), true);
    assert.equal(isAuthPath('/panel/dashboard', panel), false);

    const root = { base: '/', loginUrl: '/auth/login' };
    assert.equal(isAuthPath('/auth/login', root), true);
    assert.equal(isAuthPath('/login', root), true);
    assert.equal(isAuthPath('/dashboard', root), false);
});

test('resolveGuestExit strips BASE and rejects auth redirects', () => {
    const opts = { base: '/panel', loginUrl: '/panel/auth/login' };
    assert.equal(resolveGuestExit('/panel/dashboard', opts), '/dashboard');
    assert.equal(resolveGuestExit('/dashboard', opts), '/dashboard');
    assert.equal(resolveGuestExit('/panel/auth/login', opts), null);
    assert.equal(resolveGuestExit('https://evil.test', opts), null);
    assert.equal(resolveGuestExit('//evil.test', opts), null);
});
