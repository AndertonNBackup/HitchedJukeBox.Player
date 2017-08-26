import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { SocketService } from '../socket/socket.service';

import { NowPlayingRequest } from '../models/shared/now-playing/now-playing-request';
import { NowPlayingResponse } from '../models/shared/now-playing/now-playing-response';

@Injectable()
export class NowPlayingService {

    public static appPrefix: string = "HJBV";
    public static servicePrefix: string = 'NowPlaying';

    constructor(private socket: SocketService) {

    }

    talk(nowPlayingRequest: NowPlayingRequest):void {
        let nowPlayingHook = NowPlayingRequest.fetchCommandHook(NowPlayingService.appPrefix, NowPlayingService.servicePrefix);
        this.socket.sendMessage(nowPlayingHook, nowPlayingRequest);
    }

    listen(responseHook: string): Observable<any> {
        return this.socket.getMessages(responseHook);
    };

}