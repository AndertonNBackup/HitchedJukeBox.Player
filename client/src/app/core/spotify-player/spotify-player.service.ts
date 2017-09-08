import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions } from "@angular/http";

import { SpotifyPlayerOptions } from './spotify-player.options'
import { SpotifyPlayerToken } from '../models/shared/player/player-token'

@Injectable()
export class SpotifyPlayerService {

    private options: object;
    private listeners: object;
    private accessToken?: string;
    private exchangeHost: string;
    private obtainingToken: boolean;
    private loopInterval?: number;
    private expiresIn?: number;

    constructor(private http: Http) {
        this.options = {};
        this.listeners = {};
        this.accessToken = null;
        this.exchangeHost = 'http://localhost:8090';
        this.obtainingToken = false;
        this.loopInterval = null;
    }

    on(eventType: string, callback: any) {
        this.listeners[eventType] = this.listeners[eventType] || [];
        this.listeners[eventType].push(callback);
    }

    dispatch(topic: string, data: any) {
        const listeners: Array<any> = this.listeners[topic];
        if (listeners) {
            listeners.forEach(listener => {
                listener.call(null, data);
            });
        }
    }

    init() {
        this.fetchToken().then((r: any) => r.json()).then(json => {
            this.accessToken = json['access_token'];
            this.expiresIn = json['expires_in'];
            this._onNewAccessToken();
            console.log("Token Fetch : ");
            console.log(this);
        });
    }

    getAccessToken() {
        return this.accessToken;
    }

    getRefreshToken() {
        return localStorage.getItem('refreshToken');
    }

    fetchToken() {
        this.obtainingToken = true;
        return fetch(`${this.exchangeHost}/token`, {
            method: 'POST',
            body: JSON.stringify({
                refresh_token: localStorage.getItem('refreshToken')
            }),
            headers: new Headers({
                'Content-Type': 'application/json'
            })
        }).then(response => {
            this.obtainingToken = false;
            return response;
        }).catch(e => {
            console.error(e);
        });
    }

    _onNewAccessToken() {
        if (this.accessToken === '') {
            console.log('Got empty access token, log out');
            this.dispatch('login', null);
            this.logout();
        } else {
            const loop = () => {
                if (!this.obtainingToken) {
                    this.fetchPlayer()
                        .then((data: any) => {
                            if (data !== null && data.item !== null) {
                                this.dispatch('update', data);
                            }
                        })
                        .catch((e: any) => {
                            console.log('Logging user out due to error', e);
                            this.logout();
                        });
                }
            };
            this.fetchUser().then(user => {
                this.dispatch('login', user);
                this.loopInterval = setInterval(loop.bind(this), 1500);
                loop();
            });
        }
    }

    logout() {
        // clear loop interval
        if (this.loopInterval !== null) {
            clearInterval(this.loopInterval);
            this.loopInterval = null;
        }
        this.accessToken = null;
        this.dispatch('login', null);
    }

    login() {
        return new Promise((resolve, reject) => {
            const getLoginURL = (scopes: any) => {
                return `${this.exchangeHost}/login?scope=${encodeURIComponent(scopes.join(' '))}`;
            };

            const url = getLoginURL(['user-read-playback-state', 'user-modify-playback-state']);

            const width = 450, height = 730, left = screen.width / 2 - width / 2, top = screen.height / 2 - height / 2;

            window.addEventListener(
                'message',
                event => {
                    const hash = JSON.parse(event.data);
                    if (hash.type == 'access_token') {
                        this.accessToken = hash.access_token;
                        this.expiresIn = hash.expires_in;
                        this._onNewAccessToken();
                        if (this.accessToken === '') {
                            reject();
                        } else {
                            const refreshToken = hash.refresh_token;
                            localStorage.setItem('refreshToken', refreshToken);
                            resolve(hash.access_token);
                        }
                    }
                },
                false
            );

            const w = window.open(
                url,
                'Spotify',
                'menubar=no,location=no,resizable=no,scrollbars=no,status=no, width=' +
                width +
                ', height=' +
                height +
                ', top=' +
                top +
                ', left=' +
                left
            );
        });
    }

    fetchGeneric(url: string) {
        return fetch(url, {
            headers: { Authorization: 'Bearer ' + this.accessToken }
        });
    }

    sendGeneric(url: string, body: any, method: string = 'put') {
        return fetch(url, {
            method: method,
            headers: { Authorization: 'Bearer ' + this.accessToken },
            body: JSON.stringify(body)
        });
    }

    fetchPlayer(): any {
        return this.fetchGeneric('https://api.spotify.com/v1/me/player').then(response => {
            if (response.status === 401) {
                return this.fetchToken()
                    .then((tokenResponse: any) => {
                        if (tokenResponse.status === 200) {
                            return tokenResponse.json();
                        } else {
                            throw 'Could not refresh token';
                        }
                    })
                    .then(json => {
                        this.accessToken = json['access_token'];
                        this.expiresIn = json['expires_in'];
                        return this.fetchPlayer();
                    });
            } else if (response.status >= 500) {
                // assume an error on Spotify's site
                console.error('Got error when fetching player', response);
                return null;
            } else {
                return response.json();
            }
        });
    }

    fetchDevices(): any {
        return this.fetchGeneric('https://api.spotify.com/v1/me/player/devices').then(response => {
            return response.json();
        });
    }

    setDevice(deviceID: string): any {
        return this.sendGeneric('https://api.spotify.com/v1/me/player', { device_ids: [deviceID] }).then(response => {
            return response.status == 204 ? true : false;
            //return response.json();
        });
        // return fetch('https://api.spotify.com/v1/me/player', {
        //     method: 'put',
        //     headers: { Authorization: 'Bearer ' + this.accessToken },
        //     body: JSON.stringify({device_ids:[deviceID]})
        // }).then(response => {
        //     return response.json();
        // });
    }

    playerBack() {
        return this.sendGeneric('https://api.spotify.com/v1/me/player/previous', {}, 'post').then(response => {

        });
    }

    playerPause() {
        return this.sendGeneric('https://api.spotify.com/v1/me/player/pause', {}).then(response => {

        });
    }

    playerPlay() {
        return this.sendGeneric('https://api.spotify.com/v1/me/player/play', {}).then(response => {

        });
    }

    playerForward() {
        return this.sendGeneric('https://api.spotify.com/v1/me/player/next', {}, 'post').then(response => {

        });
    }

    fetchUser() {
        return this.fetchGeneric('https://api.spotify.com/v1/me').then(data => data.json());
    }

}