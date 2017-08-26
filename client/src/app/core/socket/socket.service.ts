import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { AuthenticationService, Credentials } from '../authentication/authentication.service';
import * as io from 'socket.io-client';

@Injectable()
export class SocketService {
    private url: string = process.env.API_URL || 'ws://0.0.0.0:';
    private port: number = parseInt(process.env.API_PORT) || 8080;
    private socket: SocketIOClient.Socket;
    private authentication: AuthenticationService;

    constructor(authentication: AuthenticationService) {
        this.authentication = authentication;
        this.connectIO();
    }

    connectIO(): SocketService {
        let credentials: Credentials = this.authentication.credentials;

        this.socket = io.connect(this.url + this.port);
        
        this.socket.on('disconnect', (reason: string) => {
            this.socket = null;
        });

        this.socket.emit('recieveUserName', { name: credentials.username });
        return this;
    }

    private gotSocket(): boolean {
        return this.socket ? true : false;
    }

    public sendMessage(id: string, message: object) {
        if(!this.gotSocket()) {
            this.connectIO();
        }
        this.socket.emit(id, message);
    }

    public getMessages(hook: string): Observable<any> {
        if(!this.gotSocket()) {
            this.connectIO();
        }
        let observable = new Observable(observer => {
            this.socket.on(hook, (data: object) => {
                observer.next(data);
            });

            return () => {
                this.socket.disconnect();
            };
        })
        return observable;
    }
}