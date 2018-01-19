import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux';
import { Provider } from 'react-redux';

import io from 'socket.io-client';

import RTCApp from './rtc.App';
import reducers from './rtc.Reducers';

const protocol = location.protocol == 'https:' ? 'wss:' : 'ws:';
const domain = document.domain;
const port = location.port;

const socket = io(`${protocol}//${domain}:${port}/webrtc`);

ReactDOM.render(
    <Provider store={createStore(reducers, {})}>
        <RTCApp
            socket={socket} />
    </Provider>,
    document.getElementById('root')
);