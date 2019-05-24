'use strict';

import init from './init';

import {
    accountListName,
    callbackQueueName,
    trackerInstanceName,
    trackerVersionName,
    scriptPath,
} from './constants';

function ymProxy(id, methodName, ...args) {
    try {
        window[trackerInstanceName(id)][methodName](...args);
    } catch (ex) {
        console.warn(ex);
    }
}

function accountIdList() {
    return typeof window !== 'undefined' ? window[accountListName] : [];
}

function ymAsyncProxy(ids) {
    return function (...args) {
        ids.forEach(id => {
            let trackerVersion = window[trackerVersionName(id)];
            let callbackQueue = window[callbackQueueName(trackerVersion)];
            if (callbackQueue) {
                callbackQueue.push(() => ymProxy(id, ...args));
            } else {
                ymProxy(id, ...args);
            }
        });
    };
}

function ym(...args) {
    return ymAsyncProxy(accountIdList())(...args);
}

export function withId(counterId) {
    return withFilter(id => counterId === id);
}

export function withFilter(f) {
    return ymAsyncProxy(accountIdList().filter(f));
}

export function initialize(id, options = {}, version = '2') {
    init([id], options, version);

    let el = document.createElement('script');
    let attrs = {};

    el.type = 'text/javascript';
    el.async = true;
    el.src = scriptPath(version);

    Object.keys(attrs).map(i => {
        if (el.__proto__.hasOwnProperty(i)) {
            el.setAttribute(i, attrs[i]);
        }
    });

    const head = document.getElementsByTagName('head')[0];

    head.appendChild(el);
}

export default ym;
